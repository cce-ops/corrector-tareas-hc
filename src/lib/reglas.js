/**
 * Motor de corrección de tareas de Huella de Carbono (reglas duras, sin IA).
 *
 * Entrada: inventario (hoja 1-INVENTARIO), calculo (hoja 2-CÁLCULO) y factores.
 * Salida: resultado completo por alumno con nota, estados por categoría,
 *         errores, avisos, sugerencias y logros.
 */
import {
  DEFAULT_FACTORES,
  CATEGORIAS,
  PESOS,
  kgAToneladas,
} from './factores.js';

/* -------------------------------------------------------------------------- */
/* Cálculo de lo ESPERADO a partir del inventario                             */
/* -------------------------------------------------------------------------- */

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

/** kg CO2e esperados para combustibles (mezcla de tipos declarados) */
function kgCombustibles(combustibles) {
  let kg = 0;
  for (const c of combustibles) {
    const factor = elegirFactorCombustible(c.tipo);
    const u = Number(c.unidad) || 0;
    kg += factor ? factor * u : 0;
  }
  return kg;
}

/** kg CO2e esperados para residuos */
function kgResiduos(r) {
  const f = DEFAULT_FACTORES.residuos;
  return (
    f.papel * r.papel +
    f.envases * r.envases +
    f.vidrio * r.vidrio +
    f.organico * r.organico +
    f.otros * r.otros
  );
}

/** kg CO2e esperados para transporte (por tipo, asumiendo km salvo indicación contraria) */
function kgTransporte(tr) {
  const f = DEFAULT_FACTORES.transporte;
  const litros = DEFAULT_FACTORES.litros;
  let kg = 0;

  // Vehículos privados de combustión: el alumno puede declarar km/año o L/año.
  // Si no sabemos cuál es, usamos el factor por km como estimación base.
  kg += f.cocheGasolina * tr.privadoCombustion;
  kg += f.cocheElectrico * tr.privadoElectrico;
  kg += f.autobus * tr.autobusBarcos;
  kg += f.tren * tr.trenMetro;
  kg += f.avion * tr.avion;

  return kg;
}

export function calcularEsperado(inventario, factores = DEFAULT_FACTORES) {
  const aguaT = kgAToneladas(factores.agua * inventario.agua, factores);
  const electricidadT = kgAToneladas(
    factores.electricidad * inventario.electricidad,
    factores,
  );
  const combustiblesT = kgAToneladas(kgCombustibles(inventario.combustibles), factores);
  const residuosT = kgAToneladas(kgResiduos(inventario.residuos), factores);
  const transporteT = kgAToneladas(kgTransporte(inventario.transporte), factores);

  const esperado = {
    agua: aguaT,
    electricidad: electricidadT,
    combustibles: combustiblesT,
    residuos: residuosT,
    transporte: transporteT,
  };
  esperado.total =
    aguaT + electricidadT + combustiblesT + residuosT + transporteT;
  return esperado;
}

/* -------------------------------------------------------------------------- */
/* Comparación alumno vs esperado                                             */
/* -------------------------------------------------------------------------- */

function estadoCategoria(valorAlumno, esperado, tolerancia) {
  if (valorAlumno == null) return { estado: 'pendiente', diferencia: null };
  const diff = valorAlumno - esperado;
  const umbral = Math.max(esperado * tolerancia, 0.0001); // evitar división por cero

  if (Math.abs(diff) <= umbral) return { estado: 'correcto', diferencia: diff };
  if (diff > 0) return { estado: 'sobrestimado', diferencia: diff };
  return { estado: 'subestimado', diferencia: diff };
}

function esEnteroAlcance(v) {
  return v != null && /^[123]$/.test(String(v).trim());
}

/**
 * Corrige un alumno completo.
 */
