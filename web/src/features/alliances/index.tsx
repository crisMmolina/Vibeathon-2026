// Paso 5 · Alianzas (recipe "detail", hero: the alliance's unique women count). Numbers from src/lib/alliances.
import { useEffect, useMemo, useState } from 'react'
import { Button, Chip, EmptyState, Light, PageHeader, PageLayout, Plate, Row, SectionHeader, SimBadge, Stat } from '../../lib/ui/index.tsx'
import { summary } from '../../lib/alliances.ts'
import { persons } from '../../lib/indicators.ts'
import { candidates } from '../../lib/match.ts'
import { useApp } from '../../store/index.ts'
import { loadDemo } from '../map/loadDemo.ts'

const TIPO: Record<string, string> = { municipio: 'Municipio', DIF: 'DIF', empresa: 'Empresa', ONG: 'Organización civil' }

/** Another screen (the map) can open a card with: window.dispatchEvent(new CustomEvent('huella:alianza', { detail: 'AL-01' })) */
export const ALIANZA_EVENT = 'huella:alianza'

export default function AlliancesView() {
  const { records, pairs: storedPairs, alliances, set } = useApp()
  const [sel, setSel] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const open = (e: Event) => setSel((e as CustomEvent<string>).detail)
    window.addEventListener(ALIANZA_EVENT, open)
    return () => window.removeEventListener(ALIANZA_EVENT, open)
  }, [])

  const pairs = useMemo(() => (storedPairs.length ? storedPairs : candidates(records)), [storedPairs, records])
  const people = useMemo(() => persons(records, pairs), [records, pairs])
  const all = useMemo(() => alliances.map((a) => summary(a, records, people)).sort((x, y) => y.mujeres_unicas - x.mujeres_unicas), [alliances, records, people])
  const current = all.find((s) => s.alliance.id === sel) ?? all[0]
  const pendientes = pairs.some((p) => p.verdict === 'pendiente')

  const header = <PageHeader title="Alianzas" sub="Qué produjo cada alianza, contando a cada mujer una sola vez." lamina="LÁMINA 05 · ALIANZAS" />

  if (!records.length || !alliances.length) {
    return (
      <PageLayout recipe="detail">
        {header}
        <EmptyState
          text={error || 'Todavía no hay alianzas cargadas. Sube el catálogo de alianzas en el paso 1 o usa los datos de demostración.'}
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

  const maxServ = Math.max(1, ...(current?.servicios.map((s) => s.n) ?? [1]))

  return (
    <PageLayout recipe="detail">
      {header}
      <div className="ui-cols">
        {current && (
          <Plate
            head={<><Chip tone="ink">{TIPO[current.alliance.tipo] ?? current.alliance.tipo}</Chip><SimBadge label="DATOS SINTÉTICOS" /></>}
            foot={<span className="ui-note">Vinculada por jornada y municipio · {current.alliance.jornadas.length} jornadas</span>}
          >
            <div style={{ display: 'grid', gap: 'var(--s-6)', padding: 'var(--s-6)' }}>
              <div>
                <h2 style={{ fontSize: 'var(--t-28)' }}>{current.alliance.nombre}</h2>
                <p className="ui-note">{current.alliance.municipio} · jornadas: {current.alliance.jornadas.map((j) => j.replace(/^JOR-/, '').replace(/-/g, ' ').toLowerCase()).join(', ')}</p>
              </div>
              <Stat
                size="hero"
                value={String(current.mujeres_unicas)}
                label={pendientes ? 'mujeres atendidas (únicas): estimado, no oficial' : 'mujeres atendidas (únicas): validado'}
                source="registros de sus jornadas; cada mujer cuenta una vez según las coincidencias confirmadas"
              />
              <div className="ui-stat-row">
                <Stat value={String(current.atenciones)} label="atenciones" source="jornadas_tamizaje · municipios de la alianza" />
                <Stat value={String(current.participaciones)} label="participaciones" source="talleres · municipios de la alianza" />
              </div>
              <div>
                <SectionHeader title="Servicios por tipo" meta="registros, no personas" />
                <ul className="ui-rows">
                  {current.servicios.map((s) => (
                    <Row
                      key={s.servicio}
                      lead={<Light tone="ok" />}
                      title={s.servicio}
                      meta={<span aria-hidden style={{ display: 'block', height: 6, width: `${(s.n / maxServ) * 100}%`, background: 'var(--rose)', borderRadius: 3 }} />}
                      end={<strong>{s.n}</strong>}
                    />
                  ))}
                  {!current.servicios.length && <p className="ui-note">Sin registros en los municipios de esta alianza.</p>}
                </ul>
              </div>
            </div>
          </Plate>
        )}
        <section>
          <SectionHeader title="Todas las alianzas" meta={`${all.length}`} />
          <ul className="ui-rows">
            {all.map((s) => (
              <li key={s.alliance.id} style={{ listStyle: 'none' }}>
                <button
                  className="ui-row"
                  aria-pressed={s.alliance.id === current?.alliance.id}
                  onClick={() => setSel(s.alliance.id)}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 0, cursor: 'pointer', font: 'inherit', color: 'inherit' }}
                >
                  <Light tone={s.mujeres_unicas ? 'ok' : 'warn'} />
                  <div>
                    <div className="ui-row-title" style={{ fontWeight: s.alliance.id === current?.alliance.id ? 700 : undefined }}>{s.alliance.nombre}</div>
                    <div className="ui-row-meta">{TIPO[s.alliance.tipo] ?? s.alliance.tipo} · {s.alliance.municipio}</div>
                  </div>
                  <div className="ui-row-end"><strong>{s.mujeres_unicas}</strong></div>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageLayout>
  )
}
