export const MODELOS_GEMINI = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
];

function construirPrompt(datos, resultado, nivel) {
  var p = 'Eres un consejero pedagógico experto en huella de carbono y sostenibilidad.\n';
  p += 'Un alumno ha introducido sus datos de consumo anual en una calculadora interactiva.\n';
  p += 'Tu objetivo es dar feedback pedagógico, cercano y accionable.\n';
  p += 'DATOS DEL ALUMNO:\n';
  p += '- Agua: ' + datos.agua + ' m3/año\n';
  p += '- Electricidad: ' + datos.electricidad + ' kWh/año\n';
  p += '- Combustibles: ' + JSON.stringify(datos.combustibles) + '\n';
  p += '- Residuos (kg): papel ' + datos.residuos.papel + ', envases ' + datos.residuos.envases + ', vidrio ' + datos.residuos.vidrio + ', organico ' + datos.residuos.organico + ', otros ' + datos.residuos.otros + '\n';
  p += '- Transporte (km/año): privado combustion ' + datos.transporte.privadoCombustion + ', privado electrico ' + datos.transporte.privadoElectrico + ', autobus/barcos ' + datos.transporte.autobusBarcos + ', tren/metro ' + datos.transporte.trenMetro + ', avion ' + datos.transporte.avion + '\n';
  p += '\nRESULTADO DEL CÁLCULO:\n';
  p += '- Total: ' + resultado.totalT.toFixed(3) + ' t CO2e/año\n';
  p += '- Nivel general: ' + nivel + '\n';
  p += '- Por categoría:\n';
  for (var i = 0; i < resultado.categorias.length; i++) {
    var c = resultado.categorias[i];
    p += '  * ' + c.nombre + ': ' + c.t.toFixed(3) + ' t CO2e\n';
  }
  p += '\nINSTRUCCIONES:\n';
  p += '1. Responde SIEMPRE en español.\n';
  p += '2. No des notas numéricas (tipo 7/10). Usa lenguaje cualitativo.\n';
  p += '3. Explica qué significa el resultado de forma sencilla.\n';
  p += '4. Dile QUÉ DEBERÍA REVISAR o cambiar en cada apartado, con consejos concretos y realistas.\n';
  p += '5. Sé alentador, no alarmista.\n';
  p += '6. Responde ÚNICAMENTE en formato JSON válido, sin texto antes ni después, con esta estructura:\n';
  p += '\n{\n';
  p += '  "resumen": "texto breve de 2-3 líneas",\n';
  p += '  "fortalezas": ["cosa que hace bien 1", "cosa que hace bien 2"],\n';
  p += '  "areasMejora": ["apartado a mejorar 1", "apartado a mejorar 2"],\n';
  p += '  "consejos": [\n';
  p += '    {"apartado": "Agua", "consejo": "texto concreto"},\n';
  p += '    {"apartado": "Electricidad", "consejo": "texto concreto"},\n';
  p += '    {"apartado": "Transporte", "consejo": "texto concreto"}\n';
  p += '  ],\n';
  p += '  "mensajeFinal": "frase de cierre motivadora de 1 línea"\n';
  p += '}\n';
  return p;
}

function extraerJSON(texto) {
  var inicio = texto.indexOf('{');
  var fin = texto.lastIndexOf('}');
  if (inicio === -1 || fin === -1) throw new Error('No se encontró JSON en la respuesta de la IA.');
  return texto.substring(inicio, fin + 1);
}

async function llamarGemini(apiKey, modelo, prompt) {
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + modelo + ':generateContent?key=' + apiKey;
  var respuesta = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 1536 },
    }),
  });

  if (!respuesta.ok) {
    var texto = await respuesta.text();
    if (respuesta.status === 429 || respuesta.status === 403 || respuesta.status === 404) {
      var err = new Error('Modelo ' + modelo + ' rechazado (' + respuesta.status + ')');
      err.reintentar = true;
      throw err;
    }
    throw new Error('Error ' + respuesta.status + ': ' + texto);
  }

  var data = await respuesta.json();
  var textoResp = data.candidates ? data.candidates[0]?.content?.parts?.[0]?.text : '';
  if (!textoResp) throw new Error('La IA no devolvió contenido.');
  return JSON.parse(extraerJSON(textoResp));
}

function ReintentoError(mensaje) {
  var err = new Error(mensaje);
  err.reintentar = true;
  return err;
}

export async function evaluarConIA(datos, resultado, nivel, apiKey, indice) {
  if (indice >= MODELOS_GEMINI.length) {
    throw new Error('Se agotaron los modelos de Gemini para reintentar.');
  }

  var modelo = MODELOS_GEMINI[indice];
  var prompt = construirPrompt(datos, resultado, nivel);

  try {
    return await llamarGemini(apiKey, modelo, prompt);
  } catch (err) {
    if (err && err.reintentar) {
      return evaluarConIA(datos, resultado, nivel, apiKey, indice + 1);
    }
    return evaluarConIA(datos, resultado, nivel, apiKey, indice + 1);
  }
}
