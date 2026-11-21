// Every number on screen comes from here (IDEA.md §5). Entities are counted apart and never added up.
import type { Indicator, MatchPair, Person, Record } from '../schemas/index.ts'

export const REGLA_VERSION = 'ind-1.0'

export interface IndicatorInput { records: Record[]; pairs: MatchPair[]; fecha_corte: string }

/** Union-find over record ids, merging the given pairs. */
export function clusters(records: Record[], pairs: MatchPair[]): string[][] {
  const parent = new Map(records.map((r) => [r.record_id, r.record_id]))
  const find = (x: string): string => {
    let p = parent.get(x) ?? x
    while (p !== (parent.get(p) ?? p)) p = parent.get(p) ?? p
    parent.set(x, p)
    return p
  }
  for (const pr of pairs) {
    if (!parent.has(pr.a_id) || !parent.has(pr.b_id)) continue
    const a = find(pr.a_id), b = find(pr.b_id)
    if (a !== b) parent.set(a, b)
  }
  const groups = new Map<string, string[]>()
  for (const r of records) {
    const root = find(r.record_id)
    groups.set(root, [...(groups.get(root) ?? []), r.record_id])
  }
  return [...groups.values()]
}

/** People as clusters: only human-confirmed links merge records. */
export function persons(records: Record[], pairs: MatchPair[]): Person[] {
  const pending = new Set(pairs.filter((p) => p.verdict === 'pendiente').flatMap((p) => [p.a_id, p.b_id]))
  return clusters(records, pairs.filter((p) => p.verdict === 'misma')).map((ids, i) => ({
    person_id: `P-${String(i + 1).padStart(4, '0')}`,
    record_ids: ids,
    status: ids.some((id) => pending.has(id)) ? 'estimada' : 'validada',
  }))
}

export function compute({ records, pairs, fecha_corte }: IndicatorInput): Indicator[] {
  const fuentes = [...new Set(records.map((r) => r.source_file_id))]
  const fuentesDe = (tipo: Record['tipo']) => [...new Set(records.filter((r) => r.tipo === tipo).map((r) => r.source_file_id))]
  const base = { fecha_corte, regla_version: REGLA_VERSION }

  const max = clusters(records, pairs.filter((p) => p.verdict === 'misma')).length
  const min = clusters(records, pairs.filter((p) => p.verdict === 'misma' || p.verdict === 'pendiente')).length
  const validado = !pairs.some((p) => p.verdict === 'pendiente')

  return [
    { ...base, id: 'atenciones', nombre: 'Atenciones de tamizaje', valor: records.filter((r) => r.tipo === 'atencion').length,
      denominador: 'atenciones registradas (una mujer puede tener varias)', fuentes: fuentesDe('atencion'), estado: 'validado' },
    { ...base, id: 'participaciones', nombre: 'Participaciones en talleres', valor: records.filter((r) => r.tipo === 'participacion').length,
      denominador: 'participaciones registradas (una mujer puede tener varias)', fuentes: fuentesDe('participacion'), estado: 'validado' },
    { ...base, id: 'personas_unicas', nombre: 'Personas únicas',
      valor: validado ? max : { min, max },
      denominador: 'personas distintas tras confirmar coincidencias; filas totales es la cota superior',
      fuentes, estado: validado ? 'validado' : 'estimado' },
  ]
}
