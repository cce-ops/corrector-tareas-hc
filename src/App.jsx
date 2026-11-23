/**
 * App principal del Corrector de Tareas — Huella de Carbono.
 *
 * Flujo:
 *  1. El profesor sube uno o varios Excel de alumnos (.xlsx).
 *  2. Para cada uno se lee 1-INVENTARIO y 2-CÁLCULO, se corrigen con reglas duras
 *     y se calcula una nota sobre 10.
 *   3. Se muestra un acta grupal y se puede ver el detalle de cada alumno.
 *
 * Todo es frontend (no hay backend ni base de datos).
 */
import { useState, useCallback } from 'react';
import { DEFAULT_FACTORES } from './lib/factores.js';
import {
  leerArchivo,
  extraerDatosAlumno,
} from './lib/xlsxReader.js';
import { corregirAlumno } from './lib/reglas.js';
import UploadZone from './components/UploadZone';
import ActaView from './components/ActaView';
import ReporteAlumno from './components/ReporteAlumno';

export default function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [factores, setFactores] = useState(DEFAULT_FACTORES);
  const [vista, setVista] = useState('inicio'); // 'inicio' | 'acta' | 'detalle'
  const [seleccionado, setSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);

  /**
   * Obtiene el nombre del alumno de la celda A1 de la hoja de inventario.
   */
  const obtenerNombreAlumno = useCallback((workbook, hojaInventario) => {
    if (!hojaInventario) return null;
    const ws = workbook.Sheets[hojaInventario];
    if (!ws) return null;
    const v = ws['A1'] ? ws['A1'].v : null;
    return v && String(v).trim() ? String(v).trim() : null;
  }, []);

  const corregirArchivo = async (file) => {
    const workbook = await leerArchivo(file);
    const datos = extraerDatosAlumno(workbook);

    // Nombre del alumno: celda A1 de la hoja de inventario; fallback = nombre de archivo
    const nombreHoja = datos.nombreHojaInventario;
    const nombreDelAlumno =
      obtenerNombreAlumno(workbook, nombreHoja) ||
      file.name.replace(/\.(xlsx|xls)$/i, '');

    const resultado = corregirAlumno({
      inventario: datos.inventario,
      calculo: datos.calculo,
      factores,
    });

    return {
      nombre: nombreDelAlumno,
      archivo: file,
      resultado,
      hojaInventario: nombreHoja,
    };
  };

  const manejarSubida = async (archivos) => {
    setCargando(true);
    try {
      const corregidos = await Promise.all(archivos.map(corregirArchivo));
      setAlumnos((previos) => [...previos, ...corregidos]);
      setVista('acta');
    } finally {
      setCargando(false);
    }
  };

  const limpiarTodo = () => {
    setAlumnos([]);
    setVista('inicio');
    setSeleccionado(null);
  };

  const verDetalle = (a) => {
    setSeleccionado(a);
    setVista('detalle');
  };

  const volverAlActa = () => {
    setVista('acta');
    setSeleccionado(null);
  };

  if (vista === 'detalle' && seleccionado) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <ReporteAlumno a={seleccionado} onVolver={volverAlActa} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            🌍 Corrector de Tareas — Huella de Carbono
          </h1>
          <p className="text-slate-600">
            Corrige los Excel entregados por el alumnado de la actividad de huella de
            carbono y genera una acta con nota por alumno. Reglas duras, sin IA, sin
            base de datos: todo se procesa en este navegador.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setVista('inicio');
              setAlumnos([]);
              setSeleccionado(null);
            }}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-medium bg-white hover:bg-slate-50"
          >
            Empezar de nuevo
          </button>
        </div>
      </div>

      {vista === 'inicio' ? (
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="card">
            <h2 className="font-semibold text-slate-900 mb-4">1. Subir tareas</h2>
            <UploadZone onFiles={manejarSubida} />
            {cargando && (
              <p className="mt-4 text-xs text-slate-500">
                Procesando archivos… Espera a que termine antes de cerrar la pestaña.
              </p>
            )}
          </div>

          <div className="card">
            <h2 className="font-semibold text-slate-900 mb-4">2. Cómo funciona</h2>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">1</span>
                <span>
                  Sube los <b>.xlsx</b> entregados por los alumnos (varios a la vez).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">2</span>
                <span>
                  La app lee <b>1-INVENTARIO</b> y <b>2-CÁLCULO</b> y compara los
                  valores del alumno con lo esperado usando los factores de emisión.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">3</span>
                <span>
                  Obtienes una <b>nota sobre 10</b>, estados por categoría
                  (correcto / sobrestimado / subestimado / pendiente) y un acta
                  exportable a Excel.
                </span>
              </li>
            </ul>
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-2">
                Los datos de los alumnos nunca salen de este ordenador ni se guardan
                en ningún servidor. Al recargar, la sesión se borra.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <ActaView
          alumnos={alumnos}
          factores={factores}
          onFactoresCambio={setFactores}
          onSeleccionar={verDetalle}
          onLimpiar={limpiarTodo}
        />
      )}
    </div>
  );
}
