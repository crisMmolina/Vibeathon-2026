import type { MatchPair, Record } from '../schemas/index.ts'
import { compute } from './indicators.ts'

const rec = (id: string, tipo: Record['tipo'], file = tipo === 'atencion' ? 'fa' : 'fp'): Record => ({
  record_id: id, source_file_id: file, nombre: 'Ana', ap1: 'Ejemplo', ap2: '', fecha_nac: '1980-01-01', tel: '',
  estado: '14', municipio: 'X', localidad: 'Y', fecha_servicio: '2026-03-01', tipo, servicio: 'S',
})
const pair = (a: string, b: string, verdict: MatchPair['verdict']): MatchPair => ({
  pair_id: `${a}-${b}`, a_id: a, b_id: b, score: 0.9, reasons: [], verdict, user: null, ts: null,
})
const records = [rec('a1', 'atencion'), rec('a2', 'atencion'), rec('a3', 'atencion'), rec('p1', 'participacion'), rec('p2', 'participacion')]
const byId = (xs: ReturnType<typeof compute>, id: string) => xs.find((i) => i.id === id)!

describe('indicators.compute (IDEA.md §5)', () => {
  it('never_sums_atenciones_and_participaciones', () => {
    const ind = compute({ records, pairs: [], fecha_corte: '2026-09-30' })
    expect(byId(ind, 'atenciones').valor).toBe(3)
    expect(byId(ind, 'participaciones').valor).toBe(2)
    expect(ind.some((i) => i.valor === 5 && i.id !== 'personas_unicas')).toBe(false)
    for (const i of ind) {
      expect(i.fecha_corte).toBe('2026-09-30')
      expect(i.denominador).not.toBe('')
      expect(i.fuentes.length).toBeGreaterThan(0)
      expect(i.regla_version).not.toBe('')
    }
  })

  it('shows_interval_until_links_are_confirmed', () => {
    const pending = compute({ records, pairs: [pair('a1', 'p1', 'pendiente'), pair('a2', 'p2', 'pendiente')], fecha_corte: '2026-09-30' })
    expect(byId(pending, 'personas_unicas').valor).toEqual({ min: 3, max: 5 })
    expect(byId(pending, 'personas_unicas').estado).toBe('estimado')

    const half = compute({ records, pairs: [pair('a1', 'p1', 'misma'), pair('a2', 'p2', 'pendiente')], fecha_corte: '2026-09-30' })
    expect(byId(half, 'personas_unicas').valor).toEqual({ min: 3, max: 4 })
    expect(byId(half, 'personas_unicas').estado).toBe('estimado')

    const done = compute({ records, pairs: [pair('a1', 'p1', 'misma'), pair('a2', 'p2', 'distinta')], fecha_corte: '2026-09-30' })
    expect(byId(done, 'personas_unicas').valor).toBe(4)
    expect(byId(done, 'personas_unicas').estado).toBe('validado')
  })
})
