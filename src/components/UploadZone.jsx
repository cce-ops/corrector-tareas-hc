/**
 * Zona de drag & drop para subir uno o varios Excel de alumnos.
 */
import { useState } from 'react';

export default function UploadZone({ onFiles, accept = '.xlsx' }) {
  const [activo, setActivo] = useState(false);
  const [error, setError] = useState(null);

  const destacar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActivo(true);
  };
  const noDestacar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActivo(false);
  };

  const soltar = async (e) => {
    noDestacar(e);
    const archivos = Array.from(e.dataTransfer.files).filter(
      (f) => f.name.toLowerCase().endsWith('.xlsx') || f.name.toLowerCase().endsWith('.xls'),
    );
    if (archivos.length === 0) {
      setError('Sube archivos de Excel (.xlsx).');
      return;
    }
    setError(null);
    onFiles(archivos);
  };

  const seleccionar = async (e) => {
    const archivos = Array.from(e.target.files || []).filter(
      (f) => f.name.toLowerCase().endsWith('.xlsx') || f.name.toLowerCase().endsWith('.xls'),
    );
    if (archivos.length === 0) {
      setError('Sube archivos de Excel (.xlsx).');
      return;
    }
    setError(null);
    onFiles(archivos);
  };

  return (
    <div
      className={`rounded-xl border-2 border-dashed p-8 text-center transition-all ${
        activo
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-300 bg-white hover:border-slate-400'
      }`}
      onDragEnter={destacar}
      onDragOver={destacar}
      onDragLeave={noDestacar}
      onDrop={soltar}
    >
      <p className="mb-4">
        {activo ? 'Suelta los archivos aquí' : 'Arrastra y suelta los Excel de los alumnos'}
      </p>
      <p className="text-sm text-slate-500 mb-6">
        También puedes hacer clic para buscar. Soporta varios archivos a la vez (.xlsx).
      </p>
      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 font-medium cursor-pointer hover:bg-slate-100">
        <span>Seleccionar archivos</span>
        <input
          type="file"
          multiple
          accept={accept}
          className="sr-only"
          onChange={seleccionar}
        />
      </label>
      {error && (
        <p className="mt-4 text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded">{error}</p>
      )}
    </div>
  );
}
