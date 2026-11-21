// What each alliance produced (IDEA.md §4 step 5). Records link to an alliance through the jornada of their
// municipality (JOR-<MUNICIPIO>); women are counted once per cluster, never per row.
import type { Alliance, Person, Record } from '../schemas/index.ts'

export interface AllianceSummary {
  alliance: Alliance
  mujeres_unicas: number
  atenciones: number
  participaciones: number
  servicios: { servicio: string; n: number }[]
  record_ids: string[]
}

export function jornadaOf(municipio: string): string {
  return 'JOR-' + municipio.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]+/g, '-').replace(/^-|-$/g, '')
}

export function recordsOf(a: Alliance, records: Record[]): Record[] {
  const jornadas = new Set(a.jornadas)
  return records.filter((r) => r.municipio && jornadas.has(jornadaOf(r.municipio)))
}

export function summary(a: Alliance, records: Record[], persons: Person[]): AllianceSummary {
  const mine = recordsOf(a, records)
  const ids = new Set(mine.map((r) => r.record_id))
  const clustered = new Set<string>()
  let mujeres = 0
  for (const p of persons) {
    const inside = p.record_ids.filter((id) => ids.has(id))
    if (inside.length) { mujeres++; inside.forEach((id) => clustered.add(id)) }
  }
  mujeres += mine.filter((r) => !clustered.has(r.record_id)).length // records not in any cluster count as one woman each
  const byServ = new Map<string, number>()
  for (const r of mine) if (r.servicio) byServ.set(r.servicio, (byServ.get(r.servicio) ?? 0) + 1)
  return {
    alliance: a,
    mujeres_unicas: mujeres,
    atenciones: mine.filter((r) => r.tipo === 'atencion').length,
    participaciones: mine.filter((r) => r.tipo === 'participacion').length,
    servicios: [...byServ].map(([servicio, n]) => ({ servicio, n })).sort((x, y) => y.n - x.n || x.servicio.localeCompare(y.servicio)),
    record_ids: [...ids],
  }
}
