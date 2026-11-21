import type { Alliance, Person, Record, SourceFile } from '../schemas/index.ts'
import { aggregate, series, suggest, type ChartCtx } from './charts.ts'

const rec = (id: string, estado: string, tipo: Record['tipo'], servicio: string, fecha = '2026-03-10', municipio = 'Zapopan'): Record => ({
  record_id: id, source_file_id: tipo === 'atencion' ? 'fa' : 'fp', nombre: 'Ana', ap1: 'Ejemplo', ap2: '', fecha_nac: '1980-01-01', tel: '',
  estado, municipio, localidad: 'Y', fecha_servicio: fecha, tipo, servicio,
})
const files: SourceFile[] = [
  { id: 'fa', nombre: 'jornadas_tamizaje.csv', programa: 'tamizaje_rosa', periodo: { desde: '2026-01-01', hasta: '2026-09-30' }, filas: 3, hash: 'a', fecha_carga: '' },
  { id: 'fp', nombre: 'salud_que_florece.xlsx', programa: 'salud_que_florece', periodo: { desde: '2026-01-01', hasta: '2026-09-30' }, filas: 2, hash: 'b', fecha_carga: '' },
]
const alliances: Alliance[] = [{ id: 'AL-01', nombre: 'Municipio de Zapopan', tipo: 'municipio', estado: '14', municipio: 'Zapopan', lat: 0, lng: 0, jornadas: ['JOR-ZAPOPAN'] }]
const records = [
  rec('a', '14', 'atencion', 'Papanicolaou'),
  rec('b', '14', 'atencion', 'Papanicolaou', '2026-04-02'),
  rec('c', '16', 'atencion', 'Ultrasonido mamario', '2026-04-20', 'Morelia'),
  rec('d', '14', 'participacion', 'Autoexploración'),
  rec('e', '16', 'participacion', 'Autoexploración', '2026-05-01', 'Morelia'),
]
const singles: Person[] = records.map((r, i) => ({ person_id: `p${i}`, record_ids: [r.record_id], status: 'estimada' }))
const ctx = (persons = singles): ChartCtx => ({ records, persons, alliances, files, mappings: [] })
const asMap = (xs: { label: string; value: number }[]) => Object.fromEntries(xs.map((x) => [x.label, x.value]))

describe('charts (HR-016)', () => {
  it('aggregates_measure_by_dimension', () => {
    expect(asMap(aggregate(ctx(), { measure: 'registros', dimension: 'estado' }))).toEqual({ Jalisco: 3, 'Michoacán': 2 })
    expect(asMap(aggregate(ctx(), { measure: 'atenciones', dimension: 'servicio' }))).toEqual({ Papanicolaou: 2, 'Ultrasonido mamario': 1 })
    const meses = aggregate(ctx(), { measure: 'registros', dimension: 'mes' })
    expect(meses.map((m) => m.label)).toEqual(['2026-03', '2026-04', '2026-05'])
    expect(asMap(aggregate(ctx(), { measure: 'registros', dimension: 'alianza' }))).toEqual({ 'Municipio de Zapopan': 3 })
  })

  it('unique_people_by_dimension_counts_each_woman_once', () => {
    const merged: Person[] = [
      { person_id: 'p1', record_ids: ['a', 'b', 'd'], status: 'validada' }, // one woman, three records in Jalisco
      { person_id: 'p2', record_ids: ['c'], status: 'estimada' },
      { person_id: 'p3', record_ids: ['e'], status: 'estimada' },
    ]
    expect(asMap(aggregate(ctx(merged), { measure: 'personas', dimension: 'estado' }))).toEqual({ Jalisco: 1, 'Michoacán': 2 })
    expect(asMap(aggregate(ctx(), { measure: 'personas', dimension: 'estado' }))).toEqual({ Jalisco: 3, 'Michoacán': 2 })
  })

  it('never_adds_atenciones_and_participaciones_in_one_series', () => {
    const rows = series(ctx(), { id: 'x', title: 'x', dimension: 'estado', measures: ['atenciones', 'participaciones'], type: 'columnas' })
    const jal = rows.find((r) => r.label === 'Jalisco')!
    expect(jal.atenciones).toBe(2)
    expect(jal.participaciones).toBe(1)
    expect(Object.keys(jal).sort()).toEqual(['atenciones', 'label', 'participaciones'])
    for (const s of suggest(ctx())) expect(s.measures.length === 1 && s.measures[0] === 'registros' && s.title.toLowerCase().includes('atenciones y participaciones')).toBe(false)
  })

  it('suggests_charts_that_fit_the_loaded_data', () => {
    const ids = suggest(ctx()).map((s) => s.id)
    expect(ids).toEqual(expect.arrayContaining(['personas-estado', 'servicios', 'atenciones-participaciones', 'filas-vs-personas', 'alertas-regla', 'alianzas', 'por-mes']))
    const sinAlianzas = suggest({ ...ctx(), alliances: [] }).map((s) => s.id)
    expect(sinAlianzas).not.toContain('alianzas')
    const sinFechas = suggest({ ...ctx(), records: records.map((r) => ({ ...r, fecha_servicio: '' })) }).map((s) => s.id)
    expect(sinFechas).not.toContain('por-mes')
    expect(suggest({ ...ctx(), records: [] })).toEqual([])
  })
})
