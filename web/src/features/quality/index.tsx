// Paso 3 · Calidad (recipe: list). Alerts are suggestions: a person corrects, excludes or accepts, always with a reason.
import { useEffect, useState } from 'react'
import { RULES, resolve, run } from '../../lib/quality.ts'
import { Button, Chip, EmptyState, Light, PageHeader, PageLayout, Row, SectionHeader, SimBadge, Stat, type Tone } from '../../lib/ui/index.tsx'
import type { QualityIssue, Record, Severity } from '../../schemas/index.ts'
import { useApp } from '../../store/index.ts'
import { estadoNombre, fileName, folio, goTo, maskedName } from './shared.ts'

type Action = Exclude<QualityIssue['resolution'], 'pendiente'>
const TONE: { [s in Severity]: Tone } = { rojo: 'bad', ambar: 'warn', verde: 'ok' }
const ORDER: Severity[] = ['rojo', 'ambar', 'verde']
const DONE_LABEL: { [a in Action]: string } = { corregida: 'Corregida', excluida: 'Excluida', aceptada: 'Aceptada' }
const VERB: { [a in Action]: string } = { corregida: 'Corregir', aceptada: 'Aceptar', excluida: 'Excluir' }
const key = (i: QualityIssue) => `${i.record_id}:${i.rule_id}`
const rule = (id: string) => RULES.rules.find((r) => r.id === id)!

