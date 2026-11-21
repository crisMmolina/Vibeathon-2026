import { candidates, decide } from './match.ts'
import { generateDemo } from "./demo/generate.ts"
import type { Record } from "../schemas/index.ts"

const CVE: { [e: string]: string } = { Jalisco: "14", Colima: "06", "Michoacán": "16", Nayarit: "18", Veracruz: "30" }
/** The demo files as schema Records (same shape mapping.apply produces), record_id = Folio. */
function demoRecords(): Record[] {
  const d = generateDemo()
  const j = d.jornadas.map((r): Record => ({ record_id: r.Folio, source_file_id: "jornadas", nombre: r.Nombre, ap1: r["Apellido paterno"], ap2: r["Apellido materno"],
    fecha_nac: r["Fecha nacimiento"], tel: r.Telefono, estado: CVE[r.Estado], municipio: r.Municipio, localidad: r.Localidad,
    fecha_servicio: r["Fecha atencion"], tipo: "atencion", servicio: r.Servicio }))
  const s = d.salud.map((r): Record => ({ record_id: r.Folio, source_file_id: "salud", nombre: r.Nombre, ap1: r["Apellido 1"], ap2: r["Apellido 2"],
    fecha_nac: r["Fecha de nacimiento"], tel: r.Telefono, estado: CVE[r.Estado], municipio: r.mpio, localidad: r.Localidad,
    fecha_servicio: r["Fecha taller"], tipo: "participacion", servicio: r.Taller }))
  return [...j, ...s]
}

const truth = generateDemo().truth
const key = (a: string, b: string) => [a, b].sort().join('|')

describe('match.candidates (IDEA.md §4 step 4, §5)', () => {
  const pairs = candidates(demoRecords())
  const byKey = new Map(pairs.map((p) => [key(p.a_id, p.b_id), p]))

  it('suggests_the_28_true_links', () => {
    for (const [a, b] of [...truth.links, ...truth.repeats]) {
      const p = byKey.get(key(a, b))
      expect(p, `missing ${a}-${b}`).toBeDefined()
      expect(p!.score).toBeGreaterThanOrEqual(0.85)
      expect(p!.reasons.length).toBeGreaterThan(0)
    }
    const real = new Set([...truth.links, ...truth.repeats].map(([a, b]) => key(a, b)))
    expect(pairs.filter((p) => p.score >= 0.85 && !real.has(key(p.a_id, p.b_id)))).toHaveLength(0)
  })

  it('flags_the_4_homonyms_for_careful_review', () => {
    for (const [a, b] of truth.homonyms) {
      const p = byKey.get(key(a, b))
      expect(p, `missing homonym ${a}-${b}`).toBeDefined()
      expect(p!.reasons).toContain('revisar con cuidado')
      expect(p!.score).toBeLessThan(0.85)
    }
    for (const [a, b] of truth.links) expect(byKey.get(key(a, b))!.reasons).not.toContain('revisar con cuidado')
  })

  it('never_merges_without_a_human_verdict', () => {
    expect(pairs.length).toBeGreaterThan(0)
    expect(pairs.every((p) => p.verdict === 'pendiente' && p.user === null)).toBe(true)
    const id = pairs[0].pair_id
    expect(() => decide(pairs, id, 'misma', '')).toThrow()
    const out = decide(pairs, id, 'misma', 'Coordinación')
    expect(out.pairs.find((p) => p.pair_id === id)).toMatchObject({ verdict: 'misma', user: 'Coordinación' })
    expect(out.pairs.filter((p) => p.verdict !== 'pendiente')).toHaveLength(1)
    expect(out.audit[0]).toMatchObject({ action: 'match.misma', entity: id, user: 'Coordinación' })
  })
})
