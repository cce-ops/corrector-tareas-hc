/**
 * Formulario interactivo donde el alumno introduce sus valores de consumo anual.
 * Emite 'onCambiar' con el objeto de datos completo cada vez que cambia algo.
 */
import { useState } from 'react';
import { Droplets, Zap, Flame, Trash2, Car } from 'lucide-react';
import { datosVacios } from '../lib/calculos.js';
import { CATEGORIAS } from '../lib/factores.js';

const TIPOS_COMBUSTIBLE = [
  { valor: 'gas natural', label: 'Gas natural' },
  { valor: 'butano', label: 'Butano' },
  { valor: 'propano', label: 'Propano' },
  { valor: 'gasoleo', label: 'Gasóleo / Diesel' },
  { valor: 'gasolina', label: 'Gasolina' },
];

export default function FormInventario({ datos, onCambiar }) {
  const [combustibles, setCombustibles] = useState(
    datos.combustibles.length > 0 ? datos.combustibles : [{ tipo: '', unidad: '' }]
  );

  const actualizar = (clave, valor) => {
    const nuevo = { ...datos, [clave]: valor };
    onCambiar(nuevo);
  };

  const actualizarCombustible = (index, campo, valor) => {
    const nuevo = [...combustibles];
    nuevo[index] = { ...nuevo[index], [campo]: valor };
    setCombustibles(nuevo);
    const datosNuevos = { ...datos, combustibles: nuevo };
    onCambiar(datosNuevos);
  };

  const addCombustible = () => {
    const nuevo = [...combustibles, { tipo: '', unidad: '' }];
    setCombustibles(nuevo);
    onCambiar({ ...datos, combustibles: nuevo });
  };

  const removeCombustible = (index) => {
    if (combustibles.length <= 1) return;
    const nuevo = combustibles.filter((_, i) => i !== index);
    setCombustibles(nuevo);
    onCambiar({ ...datos, combustibles: nuevo });
  };

  return (
    <div className="space-y-6">
      {/* Agua */}
      {seccion(
        <Droplets size={20} />,
        'Agua',
        'm3/año',
        datos.agua,
        (v) => actualizar('agua', Number(v) || 0),
        'Consumo anual de agua en metros cúbicos.'
      )}

      {/* Electricidad */}
      {seccion(
        <Zap size={20} />,
        'Electricidad',
        'kWh/año',
        datos.electricidad,
        (v) => actualizar('electricidad', Number(v) || 0),
        'Consumo anual de electricidad en kilovatios hora.'
      )}

      {/* Combustibles hogar */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Flame size={20} className="text-orange-600" />
          <h3 className="font-semibold text-slate-900">Combustibles del hogar</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Si usas varios tipos de combustible (ej. gas natural y gasóleo), añade una línea por cada uno.
        </p>
        <div className="space-y-3">
          {combustibles.map((c, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-slate-50 p-3 rounded-lg border border-slate-100">
              <select
                value={c.tipo}
                onChange={(e) => actualizarCombustible(i, 'tipo', e.target.value)}
                className="input-field"
              >
                <option value="">Tipo de combustible</option>
                {TIPOS_COMBUSTIBLE.map((t) => (
                  <option key={t.valor} value={t.valor}>
                    {t.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="Cantidad"
                value={c.unidad}
                onChange={(e) => actualizarCombustible(i, 'unidad', e.target.value)}
                className="input-field"
              />
              <span className="text-xs text-slate-500 text-center">
                {unidadLabel(c.tipo)}
              </span>
              {combustibles.length > 1 && (
                <button
                  onClick={() => removeCombustible(i)}
                  className="text-rose-500 hover:text-rose-700"
                  title="Eliminar"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addCombustible}
            className="w-full py-2 rounded-lg border border-dashed border-slate-300 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            + Añadir otro combustible
          </button>
        </div>
      </div>

      {/* Residuos */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 size={20} className="text-slate-600" />
          <h3 className="font-semibold text-slate-900">Residuos (kg/año)</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Peso anual aproximado de cada tipo de residuo que generas.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { clave: 'papel', label: 'Papel', contenedor: 'azul' },
            { clave: 'envases', label: 'Envases', contenedor: 'amarillo' },
            { clave: 'vidrio', label: 'Vidrio', contenedor: 'verde' },
            { clave: 'organico', label: 'Orgánico', contenedor: 'marrón' },
            { clave: 'otros', label: 'Otros', contenedor: 'gris' },
          ].map((r) => (
            <div key={r.clave} className="p-3 rounded-lg border border-slate-200 bg-white">
              <p className="text-xs font-semibold text-slate-700 mb-1">{r.label}</p>
              <p className="text-[10px] text-slate-400 mb-2">{r.contenedor}</p>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="kg"
                value={datos.residuos[r.clave]}
                onChange={(e) => {
                  const nuevo = { ...datos.residuos, [r.clave]: Number(e.target.value) || 0 };
                  actualizar('residuos', nuevo);
                }}
                className="input-field"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Transporte */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Car size={20} className="text-slate-600" />
          <h3 className="font-semibold text-slate-900">Transporte (km/año)</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Kilómetros recorridos al año por cada medio de transporte.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { clave: 'privadoCombustion', label: 'Coche privado (combustión)' },
            { clave: 'privadoElectrico', label: 'Coche privado (eléctrico)' },
            { clave: 'autobusBarcos', label: 'Autobús / barcos' },
            { clave: 'trenMetro', label: 'Tren / metro / tranvía' },
            { clave: 'avion', label: 'Avión' },
          ].map((t) => (
            <div key={t.clave} className="p-3 rounded-lg border border-slate-200 bg-white">
              <p className="text-xs font-semibold text-slate-700 mb-1">{t.label}</p>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="km"
                value={datos.transporte[t.clave]}
                onChange={(e) => {
                  const nuevo = { ...datos.transporte, [t.clave]: Number(e.target.value) || 0 };
                  actualizar('transporte', nuevo);
                }}
                className="input-field"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  function seccion(icono, titulo, unidad, valor, onChange, ayuda) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-slate-100 text-slate-600">{icono}</span>
            <h3 className="font-semibold text-slate-900">{titulo}</h3>
          </div>
          <span className="text-xs text-slate-400">{unidad}</span>
        </div>
        <input
          type="number"
          min="0"
          step={unidad === 'm3/año' ? '1' : '0.1'}
          placeholder={unidad}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        />
        <p className="text-[11px] text-slate-400 mt-1">{ayuda}</p>
      </div>
    );
  }
}
