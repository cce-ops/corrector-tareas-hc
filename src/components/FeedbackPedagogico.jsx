/**
 * Feedback pedagógico por reglas duras (sin IA).
 * Muestra por cada categoría: estado, mensaje y consejo concreto.
 */
import { Lightbulb, AlertCircle, Info } from 'lucide-react';
import { feedbackCategoria, porcentaje } from '../lib/calculos.js';

const IconoPorEstado = {
  dominante: AlertCircle,
  significativo: Info,
  reducido: Lightbulb,
  pendiente: Info,
};

export default function FeedbackPedagogico({ resultado }) {
  const { categorias, totalT } = resultado;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900 mb-3">📋 Análisis por apartado</h3>
      {categorias.map((c) => {
        const fb = feedbackCategoria(c.clave, c.t, c.dato, totalT);
        const Icono = IconoPorEstado[fb.estado] || Info;
        const coloresEstado = {
          dominante: 'bg-rose-50 border-rose-200 text-rose-800',
          significativo: 'bg-amber-50 border-amber-200 text-amber-800',
          reducido: 'bg-green-50 border-green-200 text-green-800',
          pendiente: 'bg-slate-50 border-slate-200 text-slate-600',
        };

        return (
          <div key={c.clave} className={`card p-4 ${coloresEstado[fb.estado]}`}>
            <div className="flex items-center gap-2 mb-2">
              <Icono size={16} className="flex-shrink-0" />
              <span className="font-semibold text-slate-900">{c.nombre}</span>
              <span className="ml-auto text-xs font-bold uppercase tracking-wider opacity-70">
                {estadoLabel(fb.estado)}
              </span>
            </div>
            <p className="text-sm text-slate-700 mb-2">{fb.mensaje}</p>
            {fb.consejo && (
              <div className="flex items-start gap-2 text-xs">
                <span className="text-indigo-600 mt-0.5">💡</span>
                <span className="text-slate-600">{fb.consejo}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  function estadoLabel(estado) {
    switch (estado) {
      case 'dominante': return 'Principal';
      case 'significativo': return 'Notable';
      case 'reducido': return 'Reducido';
      case 'pendiente': return 'Sin datos';
      default: return estado;
    }
  }
}
