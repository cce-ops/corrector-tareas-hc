/**
 * Cálculo de emisiones a partir de los datos de actividad introducidos por el alumno.
 * Todo devuelve kg CO2e y t CO2e.
 */
import { DEFAULT_FACTORES, kgAToneladas, UMBRALES } from './factores.js';

function elegirFactorCombustible(tipo) {
  if (!tipo) return null;
  const t = String(tipo).toLowerCase();
  const f = DEFAULT_FACTORES.combustibles;
  if (t.includes('gas natural')) return f['gas natural'];
  if (t.includes('butano')) return f.butano;
  if (t.includes('propano')) return f.propano;
  if (t.includes('gasoleo') || t.includes('diesel') || t.includes('gasoil')) return f.gasoleo;
  if (t.includes('gasolina')) return f.gasolina;
  return null;
}

/** Estructura inicial vacía */
export function datosVacios() {
  return {
    agua: 0,
    electricidad: 0,
    combustibles: [],
    residuos: { papel: 0, envases: 0, vidrio: 0, organico: 0, otros: 0 },
    transporte: {
      privadoCombustion: 0,
      privadoElectrico: 0,
      autobusBarcos: 0,
      trenMetro: 0,
      avion: 0,
    },
  };
}

/** Calcula todo a partir de los datos */
export function calcularEmisiones(datos, factores = DEFAULT_FACTORES) {
  // Agua
  const aguaKg = factores.agua * datos.agua;
  const aguaT = kgAToneladas(aguaKg, factores);

  // Electricidad
  const electricidadKg = factores.electricidad * datos.electricidad;
  const electricidadT = kgAToneladas(electricidadKg, factores);

  // Combustibles
  let combustiblesKg = 0;
  const combustiblesDetalle = [];
  for (const c of datos.combustibles) {
    const factor = elegirFactorCombustible(c.tipo);
    const kg = factor ? factor * Number(c.unidad || 0) : 0;
    combustiblesKg += kg;
    combustiblesDetalle.push({
      tipo: c.tipo,
      unidad: Number(c.unidad || 0),
      factor,
      kg,
      t: kgAToneladas(kg, factores),
    });
  }
  const combustiblesT = kgAToneladas(combustiblesKg, factores);

  // Residuos
  const r = datos.residuos;
  const fRes = factores.residuos;
  const residuosKg =
    fRes.papel * r.papel +
    fRes.envases * r.envases +
    fRes.vidrio * r.vidrio +
    fRes.organico * r.organico +
    fRes.otros * r.otros;
  const residuosT = kgAToneladas(residuosKg, factores);

  // Transporte (asumimos km/año salvo que sea litros en privado combustión)
  const fTr = factores.transporte;
  const transporteKg =
    fTr.cocheGasolina * datos.transporte.privadoCombustion +
    fTr.cocheElectrico * datos.transporte.privadoElectrico +
    fTr.autobus * datos.transporte.autobusBarcos +
    fTr.tren * datos.transporte.trenMetro +
    fTr.avion * datos.transporte.avion;
  const transporteT = kgAToneladas(transporteKg, factores);

  const totalKg = aguaKg + electricidadKg + combustiblesKg + residuosKg + transporteKg;
  const totalT = kgAToneladas(totalKg, factores);

  const categorias = [
    { clave: 'agua', nombre: 'Agua', t: aguaT, kg: aguaKg, dato: datos.agua, unidad: 'm3/año' },
    { clave: 'electricidad', nombre: 'Electricidad', t: electricidadT, kg: electricidadKg, dato: datos.electricidad, unidad: 'kWh/año' },
    { clave: 'combustibles', nombre: 'Combustibles (hogar)', t: combustiblesT, kg: combustiblesKg, dato: combustiblesDetalle.length ? combustiblesDetalle.map(d => `${d.tipo}: ${d.unidad}`).join('; ') : 0, unidad: 'diversas' },
    { clave: 'residuos', nombre: 'Residuos', t: residuosT, kg: residuosKg, dato: Object.values(r).reduce((a, b) => a + b, 0), unidad: 'kg/año' },
    { clave: 'transporte', nombre: 'Transporte', t: transporteT, kg: transporteKg, dato: Object.values(datos.transporte).reduce((a, b) => a + b, 0), unidad: 'km/año' },
  ];

  return {
    categorias,
    totalT,
    totalKg,
    aguaT,
    electricidadT,
    combustiblesT,
    residuosT,
    transporteT,
    combustiblesDetalle,
  };
}

