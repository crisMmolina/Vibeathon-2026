import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen } from '@testing-library/react'
import { parseFile } from '../../lib/ingest.ts'
import { apply, suggest } from '../../lib/mapping.ts'
import { useApp } from '../../store/index.ts'
import { pickEngine } from './engine.ts'
import MapView from './index.tsx'

vi.mock('./MapCanvas.tsx', () => ({ default: () => <div data-testid="map-canvas" /> }))

const demo = async (name: string) => {
  const b = readFileSync(resolve(process.cwd(), 'public/demo_data', name))
  const p = await parseFile(name, b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer)
  return apply(p, suggest(p.file.id, p.columns, p.rows))
}

describe('MapView (IDEA.md §4 step 2)', () => {
  it('map_view_shows_kpis_for_the_demo_records', async () => {
    const records = [...(await demo('jornadas_tamizaje.csv')), ...(await demo('salud_que_florece.xlsx'))]
    useApp.getState().set({ records })
    render(<MapView />)
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('80')).toBeInTheDocument()
    expect(screen.getByText(/a 200$/)).toBeInTheDocument()
    expect(screen.getByText(/estimado, no oficial/)).toBeInTheDocument()
    expect(screen.getByText('Jalisco')).toBeInTheDocument()
    expect(screen.getByTestId('map-canvas')).toBeInTheDocument()
  })

  it('falls_back_to_maplibre_without_token', () => {
    expect(pickEngine(undefined)).toBe('maplibre')
    expect(pickEngine('')).toBe('maplibre')
    expect(pickEngine('sk.secret')).toBe('maplibre')
    expect(pickEngine('pk.eyJ1Ijoi')).toBe('mapbox')
  })
})
