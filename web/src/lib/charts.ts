// Report charts (HR-016): any measure by any dimension, computed from the same records and confirmed clusters
// as every other number. Different entities go in separate series and are never added together.
import type { Alliance, ColumnMapping, Person, Record, SourceFile } from '../schemas/index.ts'
import { recordsOf } from './alliances.ts'
import { RULES, run as runQuality } from './quality.ts'

export type Measure = 'registros' | 'personas' | 'atenciones' | 'participaciones' | 'alertas'
export type Dimension = 'estado' | 'municipio' | 'servicio' | 'programa' | 'mes' | 'alianza' | 'regla'
export type ChartType = 'barras' | 'columnas' | 'linea' | 'pastel'
export interface ChartSpec { id: string; title: string; dimension: Dimension; measures: Measure[]; type: ChartType }
export interface ChartCtx { records: Record[]; persons: Person[]; alliances: Alliance[]; files: SourceFile[]; mappings: ColumnMapping[] }
export type ChartRow = { label: string } & { [m: string]: number | string }

export const MEASURE_LABEL: { [m in Measure]: string } = {
  registros: 'Registros (filas)', personas: 'Personas únicas', atenciones: 'Atenciones', participaciones: 'Participaciones', alertas: 'Alertas de calidad',
}
export const DIMENSION_LABEL: { [d in Dimension]: string } = {
  estado: 'Estado', municipio: 'Municipio', servicio: 'Servicio', programa: 'Programa', mes: 'Mes', alianza: 'Alianza', regla: 'Regla de calidad',
}
export const TYPE_LABEL: { [t in ChartType]: string } = { barras: 'Barras', columnas: 'Columnas', linea: 'Línea', pastel: 'Pastel' }

const ESTADO: { [cve: string]: string } = {
  '01': 'Aguascalientes', '02': 'Baja California', '03': 'Baja California Sur', '04': 'Campeche', '05': 'Coahuila', '06': 'Colima',
  '07': 'Chiapas', '08': 'Chihuahua', '09': 'Ciudad de México', '10': 'Durango', '11': 'Guanajuato', '12': 'Guerrero', '13': 'Hidalgo',
  '14': 'Jalisco', '15': 'Estado de México', '16': 'Michoacán', '17': 'Morelos', '18': 'Nayarit', '19': 'Nuevo León', '20': 'Oaxaca',
  '21': 'Puebla', '22': 'Querétaro', '23': 'Quintana Roo', '24': 'San Luis Potosí', '25': 'Sinaloa', '26': 'Sonora', '27': 'Tabasco',
  '28': 'Tamaulipas', '29': 'Tlaxcala', '30': 'Veracruz', '31': 'Yucatán', '32': 'Zacatecas',
}
const PROGRAMA: { [p: string]: string } = { tamizaje_rosa: 'Tamizaje Rosa', salud_que_florece: 'Salud que Florece' }

/** Which measures make sense with which dimension. */
export function measuresFor(d: Dimension): Measure[] {
  return d === 'regla' ? ['alertas'] : ['registros', 'personas', 'atenciones', 'participaciones']
}

/** Category keys of one record for a dimension (a record can fall in several alliances, or none). */
function keysOf(r: Record, d: Dimension, ctx: ChartCtx, allianceIdx: Map<string, string[]>): string[] {
  switch (d) {
    case 'estado': return [ESTADO[r.estado] ?? (r.estado || 'Sin estado')]
    case 'municipio': return [r.municipio || 'Sin municipio']
    case 'servicio': return [r.servicio || 'Sin servicio']
    case 'programa': {
      const p = ctx.files.find((f) => f.id === r.source_file_id)?.programa
      return [PROGRAMA[p ?? ''] ?? p ?? 'Sin programa']
    }
    case 'mes': return /^\d{4}-\d{2}/.test(r.fecha_servicio) ? [r.fecha_servicio.slice(0, 7)] : []
    case 'alianza': return allianceIdx.get(r.record_id) ?? []
    default: return []
  }
}

