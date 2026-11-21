// Shell · owned by the design lock (HR-002). Every feature renders inside AppShell; views never build a header or nav.
import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react'
import LandingView from './features/landing/index.tsx'
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
  // Brand in the browser tab (index.html belongs to the scaffold task, so the shell sets it).
  useEffect(() => {
    document.title = 'Huella Rosa · EIRA'
    const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]') ?? document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'icon' }))
    icon.type = 'image/svg+xml'
    icon.setAttribute('href', '/brand/huella-rosa-mark.svg')
  }, [])
  // The bare URL opens the landing (home); a tab, ?tab= or ?lock= opens the app.
  const [home, setHome] = useState(!params.has('tab') && !params.has('lock'))
  const open = (id: string) => {
    setTab(id)
    setHome(false)
    window.scrollTo?.(0, 0)
  }
  // A screen moves the flow forward with: window.dispatchEvent(new CustomEvent('huella:tab', { detail: 'mapa' }))
  useEffect(() => {
    const go = (e: Event) => {
      const id = (e as CustomEvent<string>).detail
      if (!TABS.some((t) => t.id === id)) return
      open(id)
    }
    window.addEventListener('huella:tab', go)
    return () => window.removeEventListener('huella:tab', go)
  }, [])
  const rol = useApp((s) => s.rol)
  const setRol = useApp((s) => s.setRol)
  const View = home ? LandingView : (params.has('lock') && LOCKED[tab]) || TABS.find((t) => t.id === tab)!.View

  return (
    <AppShell
      nav={
        <NavBar
          items={TABS}
          current={home ? '' : tab}
          onSelect={open}
          onHome={() => (setHome(true), window.scrollTo?.(0, 0))}
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
