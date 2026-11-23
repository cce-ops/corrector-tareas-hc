/**
 * Tarjeta con el resultado pedagógico de la IA.
 */
import { Bot, CheckCircle2, ArrowRight } from 'lucide-react';

export default function IAAsesor({ resultadoIA, evaluando }) {
  if (!resultadoIA && !evaluando) return null;

  if (evaluando && !resultadoIA) {
    return (
      <div className="card bg-indigo-50 p-5 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Bot size={20} className="text-indigo-600 animate-pulse" />
          <span className="text-sm text-indigo-700">Pidiendo consejo al asesor IA…</span>
        </div>
      </div>
    );
  }

  const { resumen, fortalezas, areasMejora, consejos, mensajeFinal } = resultadoIA;

  return (
    <div className="card bg-indigo-50 border-indigo-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Bot size={20} className="text-indigo-600" />
        <h3 className="font-semibold text-slate-900">🤖 Consejo del asesor IA</h3>
      </div>

      <div className="mb-4">
        <p className="text-sm text-slate-700 italic">{resumen}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded bg-white border border-slate-200">
          <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1">
            <CheckCircle2 size={14} /> Fortalezas
          </h4>
          <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
            {fortalezas.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
        <div className="p-3 rounded bg-white border border-slate-200">
          <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1">
            <ArrowRight size={14} /> Áreas a mejorar
          </h4>
          <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
            {areasMejora.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">Consejos prácticos</h4>
        {consejos.map((c, i) => (
          <div key={i} className="flex items-start gap-2 p-2 rounded bg-white border border-slate-100">
            <span className="text-indigo-500 mt-0.5">•</span>
            <div>
              <span className="text-xs font-semibold text-slate-700">{c.apartado}:</span>
              <p className="text-xs text-slate-600">{c.consejo}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-indigo-100">
        <p className="text-xs text-indigo-600 font-medium italic">{mensajeFinal}</p>
      </div>
    </div>
  );
}