export default function QualityView() {
  const { records, mappings, files, issues, audit, rol, set } = useApp()
  const [open, setOpen] = useState<{ key: string; action: Action } | null>(null)
  const [reason, setReason] = useState('')
  const [value, setValue] = useState('')

  useEffect(() => {
    if (records.length && !issues.length) set({ issues: run(records, mappings) })
  }, [records, mappings, issues.length, set])

  if (!records.length)
    return (
      <PageLayout recipe="list">
        <PageHeader title="Calidad de los datos" sub="Cada ajuste pide un motivo y queda en la bitácora." />
        <EmptyState text="Primero carga tus archivos." action={<Button variant="primary" onClick={() => goTo('carga')}>Ir a Carga</Button>} />
      </PageLayout>
    )

  const byId = new Map(records.map((r) => [r.record_id, r]))
  const sorted = [...issues].sort((a, b) => ORDER.indexOf(a.severity) - ORDER.indexOf(b.severity))
  const alerts = sorted.filter((i) => i.severity !== 'verde')
  const notes = sorted.filter((i) => i.severity === 'verde')
  const pending = alerts.filter((i) => i.resolution === 'pendiente')
  const demo = files.length > 0 && files.every((f) => /^(jornadas_tamizaje\.csv|salud_que_florece\.xlsx|alianzas\.csv)$/.test(f.nombre))

  function start(i: QualityIssue, action: Action) {
    setOpen({ key: key(i), action })
    setReason('')
    setValue('')
  }

  function save(i: QualityIssue, action: Action) {
    if (!reason.trim()) return
    const done = resolve(i, action, reason.trim(), rol, audit)
    const field = rule(i.rule_id).field
    set({
      audit: done.audit,
      issues: issues.map((x) => (x === i ? done.issue : action === 'excluida' && x.record_id === i.record_id && x.resolution === 'pendiente' ? { ...done.issue, rule_id: x.rule_id, severity: x.severity } : x)),
      records:
        action === 'excluida' ? records.filter((r) => r.record_id !== i.record_id)
        : action === 'corregida' && value.trim() ? records.map((r) => (r.record_id === i.record_id ? ({ ...r, [field]: value.trim() } as Record) : r))
        : records,
    })
    setOpen(null)
  }

  const row = (i: QualityIssue) => {
    const r = byId.get(i.record_id)
    const column = i.record_id.includes('#') ? i.record_id.split('#') : null
    const where = column ? `Columna "${column[1]}" · ${fileName(files, column[0])}` : r ? `${folio(r.record_id)} · ${maskedName(r)} · ${estadoNombre(r.estado)}, ${r.municipio || 'sin municipio'} · ${fileName(files, r.source_file_id)}` : `${folio(i.record_id)} · registro excluido`
    const editing = open?.key === key(i) ? open.action : null
    const actions: Action[] = column ? ['aceptada'] : ['corregida', 'aceptada', 'excluida']
    return (
      <Row
        key={key(i)}
        lead={<Light tone={TONE[i.severity]} />}
        title={rule(i.rule_id).label}
        meta={
          <>
            {where}
            {i.resolution !== 'pendiente' && <div>Motivo: {i.reason}</div>}
            {editing && (
              <form onSubmit={(e) => (e.preventDefault(), save(i, editing))} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)', alignItems: 'center', marginTop: 'var(--s-2)' }}>
                {editing === 'corregida' && <input className="ui-btn" data-size="sm" aria-label="Valor correcto" placeholder="Valor correcto" value={value} onChange={(e) => setValue(e.target.value)} style={{ cursor: 'text' }} />}
                <input className="ui-btn" data-size="sm" aria-label="Motivo" placeholder={`Motivo para ${VERB[editing].toLowerCase()} (obligatorio)`} value={reason} onChange={(e) => setReason(e.target.value)} style={{ flex: '1 1 240px', cursor: 'text', justifyContent: 'flex-start' }} autoFocus />
                <Button size="sm" type="submit" disabled={!reason.trim() || (editing === 'corregida' && !value.trim())}>
                  Guardar
                </Button>
                <Button size="sm" variant="ghost" type="button" onClick={() => setOpen(null)}>
                  Cancelar
                </Button>
              </form>
            )}
          </>
        }
        end={
          i.resolution !== 'pendiente' ? <Chip size="sm" tone="ink">{DONE_LABEL[i.resolution]}</Chip>
          : editing ? null
          : actions.map((a) => (
              <Button key={a} size="sm" variant={a === 'corregida' ? 'secondary' : 'ghost'} onClick={() => start(i, a)}>
                {VERB[a]}
              </Button>
            ))
        }
      />
    )
  }

  const count = (ids: string[]) => pending.filter((i) => ids.includes(i.rule_id)).length

  return (
    <PageLayout recipe="list">
      <PageHeader title="Calidad de los datos" sub="Cada ajuste pide un motivo y queda en la bitácora." action={<Button variant="primary" onClick={() => goTo('coincidencias')}>Ver coincidencias</Button>} />
      <div style={{ display: 'flex', gap: 'var(--s-8)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <Stat size="hero" value={pending.length} label="alertas por revisar" source={`reglas ${RULES.version} sobre ${records.length} filas`} />
        <div style={{ display: 'grid', gap: 'var(--s-1)' }}>
          {[
            { tone: 'bad' as Tone, n: count(['fecha_nac_formato']), text: 'fechas de nacimiento inválidas' },
            { tone: 'warn' as Tone, n: count(['localidad_requerida']), text: 'sin localidad' },
            { tone: 'warn' as Tone, n: count(['telefono_formato', 'fuera_de_periodo']), text: 'teléfonos inválidos o servicios fuera de periodo' },
          ].map((s) => (
            <span key={s.text} style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'center' }}>
              <Light tone={s.tone} /> {s.n} {s.text}
            </span>
          ))}
        </div>
        {demo && <SimBadge label="DATOS SINTÉTICOS" />}
      </div>
      <div>
        <SectionHeader title="Alertas" meta={`${pending.length} pendientes · ${alerts.length - pending.length} resueltas`} />
        <ul className="ui-rows">{alerts.map(row)}</ul>
      </div>
      {notes.length > 0 && (
        <div>
          <SectionHeader title="Columnas con nombres distintos" meta={`${notes.filter((i) => i.resolution === 'pendiente').length} avisos · ya quedaron unidas en Carga`} />
          <ul className="ui-rows">{notes.map(row)}</ul>
        </div>
      )}
      <p className="ui-note">Nada se corrige solo: tú decides y el motivo queda registrado ({audit.length} ajustes en la bitácora).</p>
    </PageLayout>
  )
}
