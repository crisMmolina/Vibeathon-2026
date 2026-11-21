# IDEA · Huella Rosa

> Challenge: **Reto 3 · Consolidación y visualización del impacto social** (EIRA Movimiento Rosa A.C.) · Event: **Nerdearla Vibeathon by Devin, CDMX, sáb 21-nov-2026** (coding 10:30–16:00, Devpost antes de las 16:00). Tags: **[Decided]** · **[Recommended]** · **[To validate]**.
> Every pitch number comes from §10 with a source. §4 → vertical tasks · §6 → contract · §7 → spikes · §8 → acceptance.

> ⚠️ **INSTRUCCIÓN PARA EL AGENTE (leer primero) [Decided]**
> - **100 % frontend.** Sin backend, sin base de datos y sin auth real. Todo corre en el navegador (Vite + React + TS). El parseo, la limpieza, el matching, los indicadores y el informe son módulos TS en `src/lib/`.
> - EIRA confirmó que **todo puede ser simulado**. Lo simulado se marca en la UI con un badge `SIMULADO`.
> - **Prioridad absoluta: que la demo de §4 corra de punta a punta.** Estética y animación > features extra. Si algo no cabe, se recorta o se finge con `demo_data`, nunca se deja roto.
> - Orden de construcción: P0 de §4 en orden → pulir la animación del mapa → P1. **No** abrir ramas nuevas después de las 14:45.
> - Todo con la identidad gráfica de EIRA (§0). Debe sentirse como un producto *de* EIRA.

---

## 0. Name and brand (fixed at T0)
- Name: **Huella Rosa** [Recommended] · repo: `huella-rosa` · tagline: **"Cada mujer cuenta, una sola vez."** (6 palabras: resume el problema del doble conteo).
  - Alternativas si no convence: "Mapa Rosa", "Cuenta Clara".
- Renaming after T−50% needs a human `uak decision`.
- **Look (referencias):**
  1. Sitio y guía de EIRA (eiraac.org y el PDF del reto): logo "EIRA" con la "A" triangular en rosa, fondos blancos y una marca de agua rosa pálido con forma de triángulo y lazo.
  2. Mapbox GL JS, ejemplo "Extrude polygons for 3D indoor mapping" / `fill-extrusion` (las alturas por estado).
  3. kepler.gl (vibe de dashboard geoespacial con puntos y paneles laterales).
- **Paleta EIRA [To validate con cuentagotas sobre el logo]:**
  - Rosa principal `#F08FAA` (logo y botones primarios).
  - Rosa profundo `#D9577F` (hover, alturas máximas y énfasis).
  - Rosa pálido `#FCE4EC` (fondos de tarjetas y la marca de agua).
  - Gris tinta `#3A3A3A` (texto).
  - Blanco `#FFFFFF` (fondo).
  - Semáforo de calidad: verde `#5BB98C`, ámbar `#F2B544`, rojo `#E25D5D`.
  - El mapa usa una rampa monocromática rosa pálido → rosa profundo para las alturas y un estilo base claro (`light-v11`) para que el rosa resalte.
- **Tipografía:** encabezados redondeados (Quicksand o Nunito) [To validate contra el logo]; cuerpo Inter.
- **Elementos de marca:**
  - Logo EIRA arriba a la izquierda en todas las pantallas (SVG recreado o imagen provista por EIRA [To validate permiso]).
  - Triángulo rosa translúcido como marca de agua en la pantalla de carga y en la portada del informe.
  - Microcopy cálido en segunda persona ("Tus datos no salen de esta computadora").

## 1. One line
Para **la dirección y las coordinaciones de EIRA**, que **consolidan a mano archivos de distintos programas para informar a donantes con riesgo de doble conteo (más de 51,000 personas beneficiadas acumuladas, que no equivalen a pacientes únicas)**, **Huella Rosa** les permite **cargar sus CSV/Excel, ver en un mapa 3D de México dónde está su impacto, resolver duplicados con confirmación humana y exportar un informe trazable**, a diferencia de **copiar y pegar entre hojas de Excel y sumar filas**.

