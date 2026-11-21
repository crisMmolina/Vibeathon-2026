// Test helper: the synthetic demo files (web/public/demo_data) loaded the way the app does, read from disk.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseFile } from '../../lib/ingest.ts'
import { apply, suggest } from '../../lib/mapping.ts'

export async function demoState() {
  const read = (name: string) => {
    const b = readFileSync(resolve(process.cwd(), 'public/demo_data', name))
    return parseFile(name, b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer)
  }
  const parsed = await Promise.all([read('jornadas_tamizaje.csv'), read('salud_que_florece.xlsx')])
  const mappings = parsed.flatMap((p) => suggest(p.file.id, p.columns, p.rows))
  const records = parsed.flatMap((p) => apply(p, mappings.filter((m) => m.source_file_id === p.file.id)))
  return { files: parsed.map((p) => p.file), mappings, records }
}
