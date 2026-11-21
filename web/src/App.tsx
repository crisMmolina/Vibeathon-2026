// Shell · owned by the design lock (HR-002). Every feature renders inside AppShell; views never build a header or nav.
import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react'
import UploadView from './features/upload/index.tsx'
import MapView from './features/map/index.tsx'
import QualityView from './features/quality/index.tsx'
import MatchesView from './features/matches/index.tsx'
import AlliancesView from './features/alliances/index.tsx'
import ReportView from './features/report/index.tsx'
import { AppShell, NavBar, SimBadge } from './lib/ui/index.tsx'
import { useApp, type Rol } from './store/index.ts'

const TABS: { id: string; label: string; View: ComponentType }[] = [
  { id: 'carga', label: 'Carga', View: UploadView },
  { id: 'mapa', label: 'Mapa', View: MapView },
  { id: 'calidad', label: 'Calidad', View: QualityView },
  { id: 'coincidencias', label: 'Coincidencias', View: MatchesView },
  { id: 'alianzas', label: 'Alianzas', View: AlliancesView },
  { id: 'informe', label: 'Informe', View: ReportView },
]

// ?lock=1 shows the three locked reference screens of web/DESIGN.md in place of the features (design review only).
const LOCKED: Record<string, ComponentType> = {
  carga: lazy(() => import('./lib/ui/locked/FlowLock.tsx')),
  mapa: lazy(() => import('./lib/ui/locked/MapLock.tsx')),
  calidad: lazy(() => import('./lib/ui/locked/ListLock.tsx')),
}

export default function App() {
  const params = new URLSearchParams(location.search)
  const [tab, setTab] = useState(TABS.some((t) => t.id === params.get('tab')) ? params.get('tab')! : 'carga')
  // A screen moves the flow forward with: window.dispatchEvent(new CustomEvent('huella:tab', { detail: 'mapa' }))
  useEffect(() => {
    const go = (e: Event) => {
      const id = (e as CustomEvent<string>).detail
      if (!TABS.some((t) => t.id === id)) return
      setTab(id)
      window.scrollTo?.(0, 0)
    }
    window.addEventListener('huella:tab', go)
    return () => window.removeEventListener('huella:tab', go)
  }, [])
  const rol = useApp((s) => s.rol)
  const setRol = useApp((s) => s.setRol)
  const View = (params.has('lock') && LOCKED[tab]) || TABS.find((t) => t.id === tab)!.View

  return (
    <AppShell
      nav={
        <NavBar
          items={TABS}
          current={tab}
          onSelect={setTab}
          end={
            <>
              <select className="ui-btn" data-size="sm" aria-label="Actuar como" value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
                <option value="coordinacion">Coordinación</option>
                <option value="capturista">Capturista</option>
              </select>
              <SimBadge />
            </>
          }
        />
      }
    >
      <Suspense fallback={<div className="ui-skeleton" style={{ margin: 'var(--s-6)', height: 240 }} />}>
        <View />
      </Suspense>
    </AppShell>
  )
}