export function aggregate(ctx: ChartCtx, q: { measure: Measure; dimension: Dimension }): { label: string; value: number }[] {
  const out = new Map<string, number>()
  if (q.measure === 'alertas' || q.dimension === 'regla') {
    if (q.measure !== 'alertas' || q.dimension !== 'regla') return []
    const labels = new Map(RULES.rules.map((r) => [r.id, r.label]))
    for (const i of runQuality(ctx.records, ctx.mappings)) {
      const k = labels.get(i.rule_id) ?? i.rule_id
      out.set(k, (out.get(k) ?? 0) + 1)
    }
  } else {
    const allianceIdx = new Map<string, string[]>()
    if (q.dimension === 'alianza') for (const a of ctx.alliances) for (const r of recordsOf(a, ctx.records)) allianceIdx.set(r.record_id, [...(allianceIdx.get(r.record_id) ?? []), a.nombre])
    const byId = new Map(ctx.records.map((r) => [r.record_id, r]))
    if (q.measure === 'personas') {
      const clustered = new Set<string>()
      const count = (ids: string[]) => {
        const cats = new Set<string>()
        for (const id of ids) { const r = byId.get(id); if (r) keysOf(r, q.dimension, ctx, allianceIdx).forEach((k) => cats.add(k)) }
        for (const k of cats) out.set(k, (out.get(k) ?? 0) + 1)
      }
      for (const p of ctx.persons) { count(p.record_ids); p.record_ids.forEach((id) => clustered.add(id)) }
      for (const r of ctx.records) if (!clustered.has(r.record_id)) count([r.record_id])
    } else {
      const keep = (r: Record) => q.measure === 'registros' || (q.measure === 'atenciones' ? r.tipo === 'atencion' : r.tipo === 'participacion')
      for (const r of ctx.records) if (keep(r)) for (const k of keysOf(r, q.dimension, ctx, allianceIdx)) out.set(k, (out.get(k) ?? 0) + 1)
    }
  }
  const rows = [...out].map(([label, value]) => ({ label, value }))
  return q.dimension === 'mes' ? rows.sort((a, b) => a.label.localeCompare(b.label)) : rows.sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
}

/** Rows for a chart: one key per measure, side by side; values are never summed across measures. */
export function series(ctx: ChartCtx, spec: ChartSpec): ChartRow[] {
  const rows = new Map<string, ChartRow>()
  for (const m of spec.measures) {
    for (const { label, value } of aggregate(ctx, { measure: m, dimension: spec.dimension })) {
      const row = rows.get(label) ?? ({ label } as ChartRow)
      row[m] = value
      rows.set(label, row)
    }
  }
  for (const row of rows.values()) for (const m of spec.measures) if (row[m] === undefined) row[m] = 0
  const all = [...rows.values()]
  if (spec.dimension === 'mes') return all.sort((a, b) => a.label.localeCompare(b.label))
  const first = spec.measures[0]
  return all.sort((a, b) => Number(b[first]) - Number(a[first]))
}

/** Can this chart type show this data? Returns the reason when it cannot. */
export function typeCheck(type: ChartType, dimension: Dimension, measures: Measure[], categories: number): { ok: boolean; reason?: string } {
  if (type === 'linea' && dimension !== 'mes') return { ok: false, reason: 'La línea solo tiene sentido en el tiempo (por mes).' }
  if (type === 'pastel' && measures.length > 1) return { ok: false, reason: 'El pastel muestra una sola medida.' }
  if (type === 'pastel' && categories > 6) return { ok: false, reason: `El pastel se lee mal con ${categories} categorías (máximo 6).` }
  if (type === 'pastel' && measures[0] === 'personas') return { ok: false, reason: 'Una persona puede estar en varias categorías: el pastel no suma 100 %.' }
  return { ok: true }
}

/** The charts that fit the loaded data. */
export function suggest(ctx: ChartCtx): ChartSpec[] {
  if (!ctx.records.length) return []
  const has = (m: Measure, d: Dimension) => aggregate(ctx, { measure: m, dimension: d }).length > 0
  const out: ChartSpec[] = [
    { id: 'personas-estado', title: 'Personas únicas por estado', dimension: 'estado', measures: ['personas'], type: 'barras' },
    { id: 'filas-vs-personas', title: 'Filas contra personas únicas por estado (el doble conteo)', dimension: 'estado', measures: ['registros', 'personas'], type: 'columnas' },
    { id: 'atenciones-participaciones', title: 'Atenciones y participaciones por estado (sin sumar)', dimension: 'estado', measures: ['atenciones', 'participaciones'], type: 'columnas' },
    { id: 'servicios', title: 'Servicios por tipo', dimension: 'servicio', measures: ['registros'], type: 'barras' },
  ]
  if (has('registros', 'mes')) out.push({ id: 'por-mes', title: 'Atenciones y participaciones por mes', dimension: 'mes', measures: ['atenciones', 'participaciones'], type: 'linea' })
  if (ctx.alliances.length && has('personas', 'alianza')) out.push({ id: 'alianzas', title: 'Mujeres únicas por alianza', dimension: 'alianza', measures: ['personas'], type: 'barras' })
  if (has('alertas', 'regla')) out.push({ id: 'alertas-regla', title: 'Alertas de calidad por regla', dimension: 'regla', measures: ['alertas'], type: 'barras' })
  return out
}

/** CSV block with the data of each chart in the report. */
export function chartsCsv(ctx: ChartCtx, specs: ChartSpec[]): string {
  const cell = (v: string | number) => { const s = String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
  const lines = ['grafica,categoria,medida,valor']
  for (const s of specs) for (const row of series(ctx, s)) for (const m of s.measures) lines.push([s.title, row.label, MEASURE_LABEL[m], row[m]].map(cell).join(','))
  return lines.join('\n') + '\n'
}
