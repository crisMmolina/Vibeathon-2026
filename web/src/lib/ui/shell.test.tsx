import { act, render, screen } from '@testing-library/react'
import App from '../../App.tsx'

vi.mock('../../features/map/index.tsx', () => ({ default: () => null }))

describe('shell (HR-013)', () => {
  // Since HR-015 the bare URL opens the landing; these tests cover the app opened on a step.
  beforeEach(() => window.history.replaceState({}, '', '/?tab=carga'))
  it('moves_to_the_tab_named_by_a_huella_tab_event', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /Carga/ })).toHaveAttribute('aria-current', 'page')
    act(() => void window.dispatchEvent(new CustomEvent('huella:tab', { detail: 'mapa' })))
    expect(screen.getByRole('button', { name: /Mapa/ })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: /Carga/ })).not.toHaveAttribute('aria-current')
  })

  it('ignores_a_huella_tab_event_for_an_unknown_tab', () => {
    render(<App />)
    act(() => void window.dispatchEvent(new CustomEvent('huella:tab', { detail: 'no-existe' })))
    expect(screen.getByRole('button', { name: /Carga/ })).toHaveAttribute('aria-current', 'page')
  })
})

describe('shell home (HR-015)', () => {
  beforeEach(() => window.history.replaceState({}, '', '/'))
  it('opens_on_the_landing_with_no_tab_highlighted', () => {
    const { container } = render(<App />)
    expect(container.querySelector('[data-feature="landing"]')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Carga/ })).not.toHaveAttribute('aria-current')
  })

  it('leaves_the_landing_on_a_huella_tab_event_and_returns_with_the_brand', () => {
    const { container } = render(<App />)
    act(() => void window.dispatchEvent(new CustomEvent('huella:tab', { detail: 'carga' })))
    expect(container.querySelector('[data-feature="landing"]')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Carga/ })).toHaveAttribute('aria-current', 'page')
    act(() => screen.getByRole('link', { name: /inicio/ }).click())
    expect(container.querySelector('[data-feature="landing"]')).toBeInTheDocument()
  })
})

describe('shell brand (HR-019)', () => {
  beforeEach(() => window.history.replaceState({}, '', '/'))

  it('shows_the_huella_rosa_mark_next_to_the_eira_logo', () => {
    render(<App />)
    const home = screen.getByRole('link', { name: /inicio/ })
    expect(home.querySelector('svg[aria-label="EIRA"]')).toBeInTheDocument()
    expect(home.querySelector('svg[aria-label="Huella Rosa"]')).toBeInTheDocument()
  })

  it('sets_the_favicon_and_the_title_of_the_product', () => {
    render(<App />)
    expect(document.querySelector('link[rel="icon"]')).toHaveAttribute('href', '/brand/huella-rosa-mark.svg')
    expect(document.title).toBe('Huella Rosa · EIRA')
  })
})
