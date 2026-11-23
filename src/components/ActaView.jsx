/**
 * Acta grupal: tabla de alumnos corregidos, estadísticas y exportación.
 */
import { descargarActa } from '../lib/export.js';
import FactoresEditor from './FactoresEditor';

export default function ActaView({ alumnos, factores, onFactoresCambio, onSeleccionar, onLimpiar }) {
  const notas = alumnos.map((a) => a.resultado.nota);
  const media =
    notas.length > 0 ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2) : '—';
  const aprobados = notas.filter((n) => n >= 5).length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Acta de corrección</h1>
          <p className="text-slate-600">
            {alumnos.length} tarea(s) corregida(s) • Media {media} • {aprobados} aprobado(s) ≥ 5
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onLimpiar}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-medium bg-white hover:bg-slate-50"
          >
            Limpiar todo
          </button>
          <button
            onClick={() => descargarActa(alumnos)}
            className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700"
          >
            📥 Exportar acta (Excel)
          </button>
        </div>
      </div>

      {/* Factores */}
      <div className="mb-6">
        <h2 className="font-semibold text-slate-900 mb-3">⚙️ Factores de emisión</h2>
        <FactoresEditor factores={factores} onChange={onFactoresCambio} />
      </div>

      {/* Tabla de alumnos */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="table-cell">Alumno</th>
              <th className="table-cell">Archivo</th>
              <th className="table-cell text-center">Nota</th>
              <th className="table-cell text-center">Nivel</th>
              <th className="table-cell text-center">Categorías OK</th>
              <th className="table-cell text-center">Total (t)</th>
              <th className="table-cell text-center">Estado TOTAL</th>
              <th className="table-cell text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map((a) => {
              const r = a.resultado;
              const ok = r.categorias.filter((c) => c.estado === 'correcto').length;
              return (
                <tr key={a.archivo.name} className="table-cell hover:bg-slate-50 transition-colors">
                  <td className="font-medium">{a.nombre}</td>
                  <td className="text-xs text-slate-500 truncate max-w-[160px]">
                    {a.archivo.name}
                  </td>
                  <td className="text-center font-semibold">
                    {r.nota} / 10
                  </td>
                  <td className="text-center">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        r.nivel === 'Excelente'
                          ? 'bg-green-100 text-green-700'
                          : r.nivel === 'Bueno'
                            ? 'bg-amber-100 text-amber-700'
                            : r.nivel === 'Regular'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {r.nivel}
                    </span>
                  </td>
                  <td className="text-center">{ok} / {r.categorias.length}</td>
                  <td className="text-center font-mono text-slate-600">
                    {r.total.alumno != null ? r.total.alumno.toFixed(2) : '—'}
                  </td>
                  <td className="text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${
                        r.total.estado === 'correcto'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : r.total.estado === 'pendiente'
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                      }`}
                    >
                      {r.total.estado}
                    </span>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => onSeleccionar(a)}
                      className="px-3 py-1.5 rounded border border-blue-300 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {alumnos.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            No hay tareas corregidas aún. Sube los Excel de los alumnos.
          </div>
        )}
      </div>
    </div>
  );
}


