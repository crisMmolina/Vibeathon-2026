import type { Alliance, Person, Record } from '../schemas/index.ts'
import { summary } from './alliances.ts'

const rec = (id: string, municipio: string, tipo: Record['tipo'], servicio: string): Record => ({
  record_id: id, source_file_id: 'f', nombre: 'Ana', ap1: 'Ejemplo', ap2: '', fecha_nac: '1980-01-01', tel: '',
  estado: '14', municipio, localidad: 'Y', fecha_servicio: '2026-03-01', tipo, servicio,
})
const zapopan: Alliance = { id: 'AL-01', nombre: 'Municipio de Zapopan', tipo: 'municipio', estado: '14', municipio: 'Zapopan', lat: 20.7, lng: -103.4, jornadas: ['JOR-ZAPOPAN'] }
const records = [
  rec('a', 'Zapopan', 'atencion', 'Papanicolaou'),
  rec('b', 'Zapopan', 'atencion', 'Ultrasonido mamario'),
  rec('c', 'Zapopan', 'participacion', 'Autoexploración'),
  rec('d', 'Zapopan', 'atencion', 'Papanicolaou'),
  rec('e', 'Tlajomulco de Zúñiga', 'atencion', 'Papanicolaou'),
]

describe('alliances.summary (IDEA.md §4 step 5)', () => {
  it('summarizes_unique_women_per_alliance', () => {
    const raw = summary(zapopan, records, [])
    expect(raw.mujeres_unicas).toBe(4) // without clusters, each record is one woman
    const persons: Person[] = [
      { person_id: 'p1', record_ids: ['a', 'c'], status: 'validada' },
      { person_id: 'p2', record_ids: ['b'], status: 'estimada' },
      { person_id: 'p3', record_ids: ['d'], status: 'estimada' },
      { person_id: 'p4', record_ids: ['e'], status: 'estimada' },
    ]
    const s = summary(zapopan, records, persons)
    expect(s.mujeres_unicas).toBe(3) // a and c are the same woman; e is another municipality
    expect(s.atenciones).toBe(3)
    expect(s.participaciones).toBe(1)
  })

  it('counts_services_by_type_per_alliance', () => {
    const s = summary(zapopan, records, [])
    expect(s.servicios).toEqual([
      { servicio: 'Papanicolaou', n: 2 },
      { servicio: 'Autoexploración', n: 1 },
      { servicio: 'Ultrasonido mamario', n: 1 },
    ])
  })
})
