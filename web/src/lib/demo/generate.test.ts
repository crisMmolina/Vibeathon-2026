import { generateDemo } from './generate.ts'

describe('demo dataset (IDEA.md §3, known truth)', () => {
  const d = generateDemo()

  it('demo_dataset_has_120_atenciones_and_80_participaciones', () => {
    expect(d.jornadas).toHaveLength(120)
    expect(d.salud).toHaveLength(80)
    expect(d.alianzas).toHaveLength(8)
    // 10 women came back for a second atención: 110 distinct women in file 1
    expect(d.truth.repeats).toHaveLength(10)
    const folios = new Set(d.jornadas.map((r) => r.Folio))
    expect(folios.size).toBe(120)
  })

  it('demo_truth_has_28_links_and_4_homonyms', () => {
    expect(d.truth.links).toHaveLength(28)
    expect(d.truth.homonyms).toHaveLength(4)
    expect(d.truth.unique_people).toBe(162)
    const j = new Map(d.jornadas.map((r) => [r.Folio, r]))
    const s = new Map(d.salud.map((r) => [r.Folio, r]))
    for (const [a, b] of d.truth.homonyms) {
      const ra = j.get(a)!, rb = s.get(b)!
      expect(rb.Nombre).toBe(ra.Nombre)
      expect(rb['Fecha de nacimiento']).not.toBe(ra['Fecha nacimiento'])
    }
    for (const [a, b] of d.truth.links) {
      expect(j.has(a)).toBe(true)
      expect(s.has(b)).toBe(true)
    }
  })

  it('demo_generator_is_deterministic', () => {
    expect(generateDemo(7)).toEqual(generateDemo(7))
    expect(generateDemo()).toEqual(d)
  })

  it('seeds_the_quality_anomalies', () => {
    const all = [...d.jornadas, ...d.salud]
    expect(all.filter((r) => !r.Localidad).length).toBe(6)
    const fechas = [...d.jornadas.map((r) => r['Fecha nacimiento']), ...d.salud.map((r) => r['Fecha de nacimiento'])]
    expect(fechas.filter((f) => !/^\d{4}-\d{2}-\d{2}$/.test(f)).length).toBe(3)
    expect(all.filter((r) => r.Telefono.replace(/\D/g, '').length < 10).length).toBe(2)
    expect(d.jornadas.filter((r) => r['Fecha atencion'] > '2026-09-30').length).toBe(1)
    expect('Municipio' in d.jornadas[0]).toBe(true)
    expect('mpio' in d.salud[0]).toBe(true)
  })
})