export function porcentaje(categoriaT, totalT) {
  if (!totalT || totalT === 0) return 0;
  return (categoriaT / totalT) * 100;
}

export function nivelGeneral(totalT) {
  if (totalT <= UMBRALES.totalToneladas.bajo) return 'Correcto';
  if (totalT <= UMBRALES.totalToneladas.medio) return 'Mejorable';
  return 'Insuficiente';
}

export function feedbackCategoria(clave, valorT, dato, totalT) {
  const pct = porcentaje(valorT, totalT);
  const u = UMBRALES;

  const esCero = valorT === 0 || (!dato && dato !== 0);

  let estado = 'pendiente';
  let mensaje = '';
  let consejo = '';

  if (esCero) {
    estado = 'pendiente';
    mensaje = 'No has introducido datos en este apartado.';
    consejo = 'Rellénalo si aplica a tu hogar para ver tu huella completa.';
  } else if (pct >= 40) {
    estado = 'dominante';
    mensaje = `Es tu principal fuente de emisiones (${pct.toFixed(0)} % del total).`;
    consejo = consejoPorCategoriaDominante(clave);
  } else if (pct >= 15) {
    estado = 'significativo';
    mensaje = `Es una fuente notable (${pct.toFixed(0)} % del total).`;
    consejo = consejoPorCategoriaSignificativa(clave);
  } else if (pct > 0) {
    estado = 'reducido';
    mensaje = `Tiene una contribución reducida (${pct.toFixed(0)} % del total).`;
    consejo = 'Está bien. Mantén estos hábitos.';
  }

  return { clave, estado, valorT, pct, mensaje, consejo };
}

function consejoPorCategoriaDominante(clave) {
  const consejos = {
    agua: 'Considera reducir el consumo: duchas más cortas, grifos con aireador y revisar fugas.',
    electricidad: 'Revisa electrodomésticos antiguos, cambia a bombillas LED y evita el standby.',
    combustibles: 'Si usas calefacción de combustibles fósiles, revisa el aislamiento y la caldera.',
    residuos: 'Reduce, reutiliza y recicla. Evita productos de un solo uso.',
    transporte: 'Prueba caminar, bici o transporte público para trayectos cortos; comparte coche en largos.',
  };
  return consejos[clave] || '';
}

function consejoPorCategoriaSignificativa(clave) {
  const consejos = {
    agua: 'Puedes mejorar aún más: instala reductores de caudal y usa lavavajillas/lavadora llenos.',
    electricidad: 'Apaga luces al salir y aprovecha la luz natural.',
    combustibles: 'Mantén la calefacción a una temperatura moderada (19-21 °C).',
    residuos: 'Separa mejor los residuos y compra a granel para reducir envases.',
    transporte: 'Combina trayectos y mantén los neumáticos bien inflados para consumir menos.',
  };
  return consejos[clave] || '';
}

export function feedbackGeneral(totalT) {
  const nivel = nivelGeneral(totalT);
  const mensajes = {
    Correcto: {
      titulo: '¡Vaya bien!',
      texto: 'Tus emisiones están en un rango bajo. Sigue manteniendo estos hábitos sostenibles.',
    },
    Mejorable: {
      titulo: 'Hay margen de mejora',
      texto: 'Tus emisiones son moderadas. Algunos cambios en los apartados destacados pueden reducir tu huella.',
    },
    Insuficiente: {
      titulo: 'Tu huella es elevada',
      texto: 'Tus emisiones están por encima de lo recomendable. Prioriza los apartados marcados como principales y sigue los consejos.',
    },
  };
  return { nivel, ...mensajes[nivel] };
}
