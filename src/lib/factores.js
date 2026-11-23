/**
 * Factores de emisión orientativos para la calculadora interactiva de alumno.
 * kg CO2e por unidad de actividad.
 * Fuente orientativa: factores tipo (mix eléctrico español, organismos de clima).
 * El profesor puede ajustarlos si su guía de asignatura usa otros valores.
 */
export const DEFAULT_FACTORES = {
  electricidad: 0.26,   // kg CO2e / kWh
  agua: 0.30,           // kg CO2e / m3

  combustibles: {
    'gas natural': 1.90,   // kg CO2e / m3
    butano: 1.57,          // kg CO2e / kg
    propano: 1.57,         // kg CO2e / kg
    gasoleo: 2.68,         // kg CO2e / L
    gasolina: 2.31,        // kg CO2e / L
  },

  residuos: {
    papel: 0.60,   // kg CO2e / kg
    envases: 0.55,
    vidrio: 0.25,
    organico: 0.45,
    otros: 0.75,
  },

  transporte: {
    cocheGasoil: 0.24,   // kg CO2e / km
    cocheGasolina: 0.22,
    cocheHibrido: 0.14,
    cocheElectrico: 0.05,
    moto: 0.11,
    autobus: 0.095,
    tren: 0.055,
    metro: 0.045,
    avion: 0.235,
  },

  kgAToneladas: 1000,
};

/**
 * Umbrales orientativos (anual, por persona/hogar) para dar feedback cualitativo
 * sin necesidad de un valor "esperado" predefinido.
 */
export const UMBRALES = {
  agua: { bajo: 50, medio: 100 },           // m3/año
  electricidad: { bajo: 1500, medio: 3000 }, // kWh/año
  residuosTotales: { bajo: 50, medio: 150 }, // kg/año
  transporteKm: { bajo: 5000, medio: 15000 }, // km/año
  totalToneladas: { bajo: 2, medio: 5 },     // t CO2e/año
};

export function kgAToneladas(kg) {
  return kg / DEFAULT_FACTORES.kgAToneladas;
}

export const CATEGORIAS = [
  { clave: 'agua', nombre: 'Agua', icono: 'Droplets' },
  { clave: 'electricidad', nombre: 'Electricidad', icono: 'Zap' },
  { clave: 'combustibles', nombre: 'Combustibles (hogar)', icono: 'Flame' },
  { clave: 'residuos', nombre: 'Residuos', icono: 'Trash2' },
  { clave: 'transporte', nombre: 'Transporte', icono: 'Car' },
];
