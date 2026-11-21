## HR-005 · Pasos 3 y 4: alertas de calidad y coincidencias que encogen el mapa

- **Type:** feature
- **Priority:** P0
- **Estimate:** 45 min
- **Rubric / Spec:** C3, C5 · IDEA.md §4 steps 3-4, §5 matching
- **Depends on:** HR-003
- **Uses contract:** HR-001, HR-004
- **Related:** HR-004
- **Paths:** web/src/lib/quality.ts, web/src/lib/match.ts, web/src/lib/audit.ts, web/src/lib/rules.json, web/src/lib/quality.test.ts, web/src/lib/match.test.ts, web/src/features/quality/, web/src/features/matches/
- **Freeze-Allowed:** no
- **Acceptance:**
  - Recipe: list (quality) and detail (matches) · Hero: the side-by-side pair with score and reasons
  - Quality lists the 14 seeded alerts with a traffic light; correct, exclude or accept requires a reason that lands in the audit log
  - Matches suggests 32 pairs (28 true, 4 homonyms flagged "revisar con cuidado"); nothing merges without a click
  - Confirming a pair lowers the unique-people count and the state's extrusion live
- **Tests:** finds_the_14_seeded_quality_alerts, suggests_the_28_true_links, flags_the_4_homonyms_for_careful_review, never_merges_without_a_human_verdict, logs_every_manual_adjustment_with_reason
- **Verify:** `npm --prefix web test -- --run src/lib/quality.test.ts src/lib/match.test.ts && npm --prefix web run build`
- **Next step:** write the 5 tests against stubs, then `uak red HR-005`

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
- **Acceptance:**
  - Recipe: detail · Hero: the pink cover with the validated indicators
  - Each indicator shows cut-off date, denominator, source and rule version, plus "estimado / validado"
  - Annex of manual adjustments; matcher precision and recall labelled "medido sobre datos sintéticos"
  - PDF via `window.print()` with `@media print`; CSV via Blob
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
- **Acceptance:**
  - Built with the skill `landing-story`: one line, a sourced number (EIRA 51,000 ≠ pacientes únicas), the wow as a real screenshot, three steps, the ask
  - Screenshots at 1280×720 and 390×844 in `.uak-shots/HR-007/`
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
- **Acceptance:**
  - README has the "Implementado vs. Simulado" table and how to run
  - Plan-B video of the full flow (3 min or less) uploaded to YouTube by the human
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
- **Acceptance:**
  - Recipe: detail · Hero: the alliance card with unique women served
  - Clicking an alliance point shows type, municipality, linked jornadas, unique women and services by type
- **Tests:** summarizes_unique_women_per_alliance, counts_services_by_type_per_alliance
- **Verify:** `npm --prefix web test -- --run src/lib/alliances.test.ts && npm --prefix web run build`
- **Next step:** write the 2 tests against stubs, then `uak red HR-009`
