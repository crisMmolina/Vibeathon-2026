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
## HR-012 · Lógica de calidad, coincidencias y bitácora (sin UI)

- **Type:** feature
- **Priority:** P0
- **Estimate:** 40 min
- **Rubric / Spec:** C3, C5 · IDEA.md §4 steps 3-4, §5 quality and matching
- **Depends on:** HR-001
- **Uses contract:** HR-001, HR-010
- **Related:** HR-005
- **Paths:** web/src/lib/quality.ts, web/src/lib/match.ts, web/src/lib/audit.ts, web/src/lib/rules.json, web/src/lib/quality.test.ts, web/src/lib/match.test.ts
- **Freeze-Allowed:** no
- **Acceptance:** `quality.run(records, rules)` finds the 14 seeded alerts (6 missing locality, 3 invalid dates, 2 invalid phones, 1 out of period, ambiguous column) with severity; rules are declarative in `rules.json`, `match.candidates(records)`: normalization, blocking by birth date or (state, surname initial), simplified Fellegi-Sunter score with reasons; thresholds ≥0.85 probable, 0.6–0.85 review, On the demo it suggests the 28 true links and the 10 repeat visits, and flags the 4 homonyms for careful review, `match.decide(pairs, pairId, verdict, user)` never merges without a human verdict; `audit.log` records every manual adjustment with a mandatory reason
- **Tests:** finds_the_14_seeded_quality_alerts, suggests_the_28_true_links, flags_the_4_homonyms_for_careful_review, never_merges_without_a_human_verdict, logs_every_manual_adjustment_with_reason
- **Verify:** `npm --prefix web test -- --run src/lib/quality.test.ts src/lib/match.test.ts && npm --prefix web run build`
- **Next step:** write the 5 tests against stubs, then `uak red HR-012`

## HR-005 · Pasos 3 y 4: pantallas de Calidad y Coincidencias que encogen el mapa

- **Type:** feature
- **Priority:** P0
- **Estimate:** 40 min
- **Rubric / Spec:** C3, C5 · IDEA.md §4 steps 3-4
- **Depends on:** HR-002, HR-012
- **Uses contract:** HR-001, HR-004, HR-012
- **Related:** HR-004
- **Paths:** web/src/features/quality/, web/src/features/matches/
- **Freeze-Allowed:** no
- **Acceptance:** Recipe: list (quality) and detail (matches) · Hero: the side-by-side pair with score and reasons, Quality lists the alerts with a traffic light; correct, exclude or accept requires a reason that lands in the audit log, Matches shows pairs side by side with "Es la misma persona" / "Son distintas"; homonyms marked "revisar con cuidado"; identity fields masked except for the validator role, Confirming a pair lowers the unique-people count and the state's extrusion live
- **Tests:** quality_view_requires_a_reason_to_accept, confirming_a_pair_lowers_unique_people
- **Verify:** `npm --prefix web test -- --run src/features/quality src/features/matches && npm --prefix web run build`
- **Next step:** write the 2 tests in `web/src/features/matches/matches.test.tsx` and `quality/quality.test.tsx`, then `uak red HR-005`

## HR-006 · Paso 6: informe EIRA exportable a PDF y CSV

- **Type:** feature
- **Priority:** P0
- **Estimate:** 40 min
- **Rubric / Spec:** C1, C3 · IDEA.md §4 step 6
- **Depends on:** HR-004
- **Uses contract:** HR-001
- **Related:** HR-005
- **Paths:** web/src/lib/report.ts, web/src/lib/report.test.ts, web/src/features/report/
- **Freeze-Allowed:** no
- **Acceptance:** Recipe: detail · Hero: the pink cover with the validated indicators, Each indicator shows cut-off date, denominator, source and rule version, plus "estimado / validado", Annex of manual adjustments; matcher precision and recall labelled "medido sobre datos sintéticos", PDF via `window.print()` with `@media print`; CSV via Blob
- **Tests:** report_indicators_carry_date_denominator_source_and_rule_version, labels_unvalidated_counts_as_estimated, exports_csv_with_one_row_per_indicator
- **Verify:** `npm --prefix web test -- --run src/lib/report.test.ts && npm --prefix web run build`
- **Next step:** write the 3 tests against stubs, then `uak red HR-006`

