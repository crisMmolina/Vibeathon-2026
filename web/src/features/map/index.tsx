// Paso 2 · recipe "map + panel" (web/DESIGN.md). Every number comes from src/lib (indicators, geo, match).
import { useMemo, useState } from 'react'
import { Button, Chip, EmptyState, Legend, Light, PageLayout, Row, SectionHeader, Segmented, SimBadge, Stat } from '../../lib/ui/index.tsx'
import { aggregateByState } from '../../lib/geo.ts'
import { compute, persons } from '../../lib/indicators.ts'
import { candidates } from '../../lib/match.ts'
import { run as runQuality } from '../../lib/quality.ts'
import { useApp } from '../../store/index.ts'
import MapCanvas from './MapCanvas.tsx'
import { loadDemo } from './loadDemo.ts'
import { openAlliance } from './openAlliance.ts'

type View = 'filas' | 'personas'

const NOMBRE: { [cve: string]: string } = {
  '01': 'Aguascalientes', '02': 'Baja California', '03': 'Baja California Sur', '04': 'Campeche', '05': 'Coahuila', '06': 'Colima',
  '07': 'Chiapas', '08': 'Chihuahua', '09': 'Ciudad de México', '10': 'Durango', '11': 'Guanajuato', '12': 'Guerrero', '13': 'Hidalgo',
  '14': 'Jalisco', '15': 'Estado de México', '16': 'Michoacán', '17': 'Morelos', '18': 'Nayarit', '19': 'Nuevo León', '20': 'Oaxaca',
  '21': 'Puebla', '22': 'Querétaro', '23': 'Quintana Roo', '24': 'San Luis Potosí', '25': 'Sinaloa', '26': 'Sonora', '27': 'Tabasco',
  '28': 'Tamaulipas', '29': 'Tlaxcala', '30': 'Veracruz', '31': 'Yucatán', '32': 'Zacatecas',
}

const fmtFecha = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })

export default function MapView() {
  const { records, pairs: storedPairs, alliances, mappings, files, set } = useApp()
  const [view, setView] = useState<View>('personas')
  const [failed, setFailed] = useState(false)
  const [engine, setEngine] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const pairs = useMemo(() => (storedPairs.length ? storedPairs : candidates(records)), [storedPairs, records])
  const people = useMemo(() => persons(records, pairs), [records, pairs])
  const fechaCorte = files[0]?.periodo.hasta ?? '2026-09-30'
  const ind = useMemo(() => compute({ records, pairs, fecha_corte: fechaCorte }), [records, pairs, fechaCorte])
  const agg = useMemo(() => aggregateByState(records, view === 'personas' ? people : undefined), [records, people, view])
  const alertas = useMemo(() => runQuality(records, mappings).length, [records, mappings])

  const counts = useMemo(() => Object.fromEntries(agg.map((s) => [s.cve_ent, view === 'personas' ? s.personas : s.filas])), [agg, view])
  const max = useMemo(() => Math.max(0, ...aggregateByState(records).map((s) => s.filas)), [records])
  const values = Object.values(counts)
  const minShown = values.length ? Math.min(...values) : 0

  const get = (id: string) => ind.find((i) => i.id === id)
  const personasInd = get('personas_unicas')
  const pv = personasInd?.valor
  const heroValue = pv == null ? '—' : typeof pv === 'number' ? String(pv) : pv.min === pv.max ? String(pv.max) : `${pv.min} a ${pv.max}`
  const heroLabel = personasInd?.estado === 'validado' ? 'personas únicas: validado' : 'personas únicas: estimado, no oficial'
  const pendientes = pairs.filter((p) => p.verdict === 'pendiente').length
  const fuente = (id: string) => (get(id)?.fuentes ?? []).map((f) => files.find((x) => x.id === f)?.nombre ?? f).join(', ') || 'archivos cargados'

  if (!records.length) {
    return (
      <PageLayout recipe="map">
        <div className="ui-hero">
          <EmptyState
            text={error || 'Aún no hay datos. Carga tus archivos en el paso 1, o usa los datos de demostración.'}
            action={
              <Button
                variant="primary"
                disabled={loading}
                onClick={async () => {
                  setLoading(true)
                  setError('')
                  try { set(await loadDemo()) } catch { setError('No se pudieron leer los datos de demostración.') } finally { setLoading(false) }
                }}
              >
                {loading ? 'Cargando…' : 'Usar datos de demostración'}
              </Button>
            }
          />
        </div>
        <aside className="ui-panel" />
      </PageLayout>
    )
  }

  return (
    <PageLayout recipe="map">
      <div className="ui-hero">
        {failed ? (
          <EmptyState text="El mapa necesita WebGL. Abre esta página en otro navegador; los indicadores siguen a la derecha." />
        ) : (
          <MapCanvas counts={counts} max={max} alliances={alliances} onSelectAlliance={openAlliance} onFail={() => setFailed(true)} onEngine={setEngine} />
        )}
        <div style={{ position: 'absolute', top: 'var(--s-4)', left: 'var(--s-4)', display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
          <Chip tone="ink">LÁMINA 02 · MÉXICO</Chip>
          <SimBadge label="DATOS SINTÉTICOS" />
        </div>
        <div style={{ position: 'absolute', left: 'var(--s-4)', bottom: 'var(--s-4)' }}>
          <Legend
            title={view === 'personas' ? 'Altura y color = personas por estado' : 'Altura y color = filas por estado'}
            min={String(minShown)}
            max={String(max)}
            items={alliances.length ? [{ label: `Alianza (${alliances.length})` }] : undefined}
          />
        </div>
        {engine && (
          <span className="ui-note" style={{ position: 'absolute', right: 'var(--s-3)', bottom: 'var(--s-2)' }}>
            {engine} · estados: GeoJSON sin verificar licencia
          </span>
        )}
      </div>
      <aside className="ui-panel">
        <div>
          <h1 style={{ fontSize: 'var(--t-28)' }}>Dónde está el impacto</h1>
          <p className="ui-note">
            Corte: {fmtFecha(fechaCorte)} · {new Set(records.map((r) => r.source_file_id)).size} programas · {agg.length} estados
          </p>
        </div>
        <Stat
          size="hero"
          value={heroValue}
          label={heroLabel}
          source={`${personasInd?.denominador ?? ''}; ${pendientes} coincidencias por decidir · regla ${personasInd?.regla_version ?? ''}`}
        />
        <div className="ui-stat-row">
          <Stat value={String(get('atenciones')?.valor ?? 0)} label="atenciones" source={fuente('atenciones')} />
          <Stat value={String(get('participaciones')?.valor ?? 0)} label="participaciones" source={fuente('participaciones')} />
        </div>
        <Segmented<View>
          label="Qué cuenta el mapa"
          value={view}
          onChange={setView}
          options={[
            { id: 'filas', label: 'Filas crudas' },
            { id: 'personas', label: 'Personas (vínculos confirmados)' },
          ]}
        />
        <div>
          <SectionHeader title="Por estado" meta={view === 'personas' ? 'personas' : 'filas, no personas'} />
          <ul className="ui-rows">
            {[...agg]
              .sort((a, b) => (counts[b.cve_ent] ?? 0) - (counts[a.cve_ent] ?? 0))
              .map((s) => (
                <Row key={s.cve_ent} lead={<Light tone="ok" />} title={NOMBRE[s.cve_ent] ?? s.cve_ent} end={<strong>{counts[s.cve_ent]}</strong>} />
              ))}
          </ul>
        </div>
        {alertas > 0 && <p className="ui-note">{alertas} alertas de calidad por revisar en el paso 3.</p>}
      </aside>
    </PageLayout>
  )
}
