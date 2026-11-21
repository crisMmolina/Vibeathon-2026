// Traceable donor report (IDEA.md §4 step 6). It only formats what src/lib/indicators computed; it adds no number.
import type { AuditEntry, DemoTruth, Indicator, MatchPair, Record, SourceFile } from '../schemas/index.ts'
import { compute, REGLA_VERSION } from './indicators.ts'

export interface ReportInput { records: Record[]; pairs: MatchPair[]; audit: AuditEntry[]; files: SourceFile[]; fecha_corte: string; truth?: DemoTruth | null }

export interface MatcherQuality {
  sugeridos: number
  correctos: number
  reales: number
  precision: number
  recall: number
  rechazados: number
  nota: 'medido sobre datos sintéticos'
}

export interface Report {
  fecha_corte: string
  generado: string
  regla_version: string
  indicators: Indicator[]
  ajustes: AuditEntry[]
  archivos: { nombre: string; filas: number; hash: string }[]
  calidad_matcher: MatcherQuality | null
}

const folio = (id: string) => id.slice(id.lastIndexOf(':') + 1)
const key = (a: string, b: string) => [folio(a), folio(b)].sort().join('|')

/** Precision and recall of the suggestions against the synthetic known truth (only when it exists). */
export function matcherQuality(pairs: MatchPair[], truth: DemoTruth): MatcherQuality {
  const real = new Set([...truth.links, ...truth.repeats].map(([a, b]) => key(a, b)))
  const correctos = pairs.filter((p) => real.has(key(p.a_id, p.b_id))).length
  return {
    sugeridos: pairs.length,
    correctos,
    reales: real.size,
    precision: pairs.length ? correctos / pairs.length : 0,
    recall: real.size ? correctos / real.size : 0,
    rechazados: pairs.filter((p) => p.verdict === 'distinta').length,
    nota: 'medido sobre datos sintéticos',
  }
}

export function build({ records, pairs, audit, files, fecha_corte, truth }: ReportInput): Report {
  const nombre = (id: string) => files.find((f) => f.id === id)?.nombre ?? id
  const indicators = compute({ records, pairs, fecha_corte }).map((i) => ({ ...i, fuentes: i.fuentes.map(nombre) }))
  return {
    fecha_corte,
    generado: new Date().toISOString(),
    regla_version: REGLA_VERSION,
    indicators,
    ajustes: audit,
    archivos: files.filter((f) => f.programa !== 'alianzas').map((f) => ({ nombre: f.nombre, filas: f.filas, hash: f.hash })),
    calidad_matcher: truth ? matcherQuality(pairs, truth) : null,
  }
}

export function labelFor(i: Indicator): string {
  return i.estado === 'validado' ? 'validado' : 'estimado, no oficial'
}

export function valorText(i: Indicator, sep = ' a '): string {
  return typeof i.valor === 'number' ? String(i.valor) : i.valor.min === i.valor.max ? String(i.valor.max) : `${i.valor.min}${sep}${i.valor.max}`
}

const cell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)

export function toCsv(r: Report): string {
  const head = 'id,nombre,valor,denominador,fecha_corte,fuentes,regla_version,estado'
  const rows = r.indicators.map((i) =>
    [i.id, i.nombre, valorText(i, '-'), i.denominador, i.fecha_corte, i.fuentes.join(' | '), i.regla_version, i.estado].map(cell).join(','),
  )
  return [head, ...rows].join('\n') + '\n'
}

/** Browser download of the CSV (Blob, nothing leaves the computer). */
export function exportCsv(r: Report, filename = `informe-eira-${r.fecha_corte}.csv`): void {
  const url = URL.createObjectURL(new Blob(['﻿' + toCsv(r)], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** PDF through the browser's print dialog; the screen's @media print rules lay out the report. */
export function exportPdf(): void {
  window.print()
}
