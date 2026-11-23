/**
 * Lectura de los Excel de alumnos con SheetJS.
 * Extrae y normaliza las hojas 1-INVENTARIO y 2-CÁLCULO (y ESCENARIO A/B si existen).
 */
import * as XLSX from 'xlsx';

/**
 * Lee un archivo File y devuelve el workbook de SheetJS.
 */
export function leerArchivo(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        resolve(workbook);
      } catch (err) {
        reject(new Error('No se pudo leer el archivo Excel: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Normaliza el valor de una celda: número, texto o null.
 */
function celdaValor(celda) {
  if (celda == null) return null;
  const v = celda.v;
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return v;
  return String(v).trim();
}

/**
 * Convierte una hoja a matriz de valores (filas x columnas).
 */
function hojaAMatriz(ws) {
  if (!ws) return null;
  const rango = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  const filas = [];
  for (let r = rango.s.r; r <= rango.e.r; r++) {
    const fila = [];
    for (let c = rango.s.c; c <= rango.e.c; c++) {
      const direccion = XLSX.utils.encode_cell({ r, c });
      fila.push(celdaValor(ws[direccion]));
    }
    filas.push(fila);
  }
  return filas;
}

/**
 * Devuelve el valor de una celda por coordenada (col letra + fila número).
 */
function celdaPorCoordenada(ws, direccion) {
  if (!ws) return null;
  const celda = ws[direccion];
  return celda ? celdaValor(celda) : null;
}

/**
 * Extrae el inventario de la hoja 1-INVENTARIO (o ESCENARIO A/B).
 * Mapeo por columnas de la plantilla (fila de datos a partir de la 14):
 *   B agua(m3), C electricidad(kWh), D tipo combustible, E unidad combustible,
 *   F papel, G envases, H vidrio, I organico, J otros (kg),
 *   K privado combustión, L privado eléctrico, M autobus/barcos,
 *   N tren/metro, O avión
 */
export function extraerInventario(ws) {
  if (!ws) return null;

  const leerCol = (letra, fila) => {
    const direccion = `${letra}${fila}`;
    return celdaPorCoordenada(ws, direccion);
  };

  // Detectar fila inicial de datos: buscar la fila que tiene la unidad 'm3/año' o 'kWh/año'
  // (fila 12/13 en la plantilla). Si no se encuentra, partir de la 14.
  let filaInicio = 14;
  const matriz = hojaAMatriz(ws);
  if (matriz) {
    for (let i = 0; i < matriz.length; i++) {
      const fila = matriz[i];
      const texto = fila.map(String).join(' ');
      if (/m3\/año|kWh\/año/.test(texto)) {
        filaInicio = i + 2; // siguiente fila (1-based)
        break;
      }
    }
  }

  const inventario = {
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
    filasDatos: [],
  };

  let fila = filaInicio;
  while (fila <= (ws['!ref'] ? parseInt(XLSX.utils.decode_range(ws['!ref']).e.r, 10) : 40)) {
    const agua = Number(leerCol('B', fila)) || 0;
    const electricidad = Number(leerCol('C', fila)) || 0;
    const tipoCombustible = leerCol('D', fila) || null;
    const unidadCombustible = Number(leerCol('E', fila)) || 0;
    const papel = Number(leerCol('F', fila)) || 0;
    const envases = Number(leerCol('G', fila)) || 0;
    const vidrio = Number(leerCol('H', fila)) || 0;
    const organico = Number(leerCol('I', fila)) || 0;
    const otros = Number(leerCol('J', fila)) || 0;
    const privadoCombustion = Number(leerCol('K', fila)) || 0;
    const privadoElectrico = Number(leerCol('L', fila)) || 0;
    const autobusBarcos = Number(leerCol('M', fila)) || 0;
    const trenMetro = Number(leerCol('N', fila)) || 0;
    const avion = Number(leerCol('O', fila)) || 0;

    const tieneDatos =
      agua || electricidad || unidadCombustible || papel || envases || vidrio ||
      organico || otros || privadoCombustion || privadoElectrico || autobusBarcos ||
      trenMetro || avion || tipoCombustible;

    if (tieneDatos) {
      inventario.filasDatos.push({
        fila,
        agua,
        electricidad,
        tipoCombustible,
        unidadCombustible,
        papel,
        envases,
        vidrio,
        organico,
        otros,
        privadoCombustion,
        privadoElectrico,
        autobusBarcos,
        trenMetro,
        avion,
      });
      inventario.agua += agua;
      inventario.electricidad += electricidad;
      if (unidadCombustible && tipoCombustible) {
        inventario.combustibles.push({ tipo: tipoCombustible, unidad: unidadCombustible });
      }
      inventario.residuos.papel += papel;
      inventario.residuos.envases += envases;
      inventario.residuos.vidrio += vidrio;
      inventario.residuos.organico += organico;
      inventario.residuos.otros += otros;
      inventario.transporte.privadoCombustion += privadoCombustion;
      inventario.transporte.privadoElectrico += privadoElectrico;
      inventario.transporte.autobusBarcos += autobusBarcos;
      inventario.transporte.trenMetro += trenMetro;
      inventario.transporte.avion += avion;
    }

    // Parar tras 3 filas consecutivas sin datos para evitar leer pie de página
    if (!tieneDatos) break;
    fila++;
  }

  return inventario;
}

/**
 * Extrae la hoja 2-CÁLCULO: valores que el alumno escribió por categoría y el TOTAL.
 * Espera:
 *   C6 Agua, C7 Electricidad, C8 Combustibles, C9 Residuos, C10 Transporte, C11 TOTAL
 *   Columna A (A6:A10) = alcance que indica el alumno
 */
export function extraerCalculo(ws) {
  if (!ws) return null;

  const categorias = ['agua', 'electricidad', 'combustibles', 'residuos', 'transporte'];
  const filas = [6, 7, 8, 9, 10];
  const resultado = {};
  let total = null;

  categorias.forEach((clave, i) => {
    const fila = filas[i];
    resultado[clave] = {
      valor: celdaPorCoordenada(ws, `C${fila}`) != null ? Number(celdaPorCoordenada(ws, `C${fila}`)) : null,
      alcance: celdaPorCoordenada(ws, `A${fila}`) != null ? String(celdaPorCoordenada(ws, `A${fila}`)).trim() : null,
      fila,
    };
  });

  total = celdaPorCoordenada(ws, 'C11');
  resultado.total = total != null ? Number(total) : null;

  return resultado;
}

/**
 * Lee un workbook y devuelve los datos normalizados de alumno.
 */
export function extraerDatosAlumno(workbook) {
  const hojas = {};
  workbook.SheetNames.forEach((n) => {
    hojas[n] = workbook.Sheets[n];
  });

  const buscarHoja = (nombres) =>
    nombres.find((n) => hojas[n]) || null;

  const hojaInventario = buscarHoja(['1-INVENTARIO', 'ESCENARIO A', 'ESCENARIO B']);
  const hojaCalculo = hojas['2-CÁLCULO'];

  return {
    nombreHojaInventario: hojaInventario ? hojaInventario : null,
    inventario: extraerInventario(hojas[hojaInventario]),
    calculo: extraerCalculo(hojaCalculo),
    sheetNames: workbook.SheetNames,
  };
}