**Edge over other teams:**
- La mayoría hará tablas y gráficas de barras. Nosotros convertimos la deduplicación en algo **visible**: cuando confirmas duplicados, las columnas 3D del mapa **bajan en vivo**. El doble conteo se *ve*.
- **Privacidad por diseño:** nada sale del navegador, sin servidor. Es el argumento más fuerte para "¿cómo cuidan los datos?".
- **"Otra campaña" = otro preset de mapeo (JSON), no otro código.** Responde directo a la lámina del jurado.

## 2. Users
| Persona | Moment | Need | Flow step |
|---|---|---|---|
| Laura, coordinadora de programa | Cierre de jornadas en varios estados | Subir sus archivos sin rehacer columnas | 1 |
| Dirección de EIRA | Junta con aliados o donantes | Ver de un vistazo dónde llegaron y a cuántas | 2 |
| Capturista o analista | Antes del informe | Limpiar faltantes y formatos inválidos | 3 |
| Coordinación (rol validador) | Revisión de calidad | Decidir si dos registros son la misma mujer, nunca automático | 4 |
| Responsable de alianzas | Reporte a un municipio o empresa aliada | Ver qué produjo cada alianza | 5 |
| Dirección de EIRA | Envío a donante | Un informe con fecha de corte, denominador y fuente | 6 |

## 3. Demo case
**El caso práctico oficial de la guía de EIRA, con datos sintéticos de resultado conocido.** "Dos archivos ficticios: uno con 120 atenciones y otro con 80 participaciones; algunas filas corresponden a una misma persona". Lo elegimos porque es *el* caso con el que EIRA va a juzgar.

Lo sembramos con una verdad conocida para poder demostrar que el sistema acierta:
- `jornadas_tamizaje.csv`: **120 atenciones** (Tamizaje Rosa: Papanicolaou, ultrasonido y exploración) de **110 mujeres** (10 regresaron a una segunda atención) en localidades de **Jalisco, Colima, Michoacán, Nayarit y Veracruz**.
- `salud_que_florece.xlsx`: **80 participaciones** (talleres de educación en salud) de **80 mujeres**, de las cuales **28 también aparecen en el archivo 1** con variaciones de escritura (acentos, segundo apellido omitido, teléfono con lada distinta).
- **4 homónimas trampa:** mismo nombre, distinta fecha de nacimiento y otra localidad. El sistema las sugiere, pero no deben fusionarse.
- Anomalías sembradas: 6 sin localidad, 3 fechas inválidas, 2 teléfonos inválidos, 1 atención fuera del periodo y 2 columnas con nombres distintos para el mismo campo (`Municipio` frente a `mpio`).
- `alianzas.csv`: **8 alianzas** (municipios, DIF y una empresa) con coordenadas y la jornada asociada.

**Resultado esperado (se muestra en el informe):**
- Filas totales: 200 (cota superior, "NO sumar").
- Personas únicas validadas: **162** = 110 + 80 − 28, solo después de que una persona confirme los 28 vínculos.
- Mientras no se validen, se muestra el intervalo **"entre 162 y 200 personas — estimado, no oficial"**.
- Atenciones = 120 · participaciones = 80 · servicios por tipo desglosados.

## 4. Demo flow (6 steps or fewer, 3 min or less; each step = one vertical task)
Front only: la columna "API" son funciones locales en `src/lib/`.

