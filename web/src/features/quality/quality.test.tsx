import { fireEvent, render, screen, within } from '@testing-library/react'
import QualityView from './index.tsx'
import { demoState } from './demoState.ts'
import { useApp } from '../../store/index.ts'

describe('quality view (IDEA.md §4 step 3)', () => {
  beforeEach(async () => {
    useApp.getState().reset()
    useApp.getState().set(await demoState())
  })

  it('quality_view_requires_a_reason_to_accept', () => {
    render(<QualityView />)
    const rows = screen.queryAllByRole('listitem')
    expect(rows.length).toBeGreaterThan(0)
    const pending = useApp.getState().issues.filter((i) => i.resolution === 'pendiente').length
    expect(pending).toBeGreaterThanOrEqual(12)

    const row = rows[0]
    fireEvent.click(within(row).getByRole('button', { name: 'Aceptar' }))
    const save = within(row).getByRole('button', { name: 'Guardar' })
    expect(save).toBeDisabled()
    fireEvent.click(save)
    expect(useApp.getState().audit).toHaveLength(0)
    expect(useApp.getState().issues.filter((i) => i.resolution === 'pendiente')).toHaveLength(pending)

    fireEvent.change(within(row).getByLabelText('Motivo'), { target: { value: 'Verificado por teléfono con la coordinadora' } })
    expect(save).toBeEnabled()
    fireEvent.click(save)
    const s = useApp.getState()
    expect(s.issues.filter((i) => i.resolution === 'pendiente')).toHaveLength(pending - 1)
    expect(s.issues.filter((i) => i.resolution === 'aceptada')).toHaveLength(1)
    expect(s.audit).toHaveLength(1)
    expect(s.audit[0]).toMatchObject({ user: 'coordinacion', action: 'quality.aceptada', reason: 'Verificado por teléfono con la coordinadora' })
  })

  it('excluding_a_record_removes_it_from_the_counts', () => {
    render(<QualityView />)
    const before = useApp.getState().records.length
    const row = screen.getAllByRole('listitem')[0]
    fireEvent.click(within(row).getByRole('button', { name: 'Excluir' }))
    fireEvent.change(within(row).getByLabelText('Motivo'), { target: { value: 'Registro de prueba' } })
    fireEvent.click(within(row).getByRole('button', { name: 'Guardar' }))
    const s = useApp.getState()
    expect(s.records).toHaveLength(before - 1)
    expect(s.audit[0]).toMatchObject({ action: 'quality.excluida', reason: 'Registro de prueba' })
  })

  it('asks_for_files_when_nothing_is_loaded', () => {
    useApp.getState().reset()
    render(<QualityView />)
    expect(screen.queryByText('Primero carga tus archivos.')).toBeInTheDocument()
  })
})
