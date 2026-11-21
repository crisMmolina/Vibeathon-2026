import type { Person, Record } from '../schemas/index.ts'
import { aggregateByState } from './geo.ts'

const rec = (id: string, estado: string): Record => ({
  record_id: id, source_file_id: 'f', nombre: 'Ana', ap1: 'Ejemplo', ap2: '', fecha_nac: '1980-01-01', tel: '',
  estado, municipio: 'X', localidad: 'Y', fecha_servicio: '2026-03-01', tipo: 'atencion', servicio: 'Papanicolaou',
})

describe('geo.aggregateByState (IDEA.md §4 step 2)', () => {
  it('aggregates_people_by_state_from_records', () => {
    const records = [rec('a', '14'), rec('b', '14'), rec('c', '14'), rec('d', '06')]
    const raw = aggregateByState(records)
    expect(raw.find((s) => s.cve_ent === '14')).toEqual({ cve_ent: '14', filas: 3, personas: 3 })
    expect(raw.find((s) => s.cve_ent === '06')).toEqual({ cve_ent: '06', filas: 1, personas: 1 })
    // a confirmed cluster (a, b) is one woman: the state's height drops
    const persons: Person[] = [
      { person_id: 'p1', record_ids: ['a', 'b'], status: 'validada' },
      { person_id: 'p2', record_ids: ['c'], status: 'estimada' },
      { person_id: 'p3', record_ids: ['d'], status: 'estimada' },
    ]
    expect(aggregateByState(records, persons).find((s) => s.cve_ent === '14')!.personas).toBe(2)
  })
})

describe('states geometry (web/public/geo/estados.geojson)', () => {
  it('states_geojson_has_32_states_with_cve_ent', async () => {
    const { readFileSync, statSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const path = resolve(process.cwd(), 'public/geo/estados.geojson')
    const gj = JSON.parse(readFileSync(path, 'utf8'))
    const codes = new Set(gj.features.map((f: { properties: { cve_ent: string } }) => f.properties.cve_ent))
    expect(codes.size).toBe(32)
    expect(codes.has('14')).toBe(true)
    expect(statSync(path).size).toBeLessThan(500_000)
  })
})
