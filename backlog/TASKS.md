# Backlog published on claims (uak plan)

Append-only; added to .uak/TASKS.md from main. Why: adding tasks never waits for a PR.
## HR-010 · Lógica de carga y mapeo de columnas (sin UI)

- **Type:** feature
- **Priority:** P0
- **Estimate:** 35 min
- **Rubric / Spec:** C1, C4 · IDEA.md §4 step 1, §5 mapping
- **Depends on:** HR-001
- **Uses contract:** HR-001
- **Related:** HR-003
- **Paths:** web/src/lib/ingest.ts, web/src/lib/mapping.ts, web/src/lib/presets/, web/src/lib/ingest.test.ts, web/src/lib/mapping.test.ts
- **Freeze-Allowed:** no
- **Acceptance:** `ingest.parse(files)` reads CSV (PapaParse) and XLSX (SheetJS) in the browser into rows + SourceFile metadata, `mapping.suggest(columns, samples)` returns ColumnMapping[] with confidence 0..1 from a synonym dictionary, Jaro-Winkler and sample regex (date, phone, CURP), `mapping.apply(rows, mappings)` returns schema Records; the demo files give 200 records, Mapping presets live as JSON in `web/src/lib/presets/` (another campaign = another preset)
- **Tests:** parses_csv_and_xlsx_into_200_records, maps_municipio_and_mpio_to_the_same_field, suggests_confidence_below_1_for_fuzzy_matches, keeps_identity_fields_out_of_any_network_call
- **Verify:** `npm --prefix web test -- --run src/lib/ingest.test.ts src/lib/mapping.test.ts && npm --prefix web run build`
- **Next step:** write the 4 tests against stubs in `web/src/lib/mapping.test.ts` and `ingest.test.ts`, then `uak red HR-010`

## HR-011 · Lógica de mapa e indicadores (sin UI)

- **Type:** feature
- **Priority:** P0
- **Estimate:** 35 min
- **Rubric / Spec:** C1, C5 · IDEA.md §4 step 2, §5 indicators
- **Depends on:** HR-001
- **Uses contract:** HR-001
- **Related:** HR-004
- **Paths:** web/src/lib/geo.ts, web/src/lib/indicators.ts, web/src/lib/geo.test.ts, web/src/lib/indicators.test.ts, web/public/geo/
- **Freeze-Allowed:** no
- **Acceptance:** `web/public/geo/estados.geojson`: 32 states with `cve_ent` and name, under 500 KB, source and license noted in `web/public/geo/SOURCE.md`, `geo.aggregateByState(records, people?)` gives people per `cve_ent` for the extrusion height, `indicators.compute(state)` gives atenciones, participaciones and unique people as an interval [validated lower bound, rows] until every link is decided, each with cut-off date, denominator, sources and rule version
- **Tests:** aggregates_people_by_state_from_records, never_sums_atenciones_and_participaciones, shows_interval_until_links_are_confirmed
- **Verify:** `npm --prefix web test -- --run src/lib/geo.test.ts src/lib/indicators.test.ts && npm --prefix web run build`
- **Next step:** write the 3 tests against stubs in `web/src/lib/indicators.test.ts` and `geo.test.ts`, then `uak red HR-011`
