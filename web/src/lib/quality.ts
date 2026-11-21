// Declarative quality rules (rules.json). Alerts are suggestions: a person corrects, excludes or accepts with a reason.
import type { AuditEntry, ColumnMapping, QualityIssue, Record, Severity } from '../schemas/index.ts'
import { log } from './audit.ts'
import rulesJson from './rules.json'

interface Rule { id: string; field: string; kind: string; severity: Severity; label: string }
export interface RuleSet { version: string; periodo: { desde: string; hasta: string }; rules: Rule[] }
export const RULES = rulesJson as RuleSet

export function isValidDate(v: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
  if (!m) return false
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3]
}

export function phoneDigits(v: string): string {
  const d = v.replace(/\D/g, '')
  return d.length > 10 && d.startsWith('52') ? d.slice(-10) : d
}

const issue = (record_id: string, rule: Rule): QualityIssue => ({
  record_id, rule_id: rule.id, severity: rule.severity, resolution: 'pendiente', reason: null, user: null, ts: null,
})

export function run(records: Record[], mappings: ColumnMapping[] = [], rules: RuleSet = RULES): QualityIssue[] {
  const out: QualityIssue[] = []
  for (const rule of rules.rules) {
    if (rule.kind === 'ambiguous_column') {
      const byField = new Map<string, Set<string>>()
      for (const m of mappings) {
        if (m.target_field === 'ignorar') continue
        byField.set(m.target_field, (byField.get(m.target_field) ?? new Set()).add(m.source_col))
      }
      for (const m of mappings) {
        const cols = byField.get(m.target_field)
        if (cols && cols.size > 1) out.push(issue(`${m.source_file_id}#${m.source_col}`, rule))
      }
      continue
    }
    for (const r of records) {
      const v = String((r as unknown as { [k: string]: string })[rule.field] ?? '')
      const bad =
        rule.kind === 'required' ? !v.trim() :
        rule.kind === 'date' ? !isValidDate(v) :
        rule.kind === 'phone' ? phoneDigits(v).length !== 10 :
        rule.kind === 'period' ? isValidDate(v) && (v < rules.periodo.desde || v > rules.periodo.hasta) :
        false
      if (bad) out.push(issue(r.record_id, rule))
    }
  }
  return out
}

/** Correct, exclude or accept an alert. The reason is mandatory and lands in the audit log. */
export function resolve(issue: QualityIssue, resolution: QualityIssue['resolution'], reason: string, user: string, audit: AuditEntry[] = []) {
  const ts = new Date().toISOString()
  const next = log(audit, { user, action: `quality.${resolution}`, entity: `${issue.record_id}:${issue.rule_id}`, before: issue.resolution, after: resolution, reason, ts })
  return { issue: { ...issue, resolution, reason, user, ts }, audit: next }
}
