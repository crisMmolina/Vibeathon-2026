import type { MatchPair, Record } from '../schemas/index.ts'
import { build, labelFor, toCsv } from './report.ts'

const rec = (id: string, tipo: Record['tipo']): Record => ({
  record_id: id, source_file_id: tipo === 'atencion' ? 'fa' : 'fp', nombre: 'Ana', ap1: 'Ejemplo', ap2: '', fecha_nac: '1980-01-01',
  tel: '', estado: '14', municipio: 'X', localidad: 'Y', fecha_servicio: '2026-03-01', tipo, servicio: 'S',
})
const pair = (a: string, b: string, verdict: MatchPair['verdict']): MatchPair => ({ pair_id: `${a}|${b}`, a_id: a, b_id: b, score: 0.9, reasons: [], verdict, user: null, ts: null })
const files = [
  { id: 'fa', nombre: 'jornadas_tamizaje.csv', programa: 'tamizaje_rosa' as const, periodo: { desde: '2026-01-01', hasta: '2026-09-30' }, filas: 2, hash: 'a', fecha_carga: '' },
  { id: 'fp', nombre: 'salud_que_florece.xlsx', programa: 'salud_que_florece' as const, periodo: { desde: '2026-01-01', hasta: '2026-09-30' }, filas: 1, hash: 'b', fecha_carga: '' },
]
const records = [rec('fa:J-001', 'atencion'), rec('fa:J-002', 'atencion'), rec('fp:S-001', 'participacion')]

describe('report.build (IDEA.md §4 step 6)', () => {
  it('report_indicators_carry_date_denominator_source_and_rule_version', () => {
    const r = build({ records, pairs: [pair('fa:J-001', 'fp:S-001', 'misma')], audit: [], files, fecha_corte: '2026-09-30' })
    expect(r.indicators.length).toBeGreaterThanOrEqual(3)
    for (const i of r.indicators) {
      expect(i.fecha_corte).toBe('2026-09-30')
      expect(i.denominador).not.toBe('')
      expect(i.fuentes.length).toBeGreaterThan(0)
      expect(i.fuentes.every((f) => f.endsWith('.csv') || f.endsWith('.xlsx'))).toBe(true)
      expect(i.regla_version).not.toBe('')
    }
  })

  it('labels_unvalidated_counts_as_estimated', () => {
    const pending = build({ records, pairs: [pair('fa:J-001', 'fp:S-001', 'pendiente')], audit: [], files, fecha_corte: '2026-09-30' })
    const p = pending.indicators.find((i) => i.id === 'personas_unicas')!
    expect(p.estado).toBe('estimado')
    expect(labelFor(p)).toMatch(/estimado, no oficial/)
    const done = build({ records, pairs: [pair('fa:J-001', 'fp:S-001', 'misma')], audit: [], files, fecha_corte: '2026-09-30' })
    expect(labelFor(done.indicators.find((i) => i.id === 'personas_unicas')!)).toBe('validado')
  })

  it('exports_csv_with_one_row_per_indicator', () => {
    const r = build({ records, pairs: [pair('fa:J-001', 'fp:S-001', 'pendiente')], audit: [], files, fecha_corte: '2026-09-30' })
    const lines = toCsv(r).trim().split('\n')
    expect(lines[0]).toBe('id,nombre,valor,denominador,fecha_corte,fuentes,regla_version,estado')
    expect(lines).toHaveLength(r.indicators.length + 1)
    expect(lines.find((l) => l.startsWith('personas_unicas'))).toMatch(/2-3/)
  })
})
