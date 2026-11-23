/**
 * Generación y descarga del acta de corrección en Excel (SheetJS).
 */
import * as XLSX from 'xlsx';

export function descargarActa(alumnos, nombreArchivo = 'Acta_correccion_huella_carbono.xlsx') {
  const filas = alumnos.map((a) => {
    const catPorClave = {};
    a.resultado.categorias.forEach((c) => {
      catPorClave[c.clave] = c;
    });
    return {
      Alumno: a.nombre,
      Archivo: a.archivo.name,
      Nota: a.resultado.nota,
      Nivel: a.resultado.nivel,
      'Agua (t)': catPorClave.agua?.valorAlumno ?? '-',
      'Esperado Agua (t)': catPorClave.agua?.valorEsperado?.toFixed(3) ?? '-',
      'Electricidad (t)': catPorClave.electricidad?.valorAlumno ?? '-',
      'Esperado Electricidad (t)': catPorClave.electricidad?.valorEsperado?.toFixed(3) ?? '-',
      'Combustibles (t)': catPorClave.combustibles?.valorAlumno ?? '-',
      'Esperado Combustibles (t)': catPorClave.combustibles?.valorEsperado?.toFixed(3) ?? '-',
      'Residuos (t)': catPorClave.residuos?.valorAlumno ?? '-',
      'Esperado Residuos (t)': catPorClave.residuos?.valorEsperado?.toFixed(3) ?? '-',
      'Transporte (t)': catPorClave.transporte?.valorAlumno ?? '-',
      'Esperado Transporte (t)': catPorClave.transporte?.valorEsperado?.toFixed(3) ?? '-',
      'TOTAL alumno (t)': a.resultado.total.alumno ?? '-',
      'TOTAL esperado (t)': a.resultado.total.esperado?.toFixed(3) ?? '-',
      'Estado TOTAL': a.resultado.total.estado,
      Errores: a.resultado.errores.length,
      Avisos: a.resultado.avisos.length,
      Observaciones: (a.resultado.sugerencias.slice(0, 3).join(' | ') ||
        a.resultado.logros.slice(0, 2).join(' | ') ||
        '-'),
    };
  });

  const ws = XLSX.utils.json_to_sheet(filas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Acta');

  // Anchos de columna aproximados
  const anchos = filas[0]
    ? Object.keys(filas[0]).map(() => 18)
    : [];
  ws['!cols'] = anchos;

  XLSX.writeFile(wb, nombreArchivo);
}

/**
 * Descarga el reporte individual de un alumno en formato texto/markdown.
 */
export function descargarReporteAlumno(a) {
  const lineas = [];
  lineas.push(`# Corrección de tarea — Huella de Carbono`);
  lineas.push(`**Alumno:** ${a.nombre}`);
  lineas.push(`**Archivo:** ${a.archivo.name}`);
  lineas.push(`**Nota:** ${a.resultado.nota} / 10 — *${a.resultado.nivel}*`);
  lineas.push('');
  lineas.push(`## Por categoría`);
  lineas.push(`| Categoría | Alumno (t CO2eq) | Esperado (t CO2eq) | Estado |`);
  lineas.push(`|---|---|---|---|`);
  for (const c of a.resultado.categorias) {
    lineas.push(
      `| ${c.nombre} | ${c.valorAlumno != null ? c.valorAlumno.toFixed(3) : '—'} | ${c.valorEsperado.toFixed(3)} | ${c.estado} |`,
    );
  }
  lineas.push('');
  lineas.push(`## Total`);
  lineas.push(
    `- Alumno: ${a.resultado.total.alumno != null ? a.resultado.total.alumno.toFixed(3) : '—'} t CO2eq`,
  );
  lineas.push(
    `- Esperado: ${a.resultado.total.esperado?.toFixed(3) ?? '—'} t CO2eq`,
  );
  lineas.push(`- Estado: ${a.resultado.total.estado}`);
  lineas.push('');
  if (a.resultado.errores.length) {
    lineas.push(`## Errores`);
    for (const e of a.resultado.errores) lineas.push(`- ❌ ${e.mensaje}`);
    lineas.push('');
  }
  if (a.resultado.avisos.length) {
    lineas.push(`## Avisos`);
    for (const av of a.resultado.avisos) lineas.push(`- ⚠️ ${av.mensaje}`);
    lineas.push('');
  }
  if (a.resultado.sugerencias.length) {
    lineas.push(`## Sugerencias`);
    for (const s of a.resultado.sugerencias) lineas.push(`- 💡 ${s}`);
    lineas.push('');
  }
  if (a.resultado.logros.length) {
    lineas.push(`## Logros`);
    for (const l of a.resultado.logros) lineas.push(`- ✅ ${l}`);
  }

  const blob = new Blob([lineas.join('\n')], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const aEl = document.createElement('a');
  aEl.href = url;
  aEl.download = `Reporte_${a.nombre.replace(/\s+/g, '_')}.md`;
  document.body.appendChild(aEl);
  aEl.click();
  document.body.removeChild(aEl);
  URL.revokeObjectURL(url);
}
