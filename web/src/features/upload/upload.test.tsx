import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fireEvent, render, screen } from '@testing-library/react'
import UploadView from './index.tsx'
import { useApp } from '../../store/index.ts'

// Fake for the app's own static assets (web/public/demo_data): same bytes the browser would get.
const demoFetch = async (url: string) => {
  const b = readFileSync(resolve(process.cwd(), 'public', String(url).replace(/^\//, '')))
  return { ok: true, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) }
}

describe('upload (IDEA.md §4 step 1)', () => {
  beforeEach(() => {
    useApp.getState().reset()
    vi.stubGlobal('fetch', vi.fn(demoFetch))
  })
  afterEach(() => vi.unstubAllGlobals())

  it('demo_button_loads_the_three_demo_files', async () => {
    render(<UploadView />)
    const demo = screen.queryByRole('button', { name: 'Usar datos de demostración' })
    expect(demo).toBeInTheDocument()
    fireEvent.click(demo!)
    expect(await screen.findByText('jornadas_tamizaje.csv · 120 filas')).toBeInTheDocument()
    expect(screen.getByText('salud_que_florece.xlsx · 80 filas')).toBeInTheDocument()
    expect(screen.getByText('alianzas.csv · 8 alianzas')).toBeInTheDocument()
    // Municipio (file 1) and mpio (file 2) both land on the same common-model field
    expect(screen.getByLabelText('Campo para Municipio (jornadas_tamizaje.csv)')).toHaveValue('municipio')
    expect(screen.getByLabelText('Campo para mpio (salud_que_florece.xlsx)')).toHaveValue('municipio')
    expect(useApp.getState().records).toHaveLength(0)
  })

  it('confirm_mapping_stores_records_in_the_store', async () => {
    render(<UploadView />)
    const demo = screen.queryByRole('button', { name: 'Usar datos de demostración' })
    expect(demo).toBeInTheDocument()
    fireEvent.click(demo!)
    fireEvent.click(await screen.findByRole('button', { name: 'Confirmar mapeo' }))
    const s = useApp.getState()
    expect(s.records).toHaveLength(200)
    expect(s.records.filter((r) => r.tipo === 'atencion')).toHaveLength(120)
    expect(s.alliances).toHaveLength(8)
    expect(s.files).toHaveLength(3)
    expect(s.mappings.length).toBeGreaterThan(0)
    expect(s.mappings.every((m) => m.confirmed_by === 'coordinacion')).toBe(true)
    expect(await screen.findByText(/200 registros listos/)).toBeInTheDocument()
  })

  it('shows_an_error_when_a_file_cannot_be_read', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, arrayBuffer: async () => new ArrayBuffer(0) })))
    render(<UploadView />)
    const demo = screen.queryByRole('button', { name: 'Usar datos de demostración' })
    expect(demo).toBeInTheDocument()
    fireEvent.click(demo!)
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos leer')
    expect(useApp.getState().records).toHaveLength(0)
  })
})
