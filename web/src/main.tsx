import { StrictMode, type ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import UploadView from './features/upload/index.tsx'

// The shell (App.tsx) and the tokens (index.css) belong to HR-002 (design lock).
// Until they land, the app renders the upload placeholder, so either order of merges builds.
import.meta.glob('./index.css', { eager: true })
const shell = import.meta.glob<{ default: ComponentType }>('./App.tsx', { eager: true })
const App = Object.values(shell)[0]?.default ?? UploadView

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
