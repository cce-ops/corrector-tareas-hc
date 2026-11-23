/**
 * Nivel cualitativo general: Correcto / Mejorable / Insuficiente (sin nota numérica).
 */
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

const IconoPorNivel = {
  Correcto: CheckCircle2,
  Mejorable: AlertTriangle,
  Insuficiente: AlertCircle,
};

export default function NivelGeneral({ totalT, feedbackIA }) {
  const { nivel, titulo, texto } = feedbackGeneral(totalT);
  const Icono = IconoPorNivel[nivel] || AlertTriangle;

  const colores = {
    Correcto: 'bg-green-50 border-green-200 text-green-800',
    Mejorable: 'bg-amber-50 border-amber-200 text-amber-800',
    Insuficiente: 'bg-rose-50 border-rose-200 text-rose-800',
  };

  return (
    <div className={`card p-5 ${colores[nivel]}`}>
      <div className="flex items-center gap-3 mb-3">
        <Icono size={24} className="flex-shrink-0" />
        <h3 className="font-semibold text-slate-900">{titulo}</h3>
        <span className="ml-auto text-xs font-bold uppercase tracking-wider opacity-70">
          Nivel: {nivel}
        </span>
      </div>
      <p className="text-sm text-slate-700">{texto}</p>
      <p className="text-xs text-slate-500 mt-2">
        Total anual: <span className="font-mono font-semibold">{totalT.toFixed(2)} t CO2e</span>
      </p>
      {feedbackIA && (
        <div className="mt-4 pt-4 border-t border-indigo-100">
          <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">🤖 Asesor IA</h4>
          <p className="text-sm text-slate-700">{feedbackIA.resumen}</p>
        </div>
      )}
    </div>
  );

  function feedbackGeneral(total) {
    if (total <= 2) return { nivel: 'Correcto', titulo: '¡Vaya bien!', texto: 'Tus emisiones están en un rango bajo. Sigue manteniendo estos hábitos sostenibles.' };
    if (total <= 5) return { nivel: 'Mejorable', titulo: 'Hay margen de mejora', texto: 'Tus emisiones son moderadas. Algunos cambios en los apartados destacados pueden reducir tu huella.' };
    return { nivel: 'Insuficiente', titulo: 'Tu huella es elevada', texto: 'Tus emisiones están por encima de lo recomendable. Prioriza los apartados marcados como principales y sigue los consejos.' };
  }
}
