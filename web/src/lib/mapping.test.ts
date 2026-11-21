import { suggest } from './mapping.ts'

const field = (cols: string[], col: string, rows = [] as { [c: string]: string }[]) =>
  suggest('f1', cols, rows).find((m) => m.source_col === col)!

describe('mapping.suggest (IDEA.md §5)', () => {
  it('maps_municipio_and_mpio_to_the_same_field', () => {
    expect(field(['Municipio'], 'Municipio').target_field).toBe('municipio')
    expect(field(['mpio'], 'mpio').target_field).toBe('municipio')
    expect(field(['Fecha nacimiento'], 'Fecha nacimiento').target_field).toBe('fecha_nac')
    expect(field(['Fecha de nacimiento'], 'Fecha de nacimiento').target_field).toBe('fecha_nac')
  })

  it('suggests_confidence_below_1_for_fuzzy_matches', () => {
    const exact = field(['Municipio'], 'Municipio')
    expect(exact.confidence).toBe(1)
    const fuzzy = field(['Fech. Nacim'], 'Fech. Nacim')
    expect(fuzzy.target_field).toBe('fecha_nac')
    expect(fuzzy.confidence).toBeLessThan(1)
    expect(fuzzy.confidence).toBeGreaterThan(0.5)
    const bySample = field(['Contacto'], 'Contacto', [{ Contacto: '3312345678' }, { Contacto: '4431234567' }])
    expect(bySample.target_field).toBe('tel')
    expect(bySample.confidence).toBeLessThan(1)
    expect(field(['xyz'], 'xyz').confirmed_by).toBeNull()
  })
})