## HR-007 · Landing: la idea en 5 segundos con pantallas reales

- **Type:** feature
- **Priority:** P0
- **Estimate:** 30 min
- **Rubric / Spec:** C2 · IDEA.md §1
- **Depends on:** HR-002, HR-004
- **Uses contract:** None
- **Related:** HR-008
- **Paths:** web/src/features/landing/, web/public/landing/
- **Freeze-Allowed:** yes
- **Acceptance:** Built with the skill `landing-story`: one line, a sourced number (EIRA 51,000 ≠ pacientes únicas), the wow as a real screenshot, three steps, the ask, Screenshots at 1280×720 and 390×844 in `.uak-shots/HR-007/`
- **Test-First:** no (static landing; checked by design-lint and screenshots)
- **Verify:** `npm --prefix web run build && bash .uak/bin/design-lint`
- **Next step:** `landing-story` skill with IDEA.md §1 and §10

## HR-008 · Demo y envío: README, video YouTube y Devpost

- **Type:** demo
- **Priority:** P0
- **Estimate:** 30 min
- **Rubric / Spec:** C1 · IDEA.md §4 plan B
- **Depends on:** HR-005, HR-006
- **Uses contract:** None
- **Related:** HR-007
- **Paths:** README.md, demo/
- **Freeze-Allowed:** yes
- **Acceptance:** README has the "Implementado vs. Simulado" table and how to run, Plan-B video of the full flow (3 min or less) uploaded to YouTube by the human
- **Test-First:** no (docs and video)
- **Verify:** `grep -q "Simulado" README.md`
- **Next step:** `/uak-demo`

## HR-009 · Paso 5: ficha de alianza

- **Type:** feature
- **Priority:** P1
- **Estimate:** 30 min
- **Rubric / Spec:** C4 · IDEA.md §4 step 5
- **Depends on:** HR-004
- **Uses contract:** HR-001
- **Related:** HR-006
- **Paths:** web/src/lib/alliances.ts, web/src/lib/alliances.test.ts, web/src/features/alliances/
- **Freeze-Allowed:** no
- **Acceptance:** Recipe: detail · Hero: the alliance card with unique women served, Clicking an alliance point shows type, municipality, linked jornadas, unique women and services by type
- **Tests:** summarizes_unique_women_per_alliance, counts_services_by_type_per_alliance
- **Verify:** `npm --prefix web test -- --run src/lib/alliances.test.ts && npm --prefix web run build`
- **Next step:** write the 2 tests against stubs, then `uak red HR-009`

## HR-013 · Shell listens to huella:tab so a screen can move to the next step (Carga → Mapa) (follow-up of HR-002)

- **Type:** follow-up
- **Priority:** P1
- **Depends on:** HR-002
- **Follow-up of:** HR-002
- **Paths:** web/DESIGN.md, web/src/index.css, web/src/lib/ui/, web/src/App.tsx, web/public/design-lock/, web/public/brand/
- **Freeze-Allowed:** no
- **Acceptance:**
  - Shell listens to huella:tab so a screen can move to the next step (Carga → Mapa)
- **Verify:** `test -s web/DESIGN.md && ls web/public/design-lock/screens/*-1280.png && bash .uak/bin/uak lint`

## HR-014 · Bottom nav at 390: the 6 tabs must fit (last tab Informe is clipped) (follow-up of HR-002)

- **Type:** follow-up
- **Priority:** P1
- **Depends on:** HR-002
- **Follow-up of:** HR-002
- **Paths:** web/DESIGN.md, web/src/index.css, web/src/lib/ui/, web/src/App.tsx, web/public/design-lock/, web/public/brand/
- **Freeze-Allowed:** no
- **Acceptance:**
  - Bottom nav at 390: the 6 tabs must fit (last tab Informe is clipped)
- **Verify:** `test -s web/DESIGN.md && ls web/public/design-lock/screens/*-1280.png && bash .uak/bin/uak lint`
