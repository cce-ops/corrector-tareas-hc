/**
 * App principal: Calculadora interactiva de huella de carbono para alumnado.
 *
 * Flujo:
 *  1. Alumno introduce sus valores anuales en el formulario (agua, electricidad, combustibles, residuos, transporte).
 *  2. La web calcula las emisiones en tiempo real (t CO2e) por categoría y total.
 *  3. Muestra feedback pedagógico cualitativo (Correcto / Mejorable / Insuficiente) sin nota numérica.
 *  4. Opcionalmente, asesor pedagógico con IA (Gemini BYOK) con reintentos entre modelos.
 *  5. Exporta el resultado a Markdown o Excel.
 *
 * Todo es frontend; nada sale del navegador excepto la consulta opcional a Gemini.
 */
import { useState, useCallback } from 'react';
import { datosVacios, calcularEmisiones, nivelGeneral } from './lib/calculos.js';
import { evaluarConIA } from './lib/ia.js';
import Layout from './components/Layout';
import FormInventario from './components/FormInventario';
import ResultadoCategorias from './components/ResultadoCategorias';
import NivelGeneral from './components/NivelGeneral';
import FeedbackPedagogico from './components/FeedbackPedagogico';
import IAKeyInput from './components/IAKeyInput';
import IAAsesor from './components/IAAsesor';
import ExportarResultado from './components/ExportarResultado';
import { Home, Activity, BarChart3 } from 'lucide-react';

const Iconos = { Home, Activity, BarChart3 };

export default function App() {
  const [seccion, setSeccion] = useState('inventario');
  const [datos, setDatos] = useState(datosVacios());
  const [resultado, setResultado] = useState(null);

  // IA (BYOK)
  const [apiKey, setApiKey] = useState('');
  const [feedbackIA, setFeedbackIA] = useState(null);
  const [evaluandoIA, setEvaluandoIA] = useState(false);

  const manejarCambioDatos = (nuevosDatos) => {
    setDatos(nuevosDatos);
    setResultado(calcularEmisiones(nuevosDatos));
  };

  const manejarEvaluacionIA = async () => {
    if (!apiKey || !resultado) return;
    setEvaluandoIA(true);
    try {
      const nivel = nivelGeneral(resultado.totalT);
      const asesor = await evaluarConIA(datos, resultado, nivel, apiKey);
      setFeedbackIA(asesor);
    } catch (err) {
      console.error('Error IA:', err);
      setFeedbackIA({
        resumen: 'No se pudo contactar con el asesor IA en este momento. Intenta de nuevo más tarde.',
        fortalezas: [],
        areasMejora: [],
        consejos: [],
        mensajeFinal: 'Sigue revisando tus datos y aplicando los consejos de la calculadora.',
      });
    } finally {
      setEvaluandoIA(false);
    }
  };

  const nombreAlumno = datos.nombre || '';

  return (
    <Layout
      seccion={seccion}
      onCambiarSeccion={setSeccion}
    >
      {seccion === 'inventario' && (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">1. Introduce tus datos anuales</h2>
            <p className="text-slate-600">
              Rellena los apartados que apliquen a tu hogar. Las emisiones se calculan automáticamente al cambiar cualquier valor.
            </p>
          </div>
          <FormInventario datos={datos} onCambiar={manejarCambioDatos} />
        </>
      )}

      {seccion === 'resultado' && resultado && (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">2. Tu huella de carbono</h2>
            <p className="text-slate-600">
              Resultado en tiempo real basado en los datos que has introducido.
            </p>
          </div>
          <NivelGeneral totalT={resultado.totalT} feedbackIA={feedbackIA} />
          <ResultadoCategorias resultado={resultado} />
          <FeedbackPedagogico resultado={resultado} />
          <ExportarResultado nombre={nombreAlumno} datos={datos} resultado={resultado} feedbackIA={feedbackIA} />
          <IAKeyInput
            apiKey={apiKey}
            onChange={setApiKey}
            evaluando={evaluandoIA}
            onEvaluar={manejarEvaluacionIA}
          />
          <IAAsesor resultadoIA={feedbackIA} evaluando={evaluandoIA} />
        </>
      )}

      {seccion === 'feedback' && resultado && (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">3. Tu asesor personal</h2>
            <p className="text-slate-600">
              Qué está bien, qué deberías revisar y consejos prácticos para reducir tu huella.
            </p>
          </div>
          <NivelGeneral totalT={resultado.totalT} feedbackIA={feedbackIA} />
          <FeedbackPedagogico resultado={resultado} />
          <IAKeyInput
            apiKey={apiKey}
            onChange={setApiKey}
            evaluando={evaluandoIA}
            onEvaluar={manejarEvaluacionIA}
          />
          <IAAsesor resultadoIA={feedbackIA} evaluando={evaluandoIA} />
          <ExportarResultado nombre={nombreAlumno} datos={datos} resultado={resultado} feedbackIA={feedbackIA} />
        </>
      )}

      {!resultado && seccion !== 'inventario' && (
        <div className="text-center py-20 text-slate-400">
          <BarChart3 size={48} className="mx-auto mb-4 opacity-30" />
          <p>Introduce tus datos en la primera sección para ver los resultados.</p>
        </div>
      )}
    </Layout>
  );
}
