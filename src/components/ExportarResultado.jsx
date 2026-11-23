/**
 * Descarga el resultado en formato Markdown (texto).
 */
import * as XLSX from 'xlsx';

export default function ExportarResultado({ nombre, datos, resultado, feedbackIA }) {
  const generarTexto = () => {
    const lineas = [];
    lineas.push('# Mi Huella de Carbono — Resultado');
    lineas.push('');
    lineas.push(`**Fecha:** ${new Date().toLocaleDateString('es-ES')}`);
    lineas.push(`**Total anual:** ${resultado.totalT.toFixed(2)} t CO2e`);
    lineas.push('');
    lineas.push('## Por categoría');
    lineas.push('| Categoría | Valor | Emisiones | % del total |');
    lineas.push('|---|---|---|---|');
    for (const c of resultado.categorias) {
      const pct = ((c.t / resultado.totalT) * 100).toFixed(1) || '0';
      lineas.push(`| ${c.nombre} | ${c.dato} ${c.unidad} | ${c.t.toFixed(3)} t | ${pct} % |`);
    }
    lineas.push('');
    lineas.push('## Feedback');
    for (const c of resultado.categorias) {
      lineas.push(`- **${c.nombre}:** ${c.t.toFixed(3)} t CO2e`);
    }
    if (feedbackIA) {
      lineas.push('');
      lineas.push('## Consejo del asesor IA');
      lineas.push(`> ${feedbackIA.resumen}`);
      if (feedbackIA.consejos) {
        for (const c of feedbackIA.consejos) {
          lineas.push(`- **${c.apartado}:** ${c.consejo}`);
        }
      }
      lineas.push(`> ${feedbackIA.mensajeFinal}`);
    }
    return lineas.join('\n');
  };

  const descargarTexto = () => {
    const texto = generarTexto();
    const blob = new Blob([texto], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `huella_carbono_${nombre || 'alumno'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const descargarExcel = () => {
    const filas = [{
      'Fecha': new Date().toLocaleDateString('es-ES'),
      'Total t CO2e': resultado.totalT.toFixed(2),
      ...resultado.categorias.reduce((acc, c) => {
        acc[`${c.nombre} (t)`] = c.t.toFixed(3);
        return acc;
      }, {}),
    }];
    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Resultado');
    XLSX.writeFile(wb, `huella_carbono_${nombre || 'alumno'}.xlsx`);
  };

  return (
    <div className="flex gap-3 pt-4">
      <button onClick={descargarTexto} className="btn-outline">
        📄 Descargar resumen (Markdown)
      </button>
      <button onClick={descargarExcel} className="btn-primary">
        📊 Descargar Excel
      </button>
    </div>
  );
}
