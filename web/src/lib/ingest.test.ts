import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseFile } from './ingest.ts'
import { apply, suggest } from './mapping.ts'

const demo = (name: string) => {
  const b = readFileSync(resolve(process.cwd(), 'public/demo_data', name))
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer
}

export async function loadDemoRecords() {
  const files = await Promise.all([
    parseFile('jornadas_tamizaje.csv', demo('jornadas_tamizaje.csv')),
    parseFile('salud_que_florece.xlsx', demo('salud_que_florece.xlsx')),
  ])
  return files.flatMap((p) => apply(p, suggest(p.file.id, p.columns, p.rows)))
}

describe('ingest (IDEA.md §4 step 1)', () => {
  it('parses_csv_and_xlsx_into_200_records', async () => {
    const records = await loadDemoRecords()
    expect(records).toHaveLength(200)
    expect(records.filter((r) => r.tipo === 'atencion')).toHaveLength(120)
    expect(records.filter((r) => r.tipo === 'participacion')).toHaveLength(80)
    const r = records.find((x) => x.record_id.endsWith('J-001'))!
    expect(r.estado).toMatch(/^\d{2}$/)
    expect(r.municipio).not.toBe('')
  })

  it('keeps_identity_fields_out_of_any_network_call', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    vi.stubGlobal('XMLHttpRequest', vi.fn())
    vi.stubGlobal('navigator', { ...navigator, sendBeacon: fetchSpy })
    await loadDemoRecords()
    expect(fetchSpy).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