| # | User does | Sees on screen | API (local) | Prio |
|---|---|---|---|---|
| 1 | Arrastra los 2 archivos + `alianzas.csv` a la zona de carga (o clic en "Usar datos de demostración") | **Animación de "red neuronal":** cada columna detectada aparece como un nodo a la izquierda; líneas rosas animadas la conectan con los campos del modelo común a la derecha (persona, fecha_nac, localidad, servicio…), con % de confianza en cada línea. Contador de filas que sube. Luego una tabla de mapeo editable con el botón "Confirmar mapeo". | `ingest.parse(files)` → `mapping.suggest(columns)` | P0 |
| 2 | Confirma el mapeo | Transición al **mapa de México** (Mapbox), cámara inclinada (pitch 50°). Los estados se **elevan en 3D** escalonadamente según el número de pacientes (rampa rosa). Los **puntos de alianzas** aparecen con un pulso. Panel lateral con KPIs: atenciones, participaciones, intervalo de personas únicas y alertas de calidad. Toggle "Filas crudas / Personas únicas validadas". | `geo.aggregateByState(records)` · `geo.alliances()` | P0 |
| 3 | Entra a **Calidad** desde el aviso "14 alertas" | Lista con semáforo por regla (faltante, formato inválido, fuera de periodo, columna ambigua). Cada alerta permite corregir, excluir o aceptar con un motivo obligatorio, que queda en la bitácora de ajustes manuales. | `quality.run(records, rules)` · `audit.log()` | P0 |
| 4 | Entra a **Coincidencias** | Pares lado a lado con **puntaje y razones** ("misma fecha de nacimiento + misma localidad + nombre 93 %"). Botones "Es la misma persona" / "Son distintas". Las 4 homónimas aparecen marcadas como "revisar con cuidado". Al confirmar, el contador de personas únicas baja y **el mapa 3D se encoge en vivo** en el estado correspondiente. **Wow #2.** | `match.candidates(records)` · `match.decide(pairId, verdict)` | P0 |
| 5 | Clic en un punto de alianza o en la pestaña **Alianzas** | Ficha de la alianza: tipo, municipio, jornadas vinculadas, mujeres atendidas (únicas), servicios por tipo (gráfica) y botón "Informe de esta alianza". | `alliances.summary(id)` | P1 |
| 6 | Pestaña **Informe** → "Exportar" | Informe con la marca EIRA: portada rosa, indicadores con **fecha de corte, denominador, fuente y versión de regla**, mapa capturado, gráficas, anexo de ajustes manuales y la leyenda "estimado / validado". Descarga en PDF (impresión del navegador) y CSV. | `report.build(state)` · `report.exportPdf()` / `exportCsv()` | P0 |

- **Wow en una frase:** subes dos Excel y en segundos México se levanta en 3D con el impacto de EIRA; al confirmar duplicados, las columnas bajan: el doble conteo se ve desaparecer.
- **Segundos hasta el wow:** ~30 s (paso 1 de ~15 s de animación + transición al mapa).
- **Plan B:**
  - Si Mapbox falla (token o red): MapLibre GL con un estilo vacío y el GeoJSON local de estados (las extrusiones funcionan igual, sin teselas base).
  - Si no hay red, todo lo demás funciona offline porque es local.
  - Video de 60 s grabado a las 15:15 como respaldo.
  - El botón "Usar datos de demostración" precarga los archivos para no depender del drag and drop en vivo.

## 5. Technical core
- **Método:**
  - **Mapeo de columnas:** diccionario de sinónimos (`municipio|mpio|municipality` → `municipio`) + similitud de cadena (Jaro-Winkler) + inspección de muestras (regex de fecha, teléfono y CURP). Devuelve una confianza que la persona confirma.
  - **Calidad:** reglas explícitas y declarativas en `rules.json` (requerido, formato, rango de fechas del periodo, catálogo de estados y localidades).
  - **Matching:**
    1. Normalización (minúsculas, sin acentos, sin partículas "de la/del", apellidos separados).
    2. *Blocking* por `fecha_nac` o por `(estado, inicial_apellido)`.
    3. Puntaje Fellegi-Sunter simplificado: pesos fijos por campo (fecha de nacimiento, teléfono, nombre con Jaro-Winkler, localidad, CURP si existe).
    4. Umbrales: ≥ 0.85 "probable", 0.6–0.85 "revisar" y < 0.6 descartado.
    5. **Nunca** se fusiona sin un clic humano. El nombre nunca es llave.
    6. Referencia: Fellegi-Sunter (1969). Hay un uso documentado en bases de salud mexicanas (Heliyon 2022, §10).
  - **Indicadores:** cuentas separadas por entidad (persona, atención, participación y alianza), nunca sumadas entre sí. Personas únicas = clusters con vínculos confirmados; mientras falten decisiones, intervalo [cota inferior estimada, filas].
- **El LLM no produce ningún número.** Opcional (P2): un LLM redacta el párrafo narrativo del informe *a partir* de indicadores ya calculados y citando su ficha. Todos los números salen de `src/lib/indicators.ts`.
- **Validación honesta:** el dataset sintético tiene verdad conocida (28 vínculos reales y 4 homónimas falsas). El informe muestra precisión y recall del matcher sobre ese dataset ("sugirió 32 pares: 28 correctos y 4 homónimas que la persona rechazó") y lo etiqueta como "medido sobre datos sintéticos".

