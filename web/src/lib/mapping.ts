// Column mapping: synonym dictionary + Jaro-Winkler + sample inspection (IDEA.md §5).
// It only suggests; a person confirms (confirmed_by stays null until then).
import type { ColumnMapping, Record, TargetField, TipoRegistro } from '../schemas/index.ts'
import type { ParsedFile, Row } from './ingest.ts'
import eira from './presets/eira-2026.json'

export interface MappingPreset {
  id: string
  nombre: string
  regla_version: string
  periodo: { desde: string; hasta: string }
  tipo_por_programa: { [programa: string]: TipoRegistro }
  id_columns: string[]
  synonyms: { [field: string]: string[] }
}

export const DEFAULT_PRESET = eira as MappingPreset

export function norm(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

export function jaroWinkler(a: string, b: string): number {
  if (a === b) return 1
  if (!a.length || !b.length) return 0
  const range = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1)
  const am = new Array<boolean>(a.length).fill(false)
  const bm = new Array<boolean>(b.length).fill(false)
  let m = 0
  for (let i = 0; i < a.length; i++) {
    for (let j = Math.max(0, i - range); j < Math.min(b.length, i + range + 1); j++) {
      if (!bm[j] && a[i] === b[j]) { am[i] = bm[j] = true; m++; break }
    }
  }
  if (!m) return 0
  let t = 0
  for (let i = 0, k = 0; i < a.length; i++) {
    if (!am[i]) continue
    while (!bm[k]) k++
    if (a[i] !== b[k]) t++
    k++
  }
  const jaro = (m / a.length + m / b.length + (m - t / 2) / m) / 3
  let p = 0
  while (p < 4 && a[p] === b[p]) p++
  return jaro + p * 0.1 * (1 - jaro)
}

const SAMPLE_RULES: [TargetField, RegExp][] = [
  ['curp', /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i],
  ['tel', /^\+?[\d\s()-]{10,16}$/],
  ['fecha_nac', /^(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})$/],
]

/** Fraction of non-empty samples matching a regex (first 20 rows). */
function sampleScore(rows: Row[], col: string, re: RegExp): number {
  const vals = rows.slice(0, 20).map((r) => r[col]).filter(Boolean)
  if (!vals.length) return 0
  return vals.filter((v) => re.test(v)).length / vals.length
}

export function suggest(fileId: string, columns: string[], rows: Row[] = [], preset: MappingPreset = DEFAULT_PRESET): ColumnMapping[] {
  return columns.map((col) => {
    const n = norm(col)
    let best: { field: TargetField; score: number } = { field: 'ignorar', score: 0 }
    for (const [field, syns] of Object.entries(preset.synonyms)) {
      for (const s of syns) {
        const score = n === s ? 1 : jaroWinkler(n, s) * 0.95 // a fuzzy name is never certain
        if (score > best.score) best = { field: field as TargetField, score }
      }
    }
    if (preset.id_columns.includes(n)) best = { field: 'ignorar', score: 1 }
    if (best.score < 0.8) {
      for (const [field, re] of SAMPLE_RULES) {
        const s = sampleScore(rows, col, re) * 0.9 // evidence from values, not from the header
        if (s > best.score) best = { field, score: s }
      }
    }
    if (best.score < 0.6) best = { field: 'ignorar', score: best.score }
    return {
      source_file_id: fileId,
      source_col: col,
      target_field: best.field,
      confidence: Math.round(best.score * 100) / 100,
      confirmed_by: null,
    }
  })
}

const ESTADOS: { [nombre: string]: string } = {
  aguascalientes: '01', 'baja california': '02', 'baja california sur': '03', campeche: '04', coahuila: '05',
  colima: '06', chiapas: '07', chihuahua: '08', 'ciudad de mexico': '09', cdmx: '09', durango: '10', guanajuato: '11',
  guerrero: '12', hidalgo: '13', jalisco: '14', mexico: '15', 'estado de mexico': '15', michoacan: '16', morelos: '17',
  nayarit: '18', 'nuevo leon': '19', oaxaca: '20', puebla: '21', queretaro: '22', 'quintana roo': '23',
  'san luis potosi': '24', sinaloa: '25', sonora: '26', tabasco: '27', tamaulipas: '28', tlaxcala: '29',
  veracruz: '30', yucatan: '31', zacatecas: '32',
}

/** State name or code → cve_ent ("Michoacán" → "16"); unknown stays as written for the quality rules. */
export function toCveEnt(v: string): string {
  if (/^\d{1,2}$/.test(v.trim())) return v.trim().padStart(2, '0')
  return ESTADOS[norm(v)] ?? v
}

/** Turns parsed rows into schema Records with the confirmed (or suggested) mapping. */
export function apply(parsed: ParsedFile, mappings: ColumnMapping[], preset: MappingPreset = DEFAULT_PRESET): Record[] {
  const byField = new Map<TargetField, string>()
  for (const m of mappings) if (m.target_field !== 'ignorar' && !byField.has(m.target_field)) byField.set(m.target_field, m.source_col)
  const idCol = parsed.columns.find((c) => preset.id_columns.includes(norm(c)))
  const tipo: TipoRegistro = preset.tipo_por_programa[parsed.file.programa] ?? 'atencion'
  return parsed.rows.map((row, i) => {
    const get = (f: TargetField) => { const c = byField.get(f); return c ? row[c] ?? '' : '' }
    const rec: Record = {
      record_id: `${parsed.file.id}:${idCol ? row[idCol] : String(i + 1)}`,
      source_file_id: parsed.file.id,
      nombre: get('nombre'), ap1: get('ap1'), ap2: get('ap2'),
      fecha_nac: get('fecha_nac'), tel: get('tel'),
      estado: toCveEnt(get('estado')), municipio: get('municipio'), localidad: get('localidad'),
      fecha_servicio: get('fecha_servicio'), tipo, servicio: get('servicio'),
    }
    const curp = get('curp'); if (curp) rec.curp = curp
    const cve = get('cve_loc_inegi'); if (cve) rec.cve_loc_inegi = cve
    return rec
  })
}
