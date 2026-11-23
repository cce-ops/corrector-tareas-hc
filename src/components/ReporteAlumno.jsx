/**
 * Vista detallada de la corrección de un alumno.
 */
import { descargarReporteAlumno } from '../lib/export.js';

const estadoColor = (estado) => {
  switch (estado) {
    case 'correcto': return 'text-green-700 bg-green-100 border-green-200';
    case 'sobrestimado':
    case 'subestimado': return 'text-amber-700 bg-amber-100 border-amber-200';
    case 'pendiente': return 'text-slate-600 bg-slate-100 border-slate-200';
    default: return 'text-rose-700 bg-rose-100 border-rose-200';
  }
};

export default function ReporteAlumno({ a, onVolver }) {
  const r = a.resultado;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onVolver}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 text-sm text-slate-600 bg-white hover:bg-slate-50"
        >
          ← Volver al acta
        </button>
        <h1 className="text-xl font-bold text-slate-900">{a.nombre}</h1>
        <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
          Nota: {r.nota} / 10
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg border border-slate-200 bg-white">
          <p className="text-xs text-slate-500 uppercase font-semibold">Nota</p>
          <p className="text-2xl font-bold text-slate-900">{r.nota}</p>
          <p className="text-xs text-slate-500">de 10 — {r.nivel}</p>
        </div>
        <div className="p-4 rounded-lg border border-slate-200 bg-white">
          <p className="text-xs text-slate-500 uppercase font-semibold">Errores</p>
          <p className="text-2xl font-bold text-rose-600">{r.errores.length}</p>
          <p className="text-xs text-slate-500">reglas incumplidas</p>
        </div>
        <div className="p-4 rounded-lg border border-slate-200 bg-white">
          <p className="text-xs text-slate-500 uppercase font-semibold">Avisos</p>
          <p className="text-2xl font-bold text-amber-600">{r.avisos.length}</p>
          <p className="text-xs text-slate-500">revisar</p>
        </div>
        <div className="p-4 rounded-lg border border-slate-200 bg-white">
          <p className="text-xs text-slate-500 uppercase font-semibold">Logros</p>
          <p className="text-2xl font-bold text-green-600">{r.logros.length}</p>
          <p className="text-xs text-slate-500">aciertos</p>
        </div>
      </div>

      {/* Inventario resumido */}
      {r.inventarioResumido && (
        <div className="card mb-6">
          <h3 className="font-semibold text-slate-900 mb-3">📋 Inventario detectado (1-INVENTARIO)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="p-2 rounded bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500">Agua</p>
              <p className="font-semibold">{r.inventarioResumido.agua} m3/año</p>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500">Electricidad</p>
              <p className="font-semibold">{r.inventarioResumido.electricidad} kWh/año</p>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500">Combustibles</p>
              <p className="font-semibold truncate">{r.inventarioResumido.combustibles}</p>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500">Residuos (kg)</p>
              <p className="font-semibold">{r.inventarioResumido.residuosTotales}</p>
            </div>
          </div>
        </div>
      )}

      {/* Categorías */}
      <div className="card mb-6">
        <h3 className="font-semibold text-slate-900 mb-3">📊 Cálculo por categoría (2-CÁLCULO)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="table-cell">Categoría</th>
                <th className="table-cell text-right">Alumno (t CO2eq)</th>
                <th className="table-cell text-right">Esperado (t CO2eq)</th>
                <th className="table-cell text-right">Diferencia</th>
                <th className="table-cell">Estado</th>
                <th className="table-cell text-center">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {r.categorias.map((c) => (
                <tr key={c.clave} className="table-cell">
                  <td className="font-medium">{c.nombre}</td>
                  <td className="text-right font-mono">
                    {c.valorAlumno != null ? c.valorAlumno.toFixed(3) : '—'}
                  </td>
                  <td className="text-right font-mono text-slate-500">
                    {c.valorEsperado.toFixed(3)}
                  </td>
                  <td className="text-right font-mono text-slate-500">
                    {c.diferencia != null ? c.diferencia.toFixed(3) : '—'}
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${estadoColor(c.estado)}`}
                    >
                      {c.estado}
                    </span>
                  </td>
                  <td className="text-center font-semibold">{c.puntos} / {c.peso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total */}
      <div className="card mb-6">
        <h3 className="font-semibold text-slate-900 mb-3">🧮 Total (2-CÁLCULO C11)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 rounded bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500">Alumno</p>
            <p className="font-semibold font-mono">
              {r.total.alumno != null ? r.total.alumno.toFixed(3) : '—'} t CO2eq
            </p>
          </div>
          <div className="p-3 rounded bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500">Esperado</p>
            <p className="font-semibold font-mono text-slate-500">
              {r.total.esperado?.toFixed(3) ?? '—'} t CO2eq
            </p>
          </div>
          <div className="p-3 rounded bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500">Estado</p>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${estadoColor(r.total.estado)}`}
            >
              {r.total.estado}
            </span>
          </div>
        </div>
      </div>

      {/* Errores, avisos, sugerencias, logros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(r.errores.length || r.avisos.length) && (
          <div className="md:col-span-2">
            <div className="flex gap-2 mb-3">
              {r.errores.length && (
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg">
                  ⚠️ {r.errores.length} error(es)
                </h4>
              )}
              {r.avisos.length && (
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg">
                  ⚠️ {r.avisos.length} aviso(s)
                </h4>
              )}
            </div>
            <ul className="space-y-2 text-sm">
              {r.errores.map((e, i) => (
                <li key={i} className="flex items-start gap-2 text-rose-700">
                  <span className="text-rose-500">❌</span>
                  <span>{e.mensaje}</span>
                </li>
              ))}
              {r.avisos.map((av, i) => (
                <li key={i} className="flex items-start gap-2 text-amber-700">
                  <span className="text-amber-500">⚠️</span>
                  <span>{av.mensaje}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {r.sugerencias.length && (
          <div>
            <h4 className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg mb-3 flex items-center gap-1.5">
              💡 Sugerencias ({r.sugerencias.length})
            </h4>
            <ul className="space-y-2 text-sm text-slate-700">
              {r.sugerencias.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-500">💡</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {r.logros.length && (
          <div>
            <h4 className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg mb-3 flex items-center gap-1.5">
              ✅ Logros ({r.logros.length})
            </h4>
            <ul className="space-y-2 text-sm text-slate-700">
              {r.logros.map((l, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500">✅</span>
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => descargarReporteAlumno(a)}
          className="px-4 py-2 rounded-lg border border-blue-300 text-blue-600 font-medium bg-blue-50 hover:bg-blue-100"
        >
          Descargar reporte (Markdown)
        </button>
        <button
          onClick={onVolver}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-medium bg-white hover:bg-slate-50"
        >
          Volver al acta
        </button>
      </div>
    </div>
  );
}
