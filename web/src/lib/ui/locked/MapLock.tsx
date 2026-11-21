// Locked screen · recipe "map + panel" (the wow). Feature screens copy this layout; the real map is HR-004.
// Numbers are the raw rows per state of the synthetic demo files (web/public/demo_data), not people.
import { useEffect, useRef, useState } from 'react'
import { Button, Chip, cssVar, EmptyState, Legend, Light, PageLayout, Row, SectionHeader, Segmented, SimBadge, Stat } from '../index.tsx'

const ROWS: Record<string, number> = { Jalisco: 57, Michoacán: 46, Nayarit: 40, Veracruz: 33, Colima: 24 }
const ALLIANCES: [number, number, string][] = [
  [-103.3918, 20.7214, 'Municipio de Zapopan'],
  [-103.4469, 20.4736, 'DIF Tlajomulco'],
  [-105.2253, 20.6534, 'Textiles Ejemplo S.A. de C.V.'],
  [-103.725, 19.2433, 'DIF Estatal Colima'],
  [-101.1944, 19.705, 'Municipio de Morelia'],
  [-102.05, 19.4167, 'DIF Uruapan'],
  [-104.8946, 21.5042, 'Municipio de Tepic'],
  [-96.9102, 19.5438, 'Fundación Ejemplo Veracruz'],
]
const METERS_PER_ROW = 4000

type View = 'filas' | 'personas'

export default function MapLock() {
  const box = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<View>('filas')
  const [failed, setFailed] = useState(false)
  const [engine, setEngine] = useState('')

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any
    let gone = false
    ;(async () => {
      const geo = await fetch('/design-lock/geo/mx-states.json').then((r) => r.json())
      for (const f of geo.features) f.properties.n = ROWS[f.properties.name] ?? 0
      const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined
      const view = { container: box.current!, center: [-101.6, 21.4] as [number, number], zoom: 4.7, pitch: 50, bearing: -8, attributionControl: false }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let gl: any
      if (token) {
        gl = (await import('mapbox-gl')).default
        await import('mapbox-gl/dist/mapbox-gl.css')
        gl.accessToken = token
        map = new gl.Map({ ...view, style: 'mapbox://styles/mapbox/light-v11', projection: 'mercator' })
      } else {
        gl = await import('maplibre-gl')
        await import('maplibre-gl/dist/maplibre-gl.css')
        map = new gl.Map({ ...view, style: { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': cssVar('--rose-pale') } }] } })
      }
      if (gone) return map.remove()
      setEngine(token ? 'Mapbox GL' : 'MapLibre GL, sin teselas')
      map.on('load', () => {
        map.addSource('estados', { type: 'geojson', data: geo })
        map.addLayer({
          id: 'estados-3d',
          type: 'fill-extrusion',
          source: 'estados',
          paint: {
            'fill-extrusion-color': ['interpolate', ['linear'], ['get', 'n'], 0, cssVar('--bg'), 1, cssVar('--rose-pale'), 24, cssVar('--rose'), 46, cssVar('--rose-deep'), 57, cssVar('--accent')],
            'fill-extrusion-height': ['*', ['get', 'n'], METERS_PER_ROW],
            'fill-extrusion-opacity': 0.94,
          },
        })
        map.addLayer({ id: 'estados-linea', type: 'line', source: 'estados', paint: { 'line-color': cssVar('--rose'), 'line-width': 0.6 } })
        for (const [lng, lat, nombre] of ALLIANCES) {
          const el = document.createElement('span')
          el.className = 'ui-dot'
          el.title = nombre
          new gl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map)
        }
      })
    })().catch(() => setFailed(true))
    return () => {
      gone = true
      map?.remove()
    }
  }, [])

  return (
    <PageLayout recipe="map">
      <div className="ui-hero">
        {failed ? <EmptyState text="El mapa necesita WebGL. Abre esta página en otro navegador." /> : <div ref={box} style={{ position: 'absolute', inset: 0 }} aria-label="Mapa de México: los estados se elevan según el número de filas" />}
        <div style={{ position: 'absolute', top: 'var(--s-4)', left: 'var(--s-4)', display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
          <Chip tone="ink">LÁMINA 02 · MÉXICO</Chip>
          <SimBadge label="DATOS SINTÉTICOS" />
        </div>
        <div style={{ position: 'absolute', left: 'var(--s-4)', bottom: 'var(--s-4)' }}>
          <Legend title="Altura y color = filas por estado" min="24" max="57" items={[{ label: 'Alianza (8)' }]} />
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
          <p className="ui-note">Corte: 30 sep 2026 · 2 programas · 5 estados</p>
        </div>
        <Stat size="hero" value="162 a 200" label="personas únicas: estimado, no oficial" source="cota inferior 110 + 80 − 28 vínculos por confirmar; cota superior 200 filas" />
        <div className="ui-stat-row">
          <Stat value="120" label="atenciones" source="jornadas_tamizaje.csv" />
          <Stat value="80" label="participaciones" source="salud_que_florece.xlsx" />
        </div>
        <Segmented<View>
          label="Qué cuenta el mapa"
          value={view}
          onChange={setView}
          options={[
            { id: 'filas', label: 'Filas crudas' },
            { id: 'personas', label: 'Personas validadas' },
          ]}
        />
        <div>
          <SectionHeader title="Por estado" meta="filas, no personas" />
          <ul className="ui-rows">
            {Object.entries(ROWS).map(([estado, n]) => (
              <Row key={estado} lead={<Light tone="ok" />} title={estado} end={<strong>{n}</strong>} />
            ))}
          </ul>
        </div>
        <Button variant="primary">Revisar 14 alertas de calidad</Button>
      </aside>
    </PageLayout>
  )
}
