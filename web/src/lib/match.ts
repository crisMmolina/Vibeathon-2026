// Record linkage (IDEA.md §5): normalization → blocking → simplified Fellegi-Sunter → human verdict.
// The name is never a key and nothing merges without a click.
import type { AuditEntry, MatchPair, Record, Verdict } from '../schemas/index.ts'
import { log } from './audit.ts'
import { isValidDate, phoneDigits } from './quality.ts'

export const THRESHOLDS = { probable: 0.85, revisar: 0.6 } as const
const W = { fecha_nac: 0.35, tel: 0.2, nombre: 0.2, localidad: 0.15, ap2: 0.1 } as const

export function normName(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/\b(de la|de los|del|de|la)\b/g, ' ').replace(/[^a-z ]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function jw(a: string, b: string): number {
  if (a === b) return 1
  if (!a || !b) return 0
  const range = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1)
  const am = Array(a.length).fill(false), bm = Array(b.length).fill(false)
  let m = 0
  for (let i = 0; i < a.length; i++)
    for (let j = Math.max(0, i - range); j < Math.min(b.length, i + range + 1); j++)
      if (!bm[j] && a[i] === b[j]) { am[i] = bm[j] = true; m++; break }
  if (!m) return 0
  let t = 0
  for (let i = 0, k = 0; i < a.length; i++) { if (!am[i]) continue; while (!bm[k]) k++; if (a[i] !== b[k]) t++; k++ }
  const j = (m / a.length + m / b.length + (m - t / 2) / m) / 3
  let p = 0
  while (p < 4 && a[p] === b[p]) p++
  return j + p * 0.1 * (1 - j)
}

function score(a: Record, b: Record): { score: number; reasons: string[]; homonym: boolean } {
  const reasons: string[] = []
  let s = 0
  const fechaOk = isValidDate(a.fecha_nac) && a.fecha_nac === b.fecha_nac
  if (fechaOk) { s += W.fecha_nac; reasons.push('misma fecha de nacimiento') }
  const ta = phoneDigits(a.tel), tb = phoneDigits(b.tel)
  if (ta.length === 10 && ta === tb) { s += W.tel; reasons.push('mismo teléfono') }
  const na = normName(`${a.nombre} ${a.ap1}`), nb = normName(`${b.nombre} ${b.ap1}`)
  const nsim = jw(na, nb)
  s += W.nombre * nsim
  reasons.push(`nombre ${Math.round(nsim * 100)} %`)
  if (a.localidad && normName(a.localidad) === normName(b.localidad)) { s += W.localidad; reasons.push('misma localidad') }
  const a2 = normName(a.ap2), b2 = normName(b.ap2)
  if (a2 && a2 === b2) { s += W.ap2; reasons.push('mismo segundo apellido') }
  else if (!a2 || !b2) { s += W.ap2 / 2; reasons.push('segundo apellido omitido') }
  const sameFullName = na === nb && a2 === b2 && !!a2
  const homonym = sameFullName && !fechaOk
  if (homonym) reasons.push('fecha de nacimiento distinta', 'revisar con cuidado')
  return { score: Math.round(s * 100) / 100, reasons, homonym }
}

/** Candidate pairs: blocks by birth date, by (state, surname initial) and by exact full name. */
export function candidates(records: Record[]): MatchPair[] {
  const blocks = new Map<string, Record[]>()
  const add = (k: string, r: Record) => blocks.set(k, [...(blocks.get(k) ?? []), r])
  for (const r of records) {
    if (isValidDate(r.fecha_nac)) add(`f:${r.fecha_nac}`, r)
    add(`e:${r.estado}:${normName(r.ap1).charAt(0)}`, r)
    add(`n:${normName(`${r.nombre} ${r.ap1} ${r.ap2}`)}`, r)
  }
  const seen = new Set<string>()
  const out: MatchPair[] = []
  for (const group of blocks.values()) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const [a, b] = [group[i], group[j]].sort((x, y) => x.record_id.localeCompare(y.record_id))
        const k = `${a.record_id}|${b.record_id}`
        if (seen.has(k)) continue
        seen.add(k)
        const sc = score(a, b)
        if (sc.score < THRESHOLDS.revisar && !sc.homonym) continue
        out.push({ pair_id: k, a_id: a.record_id, b_id: b.record_id, score: sc.score, reasons: sc.reasons, verdict: 'pendiente', user: null, ts: null })
      }
    }
  }
  return out.sort((x, y) => y.score - x.score)
}

export function band(p: MatchPair): 'probable' | 'revisar' {
  return p.score >= THRESHOLDS.probable && !p.reasons.includes('revisar con cuidado') ? 'probable' : 'revisar'
}

/** A person decides; the decision is logged. Without a user nothing changes. */
export function decide(pairs: MatchPair[], pairId: string, verdict: Exclude<Verdict, 'pendiente'>, user: string, audit: AuditEntry[] = []) {
  if (!user?.trim()) throw new Error('match: solo una persona puede decidir')
  const before = pairs.find((p) => p.pair_id === pairId)
  if (!before) throw new Error(`match: par desconocido ${pairId}`)
  const ts = new Date().toISOString()
  const reason = verdict === 'misma' ? 'Confirmada como la misma persona' : 'Confirmadas como personas distintas'
  const next = log(audit, { user, action: `match.${verdict}`, entity: pairId, before: before.verdict, after: verdict, reason, ts })
  return { pairs: pairs.map((p) => (p.pair_id === pairId ? { ...p, verdict, user, ts } : p)), audit: next }
}
