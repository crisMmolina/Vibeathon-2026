// Paso 6 · Informe (recipe "detail", hero: the report cover Plate). Numbers come from src/lib/report → indicators.
import { useEffect, useMemo, useState } from 'react'
import type { DemoTruth } from '../../schemas/index.ts'
import { Button, Chip, EmptyState, PageHeader, PageLayout, Plate, Row, SectionHeader, SimBadge, Stat, Light } from '../../lib/ui/index.tsx'
import { candidates } from '../../lib/match.ts'
import { persons } from '../../lib/indicators.ts'
import { build, exportPdf, labelFor, toCsv, valorText } from '../../lib/report.ts'
import { chartsCsv, suggest, type ChartCtx, type ChartSpec } from '../../lib/charts.ts'
import { useApp } from '../../store/index.ts'
import { loadDemo } from '../map/loadDemo.ts'
import { ReportCharts } from './Charts.tsx'

/** One CSV with the indicators and the data of every chart in the report (Blob, stays on this computer). */
function downloadCsv(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const fmtFecha = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
const pct = (x: number) => `${Math.round(x * 100)} %`

// Print layout lives with the screen it prints (the shell's nav and the buttons do not go on paper).
const PRINT_CSS = `
@media print {
  .ui-nav, .no-print { display: none !important; }
  .ui-main { padding: 0 !important; }
  .ui-layout-detail { max-width: none !important; padding: 0 !important; }
  .report-page { break-inside: avoid; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}`

export default function ReportView() {
  const { records, pairs: storedPairs, audit, files, alliances, mappings, set } = useApp()
  const [picked, setPicked] = useState<ChartSpec[] | null>(null)
  const [truth, setTruth] = useState<DemoTruth | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isDemo = files.some((f) => f.nombre === 'jornadas_tamizaje.csv')
  useEffect(() => {
    if (!isDemo) return setTruth(null)
    fetch('/demo_data/truth.json').then((r) => (r.ok ? r.json() : null)).then(setTruth).catch(() => setTruth(null))
  }, [isDemo])

  const pairs = useMemo(() => (storedPairs.length ? storedPairs : candidates(records)), [storedPairs, records])
  const fechaCorte = files[0]?.periodo.hasta ?? '2026-09-30'
  const report = useMemo(() => build({ records, pairs, audit, files, fecha_corte: fechaCorte, truth }), [records, pairs, audit, files, fechaCorte, truth])
  const people = useMemo(() => persons(records, pairs), [records, pairs])
  const ctx: ChartCtx = useMemo(() => ({ records, persons: people, alliances, files, mappings }), [records, people, alliances, files, mappings])
  const chosen = picked ?? suggest(ctx).slice(0, 4)

  if (!records.length) {
    return (
      <PageLayout recipe="detail">
        <PageHeader title="Informe para donantes" sub="Con fecha de corte, denominador y fuente en cada número." lamina="LÁMINA 06 · INFORME" />
        <EmptyState
          text={error || 'Todavía no hay datos para el informe. Carga tus archivos en el paso 1 o usa los datos de demostración.'}
          action={
            <Button variant="primary" disabled={loading} onClick={async () => {
              setLoading(true); setError('')
              try { set(await loadDemo()) } catch { setError('No se pudieron leer los datos de demostración.') } finally { setLoading(false) }
            }}>
              {loading ? 'Cargando…' : 'Usar datos de demostración'}
            </Button>
          }
        />
      </PageLayout>
    )
  }

  const personas = report.indicators.find((i) => i.id === 'personas_unicas')
  const otros = report.indicators.filter((i) => i.id !== 'personas_unicas')
  const pendientes = pairs.filter((p) => p.verdict === 'pendiente').length
  const q = report.calidad_matcher

  return (
    <PageLayout recipe="detail">
      <style>{PRINT_CSS}</style>
      <PageHeader
        title="Informe para donantes"
        sub={`Corte: ${fmtFecha(report.fecha_corte)} · regla ${report.regla_version}`}
        action={
          <div className="no-print" style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
            <Button onClick={() => downloadCsv(`${toCsv(report)}\n${chartsCsv(ctx, chosen)}`, `informe-eira-${report.fecha_corte}.csv`)}>Descargar CSV</Button>
            <Button variant="primary" onClick={exportPdf}>Exportar PDF</Button>
          </div>
        }
      />

      <div className="report-page">
        <Plate
          head={<><Chip tone="ink">EIRA · INFORME DE IMPACTO</Chip>{isDemo && <SimBadge label="DATOS SINTÉTICOS" />}</>}
          foot={<span className="ui-note">Generado en este navegador el {new Date(report.generado).toLocaleString('es-MX')} · Ningún dato salió de esta computadora.</span>}
        >
          <div style={{ display: 'grid', gap: 'var(--s-6)', padding: 'var(--s-6)' }}>
            {personas && (
              <Stat
                size="hero"
                value={valorText(personas)}
                label={`personas únicas · ${labelFor(personas)}`}
                source={`${personas.denominador}; ${personas.fuentes.join(', ')}; regla ${personas.regla_version}`}
              />
            )}
            <div className="ui-stat-row">
              {otros.map((i) => (
                <Stat key={i.id} value={valorText(i)} label={`${i.nombre.toLowerCase()} · ${labelFor(i)}`} source={`${i.fuentes.join(', ')} · corte ${i.fecha_corte}`} />
              ))}
            </div>
            {personas?.estado === 'estimado' && (
              <p className="ui-note">
                Cifra estimada, no oficial: faltan {pendientes} coincidencias por decidir en el paso 4. Las filas no se suman entre programas.
              </p>
            )}
          </div>
        </Plate>
      </div>

      <ReportCharts
        ctx={ctx}
        chosen={chosen}
        setChosen={setPicked}
        estado={personas ? labelFor(personas) : 'estimado, no oficial'}
        fuente={`${report.archivos.map((f) => f.nombre).join(', ')} · corte ${report.fecha_corte}`}
      />

      <section className="report-page">
        <SectionHeader title="Ficha de cada indicador" meta="fecha de corte · denominador · fuente · regla" />
        <ul className="ui-rows">
          {report.indicators.map((i) => (
            <Row
              key={i.id}
              lead={<Light tone={i.estado === 'validado' ? 'ok' : 'warn'} />}
              title={`${i.nombre}: ${valorText(i)} (${labelFor(i)})`}
              meta={`Corte ${i.fecha_corte} · ${i.denominador} · Fuente: ${i.fuentes.join(', ')} · Regla ${i.regla_version}`}
            />
          ))}
        </ul>
      </section>

      {q && (
        <section className="report-page">
          <SectionHeader title="Qué tan bien sugiere coincidencias" meta={q.nota} />
          <p>
            Sugirió {q.sugeridos} pares: {q.correctos} son la misma persona según la verdad conocida del caso de prueba
            ({q.reales} vínculos reales). Precisión {pct(q.precision)} · exhaustividad {pct(q.recall)} · {q.rechazados} pares rechazados por una persona.
          </p>
          <p className="ui-note">Medido sobre datos sintéticos. Con datos reales no hay verdad conocida: por eso ninguna fusión ocurre sin confirmación humana.</p>
        </section>
      )}

      <section className="report-page">
        <SectionHeader title="Anexo · ajustes manuales" meta={`${report.ajustes.length} registrados`} />
        {report.ajustes.length ? (
          <ul className="ui-rows">
            {report.ajustes.map((a, n) => (
              <Row key={n} lead={<Light tone="ok" />} title={`${a.action} · ${a.entity}`} meta={`${a.user} · ${new Date(a.ts).toLocaleString('es-MX')} · Motivo: ${a.reason}`} />
            ))}
          </ul>
        ) : (
          <p className="ui-note">Aún no hay ajustes. Cada corrección de calidad y cada decisión de coincidencia queda aquí con quién, cuándo y por qué.</p>
        )}
      </section>

      <section className="report-page">
        <SectionHeader title="Archivos de origen" />
        <ul className="ui-rows">
          {report.archivos.map((f) => (
            <Row key={f.hash} lead={<Light tone="ok" />} title={f.nombre} meta={`${f.filas} filas · huella ${f.hash}`} />
          ))}
        </ul>
        <p className="ui-note no-print">El envío al donante está simulado: descarga el PDF o el CSV y compártelo por tu canal habitual. <SimBadge /></p>
      </section>
    </PageLayout>
  )
}