## 6. Data (contract in `src/schemas/`)
| Entity | Key fields | Source (license) |
|---|---|---|
| `SourceFile` | id, nombre, programa, periodo, filas, hash, fecha_carga | Cargado por la usuaria |
| `ColumnMapping` | source_col, target_field, confidence, confirmed_by | Generado + confirmado |
| `Person` (cluster) | person_id interno (UUID), record_ids[], status (estimada/validada) | Derivado |
| `Record` | record_id, source_file_id, nombre*, ap1*, ap2*, fecha_nac*, tel*, curp?, estado, municipio, localidad, cve_loc_inegi?, fecha_servicio, tipo (atención/participación), servicio | Sintético (`demo_data/`) |
| `QualityIssue` | record_id, rule_id, severity, resolution, reason, user, ts | Derivado |
| `MatchPair` | a_id, b_id, score, reasons[], verdict (pendiente/misma/distinta), user, ts | Derivado |
| `Alliance` | id, nombre, tipo (municipio/DIF/empresa/ONG), estado, municipio, lat, lng, jornadas[] | Sintético |
| `AuditEntry` | ts, user, action, entity, before, after, reason | Derivado |
| `Indicator` | id, nombre, valor, denominador, fecha_corte, fuente(s), regla_version, estado (estimado/validado) | Derivado |
| Geometría de estados | 32 polígonos, `cve_ent`, nombre | Marco Geoestadístico INEGI (uso libre con atribución) o un GeoJSON simplificado de GitHub [To validate licencia]; simplificar con mapshaper a menos de 500 KB |
| Coordenadas de localidades | `cve_loc`, lat, lng | Catálogo de localidades INEGI [To validate]; en la demo, unas 25 localidades hardcodeadas |

(*) Campos de identidad: solo en memoria. Se enmascaran en la UI ("Ma\*\*\* E\*\*\*") salvo en la pantalla de Coincidencias con rol validador.

## 7. AI and external APIs (each = a 30-min spike + a recorded fallback)
| Use | Model/API [To validate] | Key owner | Fallback |
|---|---|---|---|
| Mapa base + extrusión 3D | Mapbox GL JS v3 (`fill-extrusion`, token público `pk.`) | Equipo (cuenta Mapbox gratuita) | MapLibre GL + GeoJSON local sin teselas |
| Parseo CSV/Excel | PapaParse + SheetJS (`xlsx`), en el navegador | — | CSV únicamente |
| Animación "red neuronal" | Canvas 2D o SVG + Framer Motion (sin librería 3D pesada) | — | Animación CSS simple de líneas |
| Gráficas | Recharts (o ECharts) | — | Tablas estilizadas |
| Exportar informe | Vista de impresión `@media print` + `window.print()` (PDF) y CSV con Blob | — | Solo CSV |
| Persistencia local (opcional) | IndexedDB (Dexie) para que no se pierda al recargar | — | Estado en memoria (Zustand) |
| Texto narrativo del informe (P2) | LLM vía API | Equipo | Plantilla de texto con variables |
| **Sin backend.** Valkey/AWS quedan como "siguiente paso" (§9) | — | — | — |

## 8. Rubric → evidence
Pesos no publicados. Lo que el jurado dijo en la lámina de las 9:45: **demo con caso completo y datos ficticios · utilidad (¿cómo ayuda a EIRA? ¿es fácil?) · privacidad (¿cómo cuidan los datos? ¿qué cambiaría en otra campaña?).**

| Official criterion | Weight | Step/artifact that proves it |
|---|---|---|
| Funcionamiento real (caso completo) | n/p | Pasos 1→6 con el caso práctico de la guía; tabla "Implementado vs. Simulado" en el README y badges en la UI |
| Usabilidad / utilidad | n/p | Flujo guiado en 6 pestañas, botón de datos demo, textos en español claro y contraste AA; la coordinadora no escribe fórmulas |
| Impacto | n/p | Separación persona/atención/participación; intervalo honesto; informe trazable listo para donante (reduce días de consolidación manual) |
| Privacidad y confianza | n/p | Procesamiento 100 % local (los datos no salen del navegador); enmascaramiento; nunca fusión automática; bitácora de cada ajuste; "estimado ≠ oficial" visible |
| Escalabilidad / otra campaña | n/p | Presets de mapeo y reglas en JSON: una nueva campaña o programa = nuevo preset, sin código. Catálogos de estados y localidades nacionales |
| Innovación | n/p | Mapa 3D que se encoge al deduplicar; animación de mapeo; precisión y recall medidos sobre la verdad sintética |

