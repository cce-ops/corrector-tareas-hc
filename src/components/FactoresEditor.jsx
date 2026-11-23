/**
 * Editor de factores de emisión. Permite al profesor ajustar los factores
 * que usa el motor de corrección. Se almacena solo en el estado de la app.
 */
import { useState } from 'react';
import { DEFAULT_FACTORES } from '../lib/factores.js';

export default function FactoresEditor({ factores, onChange }) {
  const [json, setJson] = useState(JSON.stringify(factores, null, 2));
  const [mensaje, setMensaje] = useState(null);

  const guardar = () => {
    try {
      const parsed = JSON.parse(json);
      // Validación ligera
      if (typeof parsed !== 'object' || parsed === null) throw new Error('JSON inválido');
      onChange(parsed);
      setMensaje('Factores guardados.');
      setTimeout(() => setMensaje(null), 2500);
    } catch (err) {
      setMensaje('JSON inválido: ' + err.message);
    }
  };

  const restaurar = () => {
    setJson(JSON.stringify(DEFAULT_FACTORES, null, 2));
    onChange(DEFAULT_FACTORES);
    setMensaje('Factores restablecidos por defecto.');
    setTimeout(() => setMensaje(null), 2500);
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold text-slate-900">⚙️ Factores de emisión</h3>
        <span className="ml-auto text-xs text-slate-500">kg CO2e por unidad</span>
      </div>
      <p className="text-xs text-slate-500 mb-3">
        Ajusta los factores según la guía de la asignatura. Se aplican a todos los
        alumnos de la sesión actual.
      </p>
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        className="w-full h-48 rounded-lg border border-slate-300 bg-slate-50 text-sm font-mono text-slate-800 p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        placeholder="{ ... }"
      />
      <div className="mt-3 flex gap-2">
        <button
          onClick={guardar}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          disabled={json.trim() === JSON.stringify(DEFAULT_FACTORES, null, 2)}
        >
          Aplicar factores
        </button>
        <button
          onClick={restaurar}
          className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50"
        >
          Restablecer por defecto
        </button>
      </div>
      {mensaje && (
        <p className="mt-3 text-xs text-green-700 bg-green-50 px-3 py-2 rounded">{mensaje}</p>
      )}
      <details className="mt-4 text-xs text-slate-500">
        <summary className="cursor-pointer">Factores por defecto actuales</summary>
        <pre className="mt-2 text-[10px] text-slate-400 bg-slate-50 p-2 rounded overflow-x-auto">
          {JSON.stringify(DEFAULT_FACTORES, null, 2)}
        </pre>
      </details>
    </div>
  );
}
