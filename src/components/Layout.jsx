/**
 * Layout principal: barra superior y zona de contenido.
 */
import { Home, Activity, BarChart3, Leaf, Zap, Car, Trash2, Droplets, Flame, Send, Save } from 'lucide-react';

const Iconos = { Home, Activity, BarChart3, Leaf, Zap, Car, Trash2, Droplets, Flame, Send, Save };

export default function Layout({ hijos, seccion, onCambiarSeccion }) {
  const secciones = [
    { id: 'inventario', label: '1. Tus datos', icono: 'User' },
    { id: 'resultado', label: '2. Tu huella', icono: 'BarChart3' },
    { id: 'feedback', label: '3. Consejos', icono: 'Activity' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Barra superior */}
      <header className="bg-indigo-600 text-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
              🌍
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Mi Huella de Carbono</h1>
              <p className="text-xs text-indigo-100 opacity-90">Calculadora interactiva para alumnado</p>
            </div>
          </div>
          <div className="hidden md:flex gap-1">
            {secciones.map((s) => {
              const Activo = Iconos[s.icono] || Iconos.Activity;
              const activo = seccion === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => onCambiarSeccion(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activo
                      ? 'bg-indigo-500/20 text-indigo-100 border border-indigo-400/50'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Activo size={18} />
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {hijos}
      </main>
    </div>
  );
}