## 9. Scope
- **Out:** backend, login real, multiusuario, sincronización, carga a la nube, Valkey y AWS. Se presentan como **próximos pasos para un piloto:** backend con roles, Valkey para caché de indicadores y Bloom filter de duplicados, almacenamiento cifrado, respaldo y análisis jurídico de datos sensibles.
- **Simulated with `demo_data`:**
  - Los 3 archivos.
  - Las coordenadas de unas 25 localidades.
  - Los usuarios y roles (un selector "Actuar como: Coordinación / Capturista").
  - El "envío" del informe.
- **UI language:** español (México).
- **Ethics/data:**
  - Cero datos reales. Nombres claramente ficticios ("María Ejemplo", "Ana Ejemplo Ruiz").
  - La deduplicación estimada se rotula siempre "estimado, no oficial" hasta que la valide una persona.
  - Las cifras institucionales (más de 51,000) se citan tal como las da EIRA, sin reinterpretarlas.
  - Ningún dato clínico (resultados) en este reto: solo tipo de servicio.
- **Timebox [Decided]:**

  | Hora | Qué |
  |---|---|
  | 11:45–12:15 | Scaffold, marca y generación de `demo_data` |
  | 12:15–13:30 | Paso 1 (carga, animación y mapeo) + paso 2 (mapa 3D) |
  | 14:30–15:15 | Pasos 3, 4 y 6 |
  | 15:15–15:30 | Paso 5 si da tiempo, README y video |
  | 15:30–15:50 | Ensayo y envío a Devpost |

## 10. Citable facts (verified on 2026-11-21)
| Fact | Source URL |
|---|---|
| EIRA reporta más de 51,000 personas beneficiadas acumuladas a sep-2026; *no* equivale a pacientes únicas ni a estudios | Guía institucional y técnica de EIRA para participantes (PDF del evento) |
| Caso práctico: 2 archivos, 120 atenciones y 80 participaciones, con personas repetidas | Guía EIRA, Reto 3 |
| Límite: nunca presentar una deduplicación estimada como cifra oficial sin validación | Guía EIRA y Devpost: https://vibeathon-mexico-2026.devpost.com/ |
| En 2025 EIRA reporta más de 40,000 mujeres impactadas y 86,000 estudios (personas ≠ estudios) | https://eiraac.org/ |
| Programa de pobreza menstrual 2025: 6,606 mujeres en 71 comunidades de Jalisco y Veracruz | https://eiraac.org/ |
| Cáncer de mama: 1.ª causa de muerte por tumores malignos en mujeres en 2024; 8,451 defunciones | https://www.unotv.com/salud/38-de-mujeres-con-cancer-de-mama-no-recibio-tratamiento-medico-5-senales-mas-alla-de-sentir-un-bulto/ (INEGI) |
| Jalisco entre las 5 entidades con mayor mortalidad por cáncer de mama (22.4, 2023) | https://www.nmas.com.mx/salud/enfermedades/donde-hay-mas-muertes-cancer-de-mama-mexico-estados-norte-encabezan-fallecimientos/ |
| 75.2 % de la población rural usa internet (frente a 88.9 % urbana); solo 38.1 % usa computadora | https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2026/endutih/ENDUTIH_25.pdf |
| La salud es dato personal sensible según la nueva LFPDPPP (vigente desde el 21-03-2025) | https://www.garrigues.com/es_ES/noticia/mexico-nueva-ley-federal-proteccion-datos-personales-posesion-particulares-introduce |
| Fellegi-Sunter aplicado con buena sensibilidad y VPP a bases de salud mexicanas sin identificador común | https://doaj.org/article/036c1f5f9d4444cc8006e7eedfe45aec |
