/**
 * Muestra los resultados por categoría con barras de progreso y gráfico donut.
 * Recibe el objeto resultado de calcularEmisiones.
 */
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Droplets, Zap, Flame, Trash2, Car } from 'lucide-react';
import { porcentaje } from '../lib/calculos.js';

const Iconos = { Droplets, Zap, Flame, Trash2, Car };
const Colores = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
];

export default function ResultadoCategorias({ resultado }) {
  const { categorias, totalT } = resultado;

  return (
    <div className="space-y-6">
      {/* Gráfico donut */}
      <div className="card">
        <h3 className="font-semibold text-slate-900 mb-4">Distribución de tu huella</h3>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-72 h-72 mx-auto">
            <PieChart width={300} height={300}>
              <Pie
                data={categorias.filter((c) => c.t > 0).map((c, i) => ({
                  name: c.nombre,
                  value: c.t,
                  fill: Colores[i % Colores.length],
                }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                labelLine={false}
                label={({ name, value, percent }) => (
                  <text
                    x="0"
                    y="6"
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize={11}
                  >
                    {name} {(percent * 100).toFixed(0)}%
                  </text>
                )}
              >
                {categorias.filter((c) => c.t > 0).map((c, i) => (
                  <Cell key={`cell-${i}`} fill={Colores[i % Colores.length]} />
                ))}
              </Pie>
              <Tooltip content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-800 text-white p-2 rounded text-sm">
                      <div className="font-semibold">{data.name}</div>
                      <div>{data.value.toFixed(3)} t CO2e</div>
                    </div>
                  );
                }
                return null;
              }} />
            </PieChart>
          </div>
          <div className="flex-1 space-y-3">
            {categorias.map((c, i) => (
              <div key={c.clave} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: Colores[i % Colores.length] }}>
                  {c.nombre.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{c.nombre}</span>
                    <span className="text-slate-500">{c.t.toFixed(3)} t</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full"
                      style={{ backgroundColor: Colores[i % Colores.length], width: `${porcentaje(c.t, totalT)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {c.dato} {c.unidad}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tarjeta total */}
      <div className="card bg-indigo-50 border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">Huella total anual</p>
            <h2 className="text-3xl font-bold text-slate-900">
              {totalT.toFixed(2)} t CO2e
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500">= {resultado.totalKg.toFixed(0)} kg CO2e</span>
          </div>
        </div>
      </div>
    </div>
  );
}