export function corregirAlumno({ inventario, calculo, factores = DEFAULT_FACTORES }) {
  const errores = [];
  const avisos = [];
  const sugerencias = [];
  const logros = [];

  // --- Validación estructural --------------------------------------------
  if (!inventario) {
    errores.push({
      codigo: 'FALTA_INVENTARIO',
      mensaje: 'No se encuentra la hoja de inventario (1-INVENTARIO / ESCENARIO A / ESCENARIO B).',
    });
  }
  if (!calculo) {
    errores.push({
      codigo: 'FALTA_CALCULO',
      mensaje: 'No se encuentra la hoja 2-CÁLCULO.',
    });
  }
  if (errores.length > 0) {
    return {
      valido: false,
      nota: 0,
      nivel: 'Insuficiente',
      errores,
      avisos,
      sugerencias: [
        'Sube el Excel completo con las hojas 1-INVENTARIO y 2-CÁLCULO.',
      ],
      logros: [],
      categorias: [],
      total: { alumno: null, esperado: null, estado: 'pendiente', diferencia: null },
      inventarioResumido: null,
    };
  }

  const esperado = calcularEsperado(inventario, factores);
  const tol = factores.toleranciaRelativa;

  // --- Por categoría -----------------------------------------------------
  const categorias = [];
  let nota = 0;

  for (const cat of CATEGORIAS) {
    const clave = cat.clave;
    const alumno = calculo[clave];
    const valorAlumno = alumno.valor;
    const comparacion = estadoCategoria(valorAlumno, esperado[clave], tol);

    let puntos = 0;
    let comentario = '';

    if (comparacion.estado === 'pendiente') {
      puntos = 0;
      comentario = 'No se ha rellenado el valor en 2-CÁLCULO.';
      avisos.push({
        codigo: `FALTA_${clave.toUpperCase()}`,
        mensaje: `Falta el valor de t CO2eq para "${cat.nombre}".`,
      });
    } else if (comparacion.estado === 'correcto') {
      puntos = PESOS[clave];
      nota += puntos;
      logros.push(`${cat.nombre}: valor correcto (${valorAlumno.toFixed(3)} t CO2eq).`);
      comentario = 'Correcto.';
    } else if (comparacion.estado === 'sobrestimado') {
      puntos = Math.round(PESOS[clave] * 0.5);
      nota += puntos;
      avisos.push({
        codigo: `SOBRE_${clave.toUpperCase()}`,
        mensaje: `${cat.nombre}: valor ${valorAlumno.toFixed(3)} t es superior a lo esperado (${esperado[clave].toFixed(3)} t).`,
      });
      sugerencias.push(
        `Revisa ${cat.nombre}: parece sobrestimado respecto al inventario y los factores de emisión.`,
      );
      comentario = 'Sobrestimado.';
    } else {
      // subestimado
      puntos = Math.round(PESOS[clave] * 0.5);
      nota += puntos;
      avisos.push({
        codigo: `SUBEST_${clave.toUpperCase()}`,
        mensaje: `${cat.nombre}: valor ${valorAlumno.toFixed(3)} t es inferior a lo esperado (${esperado[clave].toFixed(3)} t).`,
      });
      sugerencias.push(
        `Revisa ${cat.nombre}: parece subestimado respecto al inventario y los factores de emisión.`,
      );
      comentario = 'Subestimado.';
    }

    // Alcance
    let alcanceOk = true;
    if (alumno.alcance && !esEnteroAlcance(alumno.alcance)) {
      alcanceOk = false;
      avisos.push({
        codigo: `ALCANCE_${clave.toUpperCase()}`,
        mensaje: `${cat.nombre}: el alcance indicado "${alumno.alcance}" no es 1, 2 ni 3.`,
      });
    } else if (
      alumno.alcance &&
      parseInt(alumno.alcance, 10) !== cat.alcanceEsperado
    ) {
      // No penalizamos duro, solo aviso, porque puede haber criterio docente distinto
      avisos.push({
        codigo: `ALCANCE_DISTINTO_${clave.toUpperCase()}`,
        mensaje: `${cat.nombre}: se indica alcance ${alumno.alcance}, lo habitual es ${cat.alcanceEsperado}.`,
      });
    }

    categorias.push({
      clave,
      nombre: cat.nombre,
      alcanceEsperado: cat.alcanceEsperado,
      alcanceAlumno: alumno.alcance,
      alcanceOk,
      valorAlumno,
      valorEsperado: esperado[clave],
      estado: comparacion.estado,
      diferencia: comparacion.diferencia,
      puntos,
      peso: PESOS[clave],
      comentario,
    });
  }

  // --- Total -------------------------------------------------------------
  const totalAlumno = calculo.total;
  let totalEstado = 'pendiente';
  let totalDiferencia = null;
  let totalComentario = '';

  if (totalAlumno == null) {
    totalEstado = 'pendiente';
    avisos.push({ codigo: 'FALTA_TOTAL', mensaje: 'Falta el TOTAL en 2-CÁLCULO (celda C11).' });
    totalComentario = 'Sin valor.';
  } else {
    const sumaCategorias =
      categorias.filter((c) => c.valorAlumno != null).reduce((a, c) => a + c.valorAlumno, 0);
    const diffSuma = totalAlumno - sumaCategorias;
    const diffEsperado = totalAlumno - esperado.total;

    // La celda C11 trae =SUM(C6:C10). Comprobamos que coincida con la suma de categorías
    // y que la suma esté cerca del esperado.
    if (Math.abs(diffSuma) > 0.001) {
      totalEstado = 'error';
      errores.push({
        codigo: 'TOTAL_NO_CUADRA',
        mensaje: `El TOTAL (${totalAlumno.toFixed(3)} t) no es la suma de las categorías (${sumaCategorias.toFixed(3)} t).`,
      });
      totalComentario = 'No cuadra la suma.';
    } else if (Math.abs(diffEsperado) <= Math.max(esperado.total * tol, 0.0001)) {
      totalEstado = 'correcto';
      nota += 2; // el total vale 2 puntos adicionales si todo cuadra... (ajuste: no, ya sumamos por categoría)
      // Dejamos nota como suma de categorías (10 max). El total correcto es un logro.
      logros.push(`TOTAL correcto: ${totalAlumno.toFixed(3)} t CO2eq.`);
      totalComentario = 'Correcto.';
    } else {
      totalEstado = 'aviso';
      avisos.push({
        codigo: 'TOTAL_DESVIADO',
        mensaje: `El TOTAL (${totalAlumno.toFixed(3)} t) se desvía del esperado (${esperado.total.toFixed(3)} t).`,
      });
      sugerencias.push(
        'Revisa el TOTAL y las fórmulas de cada categoría en 2-CÁLCULO.',
      );
      totalComentario = 'Desviado del esperado.';
    }
    totalDiferencia = diffEsperado;
  }

  // Si el total es correcto y no se sumó antes, aseguramos un tope de 10
  nota = Math.min(Math.round(nota * 10) / 10, 10);

  // --- Celdas de inventario vacías (avisos de llenado) -------------------
  const camposVacios = [];
  if (inventario.agua === 0) camposVacios.push('Agua');
  if (inventario.electricidad === 0) camposVacios.push('Electricidad');
  if (inventario.combustibles.length === 0) camposVacios.push('Combustibles');
  const residuosVacios =
    Object.values(inventario.residuos).every((v) => v === 0);
  if (residuosVacios) camposVacios.push('Residuos');
  const transVacios = Object.values(inventario.transporte).every((v) => v === 0);
  if (transVacios) camposVacios.push('Transporte');

  if (camposVacios.length > 0) {
    avisos.push({
      codigo: 'INVENTARIO_VACIO',
      mensaje: `En 1-INVENTARIO no hay datos de: ${camposVacios.join(', ')}.`,
    });
    sugerencias.push(
      'Rellena todas las celdas verdes de 1-INVENTARIO que apliquen antes de calcular 2-CÁLCULO.',
    );
  }

  if (inventario.filasDatos.length === 0) {
    sugerencias.push(
      'No se detectaron filas de datos en 1-INVENTARIO. Comprueba que rellenaste las celdas pintadas en verde.',
    );
  }

  if (sugerencias.length === 0 && avisos.length === 0) {
    logros.push('Tarea completa y coherente: inventario y cálculo sin incidencias.');
  }

  const nivel =
    nota >= 9 ? 'Excelente' : nota >= 7 ? 'Bueno' : nota >= 5 ? 'Regular' : 'Insuficiente';

  return {
    valido: true,
    nota,
    nivel,
    errores,
    avisos,
    sugerencias,
    logros,
    categorias,
    total: {
      alumno: totalAlumno,
      esperado: esperado.total,
      estado: totalEstado,
      diferencia: totalDiferencia,
      comentario: totalComentario,
    },
    inventarioResumido: {
      agua: inventario.agua,
      electricidad: inventario.electricidad,
      combustibles: inventario.combustibles.length
        ? inventario.combustibles.map((c) => `${c.tipo}: ${c.unidad}`).join('; ')
        : '-',
      residuosTotales:
        inventario.residuos.papel +
        inventario.residuos.envases +
        inventario.residuos.vidrio +
        inventario.residuos.organico +
        inventario.residuos.otros,
      transporteFilas: inventario.filasDatos.length,
    },
  };
}
