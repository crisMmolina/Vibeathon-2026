# Huella Rosa · Cada mujer cuenta, una sola vez

> Nombre provisional. Reto 3 de EIRA Movimiento Rosa A.C. · *Consolidación y visualización del impacto social* · Nerdearla Vibeathon by Devin, CDMX, 21-nov-2026.

**Demo en vivo:** https://vibeathon-2026.onrender.com · **Video:** https://youtu.be/wpDOipo3QRg · todo corre en tu navegador, sin servidor.

EIRA consolida a mano los archivos de sus programas para informar a donantes. Ahí aparece el **doble conteo**: EIRA reporta más de 51,000 personas beneficiadas acumuladas, pero esa cifra *no equivale* a pacientes únicas (Guía institucional y técnica de EIRA para participantes). Esta app carga los CSV y Excel de cada programa, muestra en un mapa 3D de México dónde está el impacto, ayuda a resolver duplicados **siempre con confirmación humana** y exporta un informe trazable.

**El wow:** subes dos archivos y los estados de México se elevan en rosa según el número de mujeres. Al confirmar que dos registros son la misma persona, el contador baja y el estado **se encoge en vivo**. El doble conteo se ve desaparecer.

## El flujo (6 pasos)

| # | Pantalla | Qué hace |
|---|---|---|
| 1 | **Carga** | Arrastra los archivos o usa "Usar datos de demostración". Cada columna se conecta animadamente a un campo del modelo común con su % de confianza (`Municipio` y `mpio` caen en el mismo campo). Nada se guarda hasta "Confirmar mapeo". |
| 2 | **Mapa** | Mapa 3D (Mapbox) con los estados extruidos por personas, puntos de alianzas y panel de KPIs: atenciones, participaciones y personas únicas como intervalo "estimado, no oficial". |
| 3 | **Calidad** | Alertas con semáforo (faltantes, fechas y teléfonos inválidos, fuera de periodo, columnas ambiguas). Corregir, excluir o aceptar exige un motivo, que queda en la bitácora. |
| 4 | **Coincidencias** | Pares lado a lado con puntaje y razones. "Es la misma persona" / "Son distintas". Las homónimas se marcan "revisar con cuidado". Nunca se fusiona sola. |
| 5 | **Alianzas** | Ficha por alianza: tipo, municipio, jornadas, mujeres únicas y servicios por tipo. Clic en un punto del mapa abre su ficha. |
| 6 | **Informe** | Portada con los indicadores (fecha de corte, denominador, fuente y versión de regla), gráficas sugeridas, "Arma tu gráfica", precisión del matcher, anexo de ajustes manuales. Exporta PDF (impresión) y CSV. |

## Implementado vs. Simulado

| Parte | Estado | Detalle |
|---|---|---|
| Lectura de CSV y Excel en el navegador | Implementado | PapaParse + SheetJS; ningún archivo sale de la computadora |
| Mapeo de columnas con confianza | Implementado | Diccionario de sinónimos en un preset JSON + Jaro-Winkler + inspección de valores |
| Reglas de calidad | Implementado | Declarativas en `web/src/lib/rules.json` |
| Detección de duplicados | Implementado | Normalización, *blocking* y puntaje Fellegi-Sunter simplificado; decisión siempre humana |
| Indicadores e intervalo honesto | Implementado | Personas, atenciones y participaciones se cuentan por separado y nunca se suman |
| Mapa 3D | Implementado | Mapbox GL `fill-extrusion`; sin token o sin red cae a MapLibre con GeoJSON local |
| Informe con gráficas, PDF y CSV | Implementado | Recharts, `window.print()` y Blob |
| Bitácora de ajustes manuales | Implementado | Quién, cuándo, qué y por qué en cada cambio |
| Datos de los programas | **Simulado** | `web/public/demo_data/`: 120 atenciones de 110 mujeres y 80 participaciones, con 28 mujeres en ambos archivos, 4 homónimas trampa y 14 anomalías sembradas. Nombres ficticios. Resultado conocido: 162 personas únicas |
| Coordenadas de localidades y alianzas | **Simulado** | ~25 localidades y 8 alianzas sintéticas |
| Usuarios y roles | **Simulado** | Selector "Actuar como: Coordinación / Capturista" |
| Envío del informe al donante | **Simulado** | Se descarga el PDF o CSV y se comparte por el canal habitual |
| Persistencia y multiusuario | No incluido | El estado vive en memoria; ver próximos pasos |

Todo lo simulado se marca en la interfaz con `SIMULADO` o `DATOS SINTÉTICOS`.

## Privacidad

- **100 % local:** sin backend, sin base de datos, sin envío de datos. El único recurso externo son las teselas del mapa base de Mapbox, que no reciben ningún registro.
- **Nunca fusión automática:** el sistema solo sugiere; una persona con rol validador decide cada par.
- **Enmascaramiento:** los campos de identidad se ocultan fuera de la pantalla de Coincidencias para quien no valida.
- **"Estimado ≠ oficial":** mientras haya coincidencias por decidir, la cifra de personas se muestra como intervalo y con esa leyenda.
- Contexto: la salud es dato personal sensible según la nueva LFPDPPP, vigente desde el 21-03-2025 ([Garrigues](https://www.garrigues.com/es_ES/noticia/mexico-nueva-ley-federal-proteccion-datos-personales-posesion-particulares-introduce)).

## Otra campaña = otro preset, no otro código

Los sinónimos de columnas, el periodo y el tipo de registro por programa viven en `web/src/lib/presets/eira-2026.json`. Las reglas de calidad viven en `web/src/lib/rules.json`. Un programa nuevo es un archivo JSON nuevo.

## Correrlo

```bash
cd web
npm ci
npm run dev        # http://localhost:5173
npm test -- --run  # pruebas
npm run build      # sitio estático en web/dist
```

Opcional: crea `.env` en la raíz con `VITE_MAPBOX_TOKEN=pk....` (token público de Mapbox). Sin token, el mapa usa MapLibre con el GeoJSON local de estados.

**Despliegue:** Render Static Site · Root Directory `web` · Build `npm ci && npm run build` · Publish `dist` · rewrite `/*` → `/index.html`.

## Stack

Vite + React + TypeScript · Zustand · PapaParse · SheetJS · Mapbox GL / MapLibre GL · Recharts · Framer Motion · Vitest.

## Validación honesta

El dataset sintético tiene verdad conocida (28 vínculos reales, 10 segundas visitas y 4 homónimas falsas). El informe calcula la precisión y la exhaustividad de las sugerencias contra esa verdad y lo etiqueta "medido sobre datos sintéticos". Método de referencia: Fellegi-Sunter, con uso documentado en bases de salud mexicanas sin identificador común ([DOAJ](https://doaj.org/article/036c1f5f9d4444cc8006e7eedfe45aec)).

## Próximos pasos para un piloto

Backend con roles y autenticación real, almacenamiento cifrado y respaldo, caché de indicadores, análisis jurídico de datos sensibles, catálogo nacional de localidades (INEGI) y geometría de estados del Marco Geoestadístico de INEGI (la actual es un GeoJSON de GitHub con licencia por validar, ver `web/public/geo/SOURCE.md`).

## Video

Recorrido completo del flujo: https://youtu.be/wpDOipo3QRg
