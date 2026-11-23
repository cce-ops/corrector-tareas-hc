# 🌍 Corrector de Tareas — Huella de Carbono

Herramienta web para el profesorado que **corrige las tareas entregables (Excel) de la actividad de huella de carbono** del alumnado.

Sube los `.xlsx` entregados por los alumnos, la app lee las hojas `1-INVENTARIO` y `2-CÁLCULO`, compara los valores del alumno con lo esperado usando factores de emisión, y genera un **acta con nota sobre 10 por alumno**, estados por categoría (correcto / sobrestimado / subestimado / pendiente) y exportación a Excel.

> ✅ Todo es **frontend**: se ejecuta en el navegador, no hay base de datos, ni backend, ni se envían datos de alumnos a ningún servidor. Al recargar, la sesión se borra.

---

## 🚀 Puesta en marcha

### Requisitos
Node.js (v18 o superior) y npm.

```bash
# 1. Entra en la carpeta del proyecto
cd corrector-tareas-hc

# 2. Instala dependencias
npm install

# 3. Arranca en modo desarrollo (http://localhost:5173)
npm run dev
```

### Cómo se usa
1. Arrastra uno o varios Excel de alumnos (`.xlsx`) a la zona de subida.
2. La app corrige cada uno y muestra el **acta grupal**: alumno, archivo, nota /10, nivel, categorías correctas y estado del TOTAL.
3. Ajusta los **factores de emisión** si tu guía de asignatura usa otros valores (se aplican a toda la sesión).
4. Haz clic en **Ver detalle** de un alumno para ver errores, avisos, sugerencias y logros, y descarga su reporte individual en Markdown.
5. Exporta el acta completa a Excel (`.xlsx`) con un clic.

---

## 📋 Estructura esperada del Excel de los alumnos

La app espera la plantilla que ya usáis, con estas hojas:

| Hoja | Qué se lee |
|------|------------|
| `1-INVENTARIO` (o `ESCENARIO A` / `ESCENARIO B`) | Datos de actividad: agua (m3/año), electricidad (kWh/año), combustibles, residuos (kg/año) y transporte (km/año). El nombre del alumno se lee de la celda `A1`. |
| `2-CÁLCULO` | Valores de `t CO2eq` por categoría (filas 6-10, columna C) y el `TOTAL` (celda C11), más el alcance por categoría (columna A). |

Columnas de inventario (por posición de la plantilla):
- **B** Agua m3/año · **C** Electricidad kWh/año · **D** tipo combustible · **E** unidad combustible · **F-J** residuos (papel, envases, vidrio, orgánico, otros en kg/año) · **K-O** transporte (privado combustión, privado eléctrico, autobús/barcos, tren/metro, avión).

### Nota del alumno (sobre 10)
Cada categoría (Agua, Electricidad, Combustibles, Residuos, Transporte) vale 2 puntos si el valor del alumno coincide con lo esperado (tolerancia del 10 %). Celdas vacías puntúan 0 y se marcan como pendientes.

---

## ⚙️ Factores de emisión

Los valores por defecto vienen en `src/lib/factores.js` (kg CO2e por unidad): electricidad 0.26/kWh, agua 0.30/m3, combustibles, residuos y transporte por tipo. El profesor puede editarlos desde la app según la guía de la asignatura sin tocar el código.

---

## 📦 Despliegue

Es una aplicación estática (Vite). Genera el build:

```bash
npm run build
```

La carpeta `dist/` se puede publicar en **GitHub Pages**, **Vercel** o **Netlify** (arrastra la carpeta `dist` o conecta el repositorio).

### Publicar en tu GitHub (cce-ops)

```bash
cd corrector-tareas-hc
git init
git add .
git commit -m "feat: corrector de tareas de huella de carbono"

# Crea el repositorio en github.com/cce-ops/corrector-tareas-hc y luego:
git remote add origin https://github.com/cce-ops/corrector-tareas-hc.git
git branch -M main
git push -u origin main
```

---

## 🛠 Stack

- React 18 + Vite
- Tailwind CSS (vía CDN)
- SheetJS (`xlsx`) para leer/escribir Excel
- Sin framework de UI pesado: componentes propios y accesibles

---

## 🔒 Privacidad

Los archivos de los alumnos solo se leen en memoria del navegador para calcular la corrección. No se suben a ningún servidor, no se guardan en `localStorage` ni se envían a terceros. Al cerrar o recargar la pestaña, todo desaparece.
