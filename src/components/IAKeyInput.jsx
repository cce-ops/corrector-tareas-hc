/**
 * Campo BYOK para API Key de Gemini (opcional).
 */
import { useState } from 'react';
import { Bot } from 'lucide-react';

export default function IAKeyInput({ apiKey, onChange, evaluando, onEvaluar }) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-indigo-600" />
          <h3 className="font-semibold text-slate-900">Asesor pedagógico con IA (opcional)</h3>
        </div>
        <button
          onClick={() => setMostrar(!mostrar)}
          className="px-3 py-1.5 rounded border border-slate-300 text-xs text-slate-600 bg-white hover:bg-slate-50"
        >
          {mostrar ? 'Ocultar' : 'Configurar'}
        </button>
      </div>

      {mostrar && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              API Key de Google AI Studio (Gemini)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => onChange(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 text-sm p-2 font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Consíguela en{' '}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                Google AI Studio
              </a>
              <span className="text-[10px] text-rose-500 block mt-1">
                ⚠️ Solo vive en esta pestaña; no se guarda ni se envía a otro servidor.
              </span>
            </p>
          </div>
          <button
            disabled={!apiKey || evaluando}
            onClick={onEvaluar}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition ${
              !apiKey || evaluando
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {evaluando ? 'Pidiendo consejo a la IA…' : 'Pedir consejo personalizado'}
          </button>
          <p className="text-xs text-slate-500">
            Modelos de intento:{' '}
            ['gemini-2.5-flash','gemini-2.5-flash-lite','gemini-2.0-flash'].join(', ')
          </p>
        </div>
      )}
    </div>
  );
}
