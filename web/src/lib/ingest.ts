// Parses CSV and Excel entirely in the browser. Nothing leaves this computer: no fetch, no upload.
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import type { Programa, SourceFile } from '../schemas/index.ts'

export type Row = { [col: string]: string }
export interface ParsedFile { file: SourceFile; columns: string[]; rows: Row[] }

function fnv1a(bytes: Uint8Array): string {
  let h = 0x811c9dc5
  for (let i = 0; i < bytes.length; i++) { h ^= bytes[i]; h = Math.imul(h, 0x01000193) >>> 0 }
  return h.toString(16).padStart(8, '0')
}

export function inferPrograma(name: string): Programa | 'alianzas' {
  const n = name.toLowerCase()
  if (n.includes('alianza')) return 'alianzas'
  if (n.includes('salud') || n.includes('taller') || n.includes('florece')) return 'salud_que_florece'
  return 'tamizaje_rosa'
}

function readRows(name: string, data: ArrayBuffer): Row[] {
  if (/\.xlsx?$/i.test(name)) {
    const wb = XLSX.read(new Uint8Array(data), { type: 'array' })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    return XLSX.utils.sheet_to_json<Row>(sheet, { raw: false, defval: '' })
  }
  const text = new TextDecoder('utf-8').decode(data).replace(/^﻿/, '')
  return Papa.parse<Row>(text, { header: true, skipEmptyLines: true }).data
}

export async function parseFile(name: string, data: ArrayBuffer): Promise<ParsedFile> {
  const rows = readRows(name, data).map((r) => {
    const clean: Row = {}
    for (const [k, v] of Object.entries(r)) clean[k.trim()] = String(v ?? '').trim()
    return clean
  })
  const columns = rows.length ? Object.keys(rows[0]) : []
  const hash = fnv1a(new Uint8Array(data))
  const programa = inferPrograma(name)
  return {
    columns,
    rows,
    file: {
      id: `${programa}-${hash}`,
      nombre: name,
      programa,
      periodo: { desde: '2026-01-01', hasta: '2026-09-30' },
      filas: rows.length,
      hash,
      fecha_carga: new Date().toISOString(),
    },
  }
}

/** Browser entry point: drag-and-drop or <input type=file>. */
export async function parse(files: File[]): Promise<ParsedFile[]> {
  return Promise.all(files.map(async (f) => parseFile(f.name, await f.arrayBuffer())))
}

/** "Usar datos de demostración": static assets of this same app (web/public/demo_data/). */
export const DEMO_FILES = ['jornadas_tamizaje.csv', 'salud_que_florece.xlsx', 'alianzas.csv'] as const
