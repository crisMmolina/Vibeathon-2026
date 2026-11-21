import { act, render, screen } from '@testing-library/react'
import App from '../../App.tsx'

vi.mock('../../features/map/index.tsx', () => ({ default: () => null }))

describe('shell (HR-013)', () => {
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
