/**
 * Tarjeta resumen de un alumno en el acta de corrección.
 */
import { descargarReporteAlumno } from '../lib/export.js';

const badgeClase = (estado) => {
  switch (estado) {
    case 'correcto': return 'badge-ok';
    case 'sobrestimado':
    case 'subestimado': return 'badge-warn';
    case 'pendiente': return 'badge-pending';
    default: return 'badge-bad';
  }
};

export default function AlumnoCard({ a, onSeleccionar }) {
  const r = a.resultado;
  const categoriasOk = r.categorias.filter((c) => c.estado === 'correcto').length;
  const totalCategorias = r.categorias.length;

  return (
    <div className="card group cursor-pointer hover:border-blue-300 transition-border">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">{a.nombre}</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              {a.resultado.nota} / 10
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate max-w-[200px]">
            {a.archivo.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`font-bold text-lg ${
              r.nota >= 7
                ? 'text-green-600'
                : r.nota >= 5
                  ? 'text-amber-600'
                  : 'text-rose-600'
            }`}
          >
            {r.nota} / 10
          </span>
          <span className={`text-xs font-semibold ${r.nivel === 'Excelente' ? 'text-green-600' : r.nivel === 'Bueno' ? 'text-amber-600' : r.nivel === 'Regular' ? 'text-slate-600' : 'text-rose-600'}`}>
            {r.nivel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {r.categorias.map((c) => (
          <div
            key={c.clave}
            className={`p-2 rounded border text-xs flex flex-col items-center ${
              c.estado === 'correcto'
                ? 'bg-green-50 border-green-200'
                : c.estado === 'pendiente'
                  ? 'bg-slate-50 border-slate-200'
                  : c.estado === 'sobrestimado' || c.estado === 'subestimado'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-rose-50 border-rose-200'
            }`}
          >
            <span className="font-semibold text-slate-600">{c.nombre}</span>
            <span className="font-mono text-sm">
              {c.valorAlumno != null ? c.valorAlumno.toFixed(2) : '—'}
            </span>
            <span className={badgeClase(c.estado)}>{c.estado}</span>
          </div>
        ))}
        <div className="col-span-2 md:col-span-1 p-2 rounded border bg-slate-50 border-slate-200 text-xs flex flex-col items-center">
          <span className="font-semibold text-slate-600">TOTAL</span>
          <span className="font-mono text-sm font-bold">
            {r.total.alumno != null ? r.total.alumno.toFixed(2) : '—'}
          </span>
          <span className={badgeClase(r.total.estado)}>{r.total.estado}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500">
          {categoriasOk} / {totalCategorias} categorías correctas
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onSeleccionar(a)}
            className="px-3 py-1.5 rounded border border-slate-300 text-xs text-slate-600 bg-white hover:bg-slate-50"
          >
            Ver detalle
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              descargarReporteAlumno(a);
            }}
            className="px-3 py-1.5 rounded border border-blue-300 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100"
          >
            📄 Reporte
          </button>
        </div>
      </div>
    </div>
  );
}
