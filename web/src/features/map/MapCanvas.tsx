// The 3D map: states extrude by count (fill-extrusion). When the count drops (a confirmed duplicate),
// heights animate down so the double count is seen disappearing. Respects prefers-reduced-motion.
import { useEffect, useRef, useState } from 'react'
import type { Alliance } from '../../schemas/index.ts'
import { cssVar } from '../../lib/ui/index.tsx'
import { ESTADOS_GEOJSON_URL } from '../../lib/geo.ts'
import { ENGINE_LABEL, pickEngine, type Engine } from './engine.ts'

export interface MapCanvasProps {
  counts: { [cve_ent: string]: number }
  max: number
  alliances: Alliance[]
  onSelectAlliance?: (id: string) => void
  onFail: () => void
  onEngine: (label: string) => void
}

const METERS_AT_MAX = 230_000
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeoJSON = { type: 'FeatureCollection'; features: { properties: { [k: string]: any } }[] }

export default function MapCanvas({ counts, max, alliances, onSelectAlliance, onFail, onEngine }: MapCanvasProps) {
  const box = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)
  const geoRef = useRef<GeoJSON | null>(null)
  const shown = useRef<{ [cve: string]: number }>({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any
    let gone = false
    ;(async () => {
      const geo: GeoJSON = await fetch(ESTADOS_GEOJSON_URL).then((r) => r.json())
            geoRef.current = geo
      const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined
      const engine: Engine = pickEngine(token)
      const view = { container: box.current!, center: [-101.6, 21.6] as [number, number], zoom: 4.6, pitch: 50, bearing: -8, attributionControl: false }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let gl: any
      if (engine === 'mapbox') {
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
      mapRef.current = map
      onEngine(ENGINE_LABEL[engine])
      map.on('load', () => {
        map.addSource('estados', { type: 'geojson', data: geo, promoteId: 'cve_ent' })
        map.addLayer({
          id: 'estados-3d',
          type: 'fill-extrusion',
          source: 'estados',
          paint: {
            'fill-extrusion-color': ['interpolate', ['linear'], ['coalesce', ['feature-state', 't'], 0], 0, cssVar('--bg'), 0.01, cssVar('--rose-pale'), 0.4, cssVar('--rose'), 0.75, cssVar('--rose-deep'), 1, cssVar('--accent')],
            'fill-extrusion-height': ['coalesce', ['feature-state', 'h'], 0],
            'fill-extrusion-opacity': 0.94,
          },
        })
        map.addLayer({ id: 'estados-linea', type: 'line', source: 'estados', paint: { 'line-color': cssVar('--rose'), 'line-width': 0.6 } })
        for (const a of alliances) {
          const el = document.createElement('button')
          el.className = 'ui-dot'
          el.title = a.nombre
          el.setAttribute('aria-label', `Alianza: ${a.nombre}`)
          el.style.cursor = 'pointer'
          el.addEventListener('click', () => onSelectAlliance?.(a.id))
          const pink = cssVar('--rose-deep') // token, with alpha appended for the pulse ring
          if (!reduced()) el.animate([{ boxShadow: `0 0 0 0 ${pink}8c` }, { boxShadow: `0 0 0 12px ${pink}00` }], { duration: 1600, iterations: Infinity })
          new gl.Marker({ element: el }).setLngLat([a.lng, a.lat]).addTo(map)
        }
        setReady(true)
      })
    })().catch(onFail)
    return () => {
      gone = true
      map?.remove()
      mapRef.current = null
    }
    // the map is created once; data updates go through the effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Data → heights. The first rise is staggered; later changes (deduplication) animate down live.
  useEffect(() => {
    const map = mapRef.current, geo = geoRef.current
    if (!ready || !map || !geo) return
    const from = { ...shown.current }
    const first = Object.keys(from).length === 0
    const dur = reduced() ? 0 : first ? 1400 : 900
    const start = performance.now()
    let raf = 0
    const frame = (now: number) => {
      const p = dur ? Math.min(1, (now - start) / dur) : 1
      for (const f of geo.features) {
        const cve = f.properties.cve_ent as string
        const target = counts[cve] ?? 0
        const delay = first ? (Number(cve) % 8) * 0.06 : 0
        const q = Math.max(0, Math.min(1, (p - delay) / (1 - delay)))
        const e = 1 - Math.pow(1 - q, 3)
        const v = (from[cve] ?? 0) + (target - (from[cve] ?? 0)) * e
        map.setFeatureState({ source: 'estados', id: cve }, { t: max > 0 ? v / max : 0, h: max > 0 ? (v / max) * METERS_AT_MAX : 0 })
        if (p === 1) shown.current[cve] = target
      }
      if (p < 1) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [counts, max, ready])

  return <div ref={box} style={{ position: 'absolute', inset: 0 }} aria-label="Mapa de México: cada estado se eleva según el número de personas" />
}
