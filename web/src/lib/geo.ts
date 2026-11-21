// Per-state aggregation for the 3D map (IDEA.md §4 step 2). Height = people, never rows, once clusters exist.
import type { Alliance, Person, Record } from '../schemas/index.ts'

export interface StateAgg { cve_ent: string; filas: number; personas: number }

/** Local states geometry (32 polygons with cve_ent), served by this same app. */
export const ESTADOS_GEOJSON_URL = '/geo/estados.geojson'

/**
 * Rows and people per state. Without clusters every row counts as one person (raw upper bound).
 * With clusters, a person counts once in each state where she has a record.
 */
export function aggregateByState(records: Record[], persons?: Person[]): StateAgg[] {
  const out = new Map<string, StateAgg>()
  const at = (cve: string) => {
    let s = out.get(cve)
    if (!s) { s = { cve_ent: cve, filas: 0, personas: 0 }; out.set(cve, s) }
    return s
  }
  for (const r of records) at(r.estado).filas++
  if (!persons) {
    for (const r of records) at(r.estado).personas++
  } else {
    const estadoOf = new Map(records.map((r) => [r.record_id, r.estado]))
    for (const p of persons) {
      const estados = new Set(p.record_ids.map((id) => estadoOf.get(id)).filter((e): e is string => !!e))
      for (const e of estados) at(e).personas++
    }
  }
  return [...out.values()].sort((a, b) => a.cve_ent.localeCompare(b.cve_ent))
}

/** Pink ramp (pale → deep) used by fill-extrusion; t in 0..1. */
export const PINK_RAMP = ['#FCE4EC', '#F8BBD0', '#F08FAA', '#E5739A', '#D9577F'] as const

export function rampColor(value: number, max: number): string {
  if (max <= 0) return PINK_RAMP[0]
  const i = Math.min(PINK_RAMP.length - 1, Math.floor((value / max) * (PINK_RAMP.length - 1) + 0.0001))
  return PINK_RAMP[i]
}

/** Extrusion height in meters: tall enough to read at country zoom. */
export function extrusionHeight(value: number, max: number, maxMeters = 400_000): number {
  return max > 0 ? Math.round((value / max) * maxMeters) : 0
}

/** alianzas.csv rows → Alliance[] (jornadas separated by "|"). */
export function parseAlliances(rows: { [c: string]: string }[]): Alliance[] {
  return rows.map((r) => ({
    id: r.id, nombre: r.nombre, tipo: r.tipo as Alliance['tipo'], estado: r.estado, municipio: r.municipio,
    lat: Number(r.lat), lng: Number(r.lng), jornadas: (r.jornadas ?? '').split('|').filter(Boolean),
  }))
}
