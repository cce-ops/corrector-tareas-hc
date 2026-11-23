/**
 * Factores de emisión por defecto para la actividad de Huella de Carbono.
 * Todas las unidades están en kg CO2e por unidad de actividad.
 * Fuente orientativa: factores tipo del mix español / organismos de clima.
 * El profesor puede editarlos desde la app según la guía de la asignatura.
 */
export const DEFAULT_FACTORES = {
  // kg CO2e / kWh de electricidad (alcance 2)
  electricidad: 0.26,
  // kg CO2e / m3 de agua (suministro + saneamiento, alcance 3)
  agua: 0.30,

  // Combustibles: kg CO2e por unidad indicada
  combustibles: {
    'gas natural': 1.90,   // kg CO2e / m3
    butano: 1.57,          // kg CO2e / kg (aprox. también por litro licuado)
    propano: 1.57,         // kg CO2e / kg
    gasoleo: 2.68,         // kg CO2e / L
    gasolina: 2.31,        // kg CO2e / L
  },

  // Residuos: kg CO2e / kg generado (alcance 3, sin crédito por reciclaje)
  residuos: {
    papel: 0.60,
    envases: 0.55,
    vidrio: 0.25,
    organico: 0.45,
    otros: 0.75,
  },

  // Transporte: kg CO2e / km recorrido (vehículo promedio, ocupación media)
  transporte: {
    cocheGasoil: 0.24,   // turismo diésel
    cocheGasolina: 0.22, // turismo gasolina
    cocheHibrido: 0.14,  // turismo híbrido
    cocheElectrico: 0.05, // eléctrico (según mix eléctrico)
    moto: 0.11,
    autobus: 0.095,
    tren: 0.055,
    metro: 0.045,
    avion: 0.235,        // corto/medio radio
  },

  // Alternativa cuando el alumno declara litros de combustible (no km)
  litros: {
    gasoleo: 2.68,
    gasolina: 2.31,
  },

  // Tolerancia relativa aceptada entre lo esperado y lo que escribe el alumno
  toleranciaRelativa: 0.10, // 10 %
  kgAToneladas: 1000,
};

/**
 * Convierte un valor en kg CO2e a toneladas CO2e.
 */
export function kgAToneladas(kg, factores = DEFAULT_FACTORES) {
  return kg / factores.kgAToneladas;
}

/**
 * Nombre legible de cada categoría de cálculo.
 */
export const CATEGORIAS = [
  { clave: 'agua', nombre: 'Agua', alcanceEsperado: 3 },
  { clave: 'electricidad', nombre: 'Electricidad', alcanceEsperado: 2 },
  { clave: 'combustibles', nombre: 'Combustibles', alcanceEsperado: 1 },
  { clave: 'residuos', nombre: 'Residuos', alcanceEsperado: 3 },
  { clave: 'transporte', nombre: 'Transporte', alcanceEsperado: 1 },
];

/**
 * Ponderación de cada categoría en la nota (suma 10).
 */
export const PESOS = {
  agua: 2,
  electricidad: 2,
  combustibles: 2,
  residuos: 2,
  transporte: 2,
};
