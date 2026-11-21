// Manual-adjustment log (IDEA.md §4 step 3). Every human change carries who, when and why.
import type { AuditEntry } from '../schemas/index.ts'

export type AuditInput = Omit<AuditEntry, 'ts'> & { ts?: string }

export function log(entries: AuditEntry[], e: AuditInput): AuditEntry[] {
  if (!e.user?.trim()) throw new Error('audit: falta quién hizo el ajuste')
  if (!e.reason?.trim()) throw new Error('audit: el motivo es obligatorio')
  return [...entries, { ...e, ts: e.ts ?? new Date().toISOString() }]
}
