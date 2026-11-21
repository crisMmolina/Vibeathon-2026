import { fireEvent, render, screen } from '@testing-library/react'
import MatchesView from './index.tsx'
import { demoState } from '../quality/demoState.ts'
import { compute } from '../../lib/indicators.ts'
import { useApp } from '../../store/index.ts'

const unique = () => {
  const { records, pairs } = useApp.getState()
  return compute({ records, pairs, fecha_corte: '2026-09-30' }).find((i) => i.id === 'personas_unicas')!.valor as { min: number; max: number }
}

describe('matches view (IDEA.md §4 step 4)', () => {
  beforeEach(async () => {
    useApp.getState().reset()
    useApp.getState().set(await demoState())
  })

  it('confirming_a_pair_lowers_unique_people', () => {
    render(<MatchesView />)
    const same = screen.queryByRole('button', { name: 'Es la misma persona' })
    expect(same).toBeInTheDocument()
    expect(useApp.getState().pairs.length).toBeGreaterThanOrEqual(28)
    expect(unique().max).toBe(200)
    expect(screen.getByText(/a 200$/)).toBeInTheDocument()

    fireEvent.click(same!)
    const s = useApp.getState()
    expect(s.pairs.filter((p) => p.verdict === 'misma')).toHaveLength(1)
    expect(unique().max).toBe(199)
    expect(screen.getByText(/a 199$/)).toBeInTheDocument()
    expect(s.audit[0]).toMatchObject({ user: 'coordinacion', action: 'match.misma' })
  })

  it('different_people_keeps_the_count_and_logs_the_decision', () => {
    render(<MatchesView />)
    const different = screen.queryByRole('button', { name: 'Son distintas' })
    expect(different).toBeInTheDocument()
    fireEvent.click(different!)
    expect(unique().max).toBe(200)
    expect(useApp.getState().audit[0]).toMatchObject({ action: 'match.distinta' })
  })

  it('masks_identity_and_blocks_decisions_for_a_non_validator', () => {
    useApp.getState().setRol('capturista')
    render(<MatchesView />)
    const same = screen.queryByRole('button', { name: 'Es la misma persona' })
    expect(same).toBeInTheDocument()
    expect(same).toBeDisabled()
    const first = useApp.getState().records.find((r) => r.record_id === useApp.getState().pairs[0].a_id)!
    expect(screen.queryByText(new RegExp(`${first.nombre} ${first.ap1}`))).not.toBeInTheDocument()
  })
})
