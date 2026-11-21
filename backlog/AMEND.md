# Amended tasks (uak plan --amend)

Append-only; the last section of an ID replaces its section in the backlog. Why: Paths can grow before review.

## HR-003 · Paso 1: pantalla de carga, animación de mapeo y confirmar mapeo

- **Type:** feature
- **Priority:** P0
- **Estimate:** 40 min
- **Rubric / Spec:** C1, C2 · IDEA.md §4 step 1
- **Depends on:** HR-002, HR-010
- **Uses contract:** HR-001, HR-010
- **Related:** HR-004
- **Paths:** web/src/features/upload/
- **Freeze-Allowed:** no
- **Acceptance:** Recipe: flow · Hero: the column-to-field "neural network" animation, Dropping the 3 demo files, or clicking "Usar datos de demostración", shows each detected column as a node linked to a common-model field with its confidence %, The mapping table is editable and "Confirmar mapeo" stores the records in the store, The animation respects `prefers-reduced-motion`; empty, loading and error states exist
- **Tests:** demo_button_loads_the_three_demo_files, confirm_mapping_stores_records_in_the_store
- **Verify:** `npm --prefix web test -- --run src/features/upload && npm --prefix web run build`
- **Next step:** write the 2 tests in `web/src/features/upload/upload.test.tsx`, then `uak red HR-003`

## HR-004 · Paso 2: mapa 3D de México con estados elevados y KPIs

- **Type:** feature
- **Priority:** P0
- **Estimate:** 40 min
- **Rubric / Spec:** C1, C5 · IDEA.md §4 step 2
- **Depends on:** HR-002, HR-011
- **Uses contract:** HR-001, HR-011
- **Related:** HR-003
- **Paths:** web/src/features/map/
- **Freeze-Allowed:** no
- **Acceptance:** Recipe: map + panel · Hero: the 3D extruded states map, Mapbox GL (`light-v11`, `VITE_MAPBOX_TOKEN`): the states themselves extrude with `fill-extrusion` and a pale-to-deep pink ramp by people; no bars or cylinders; alliance points pulse; camera pitch 50°, Without a token or network it falls back to MapLibre with `web/public/geo/estados.geojson`, Side panel KPIs from `indicators.compute`: atenciones, participaciones, "entre 162 y 200 personas — estimado, no oficial"; toggle raw rows / validated people; every number has a source tooltip
- **Tests:** map_view_shows_kpis_for_the_demo_records, falls_back_to_maplibre_without_token
- **Verify:** `npm --prefix web test -- --run src/features/map && npm --prefix web run build`
- **Next step:** write the 2 tests in `web/src/features/map/map.test.tsx`, then `uak red HR-004`
