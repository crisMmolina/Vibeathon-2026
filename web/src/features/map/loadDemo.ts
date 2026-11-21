// "Usar datos de demostración": the synthetic files are static assets of this same app (no upload, no server).
import Papa from 'papaparse'
import { DEMO_FILES, parseFile } from '../../lib/ingest.ts'
import { apply, suggest } from '../../lib/mapping.ts'
import { parseAlliances } from '../../lib/geo.ts'
import type { AppState } from '../../store/index.ts'

export async function loadDemo(): Promise<Partial<Pick<AppState, 'files' | 'mappings' | 'records' | 'alliances' | 'pairs'>>> {
  const [jornadas, salud, alianzas] = await Promise.all(
    DEMO_FILES.map(async (name) => ({ name, data: await fetch(`/demo_data/${name}`).then((r) => { if (!r.ok) throw new Error(name); return r.arrayBuffer() }) })),
  )
  const parsed = await Promise.all([jornadas, salud].map((f) => parseFile(f.name, f.data)))
  const mappings = parsed.flatMap((p) => suggest(p.file.id, p.columns, p.rows))
  const records = parsed.flatMap((p) => apply(p, mappings.filter((m) => m.source_file_id === p.file.id)))
  const rows = Papa.parse<{ [c: string]: string }>(new TextDecoder().decode(alianzas.data), { header: true, skipEmptyLines: true }).data
  return { files: parsed.map((p) => p.file), mappings, records, alliances: parseAlliances(rows), pairs: [] }
}
