import type { ColumnMapping } from '../schemas/index.ts'
import { resolve, run } from './quality.ts'
import { generateDemo } from "./demo/generate.ts"
import type { Record } from "../schemas/index.ts"

const CVE: { [e: string]: string } = { Jalisco: "14", Colima: "06", "Michoacán": "16", Nayarit: "18", Veracruz: "30" }
/** The demo files as schema Records (same shape mapping.apply produces), record_id = Folio. */
function demoRecords(): Record[] {
  const d = generateDemo()
  const j = d.jornadas.map((r): Record => ({ record_id: r.Folio, source_file_id: "jornadas", nombre: r.Nombre, ap1: r["Apellido paterno"], ap2: r["Apellido materno"],
    fecha_nac: r["Fecha nacimiento"], tel: r.Telefono, estado: CVE[r.Estado], municipio: r.Municipio, localidad: r.Localidad,
    fecha_servicio: r["Fecha atencion"], tipo: "atencion", servicio: r.Servicio }))
  const s = d.salud.map((r): Record => ({ record_id: r.Folio, source_file_id: "salud", nombre: r.Nombre, ap1: r["Apellido 1"], ap2: r["Apellido 2"],
    fecha_nac: r["Fecha de nacimiento"], tel: r.Telefono, estado: CVE[r.Estado], municipio: r.mpio, localidad: r.Localidad,
    fecha_servicio: r["Fecha taller"], tipo: "participacion", servicio: r.Taller }))
  return [...j, ...s]
}

const mappings: ColumnMapping[] = [
  { source_file_id: 'jornadas', source_col: 'Municipio', target_field: 'municipio', confidence: 1, confirmed_by: 'Laura' },
  { source_file_id: 'salud', source_col: 'mpio', target_field: 'municipio', confidence: 1, confirmed_by: 'Laura' },
]

describe('quality.run (IDEA.md §4 step 3)', () => {
  it('finds_the_14_seeded_quality_alerts', () => {
    const issues = run(demoRecords(), mappings)
    const by = (rule: string) => issues.filter((i) => i.rule_id === rule).length
    expect(by('localidad_requerida')).toBe(6)
    expect(by('fecha_nac_formato')).toBe(3)
    expect(by('telefono_formato')).toBe(2)
    expect(by('fuera_de_periodo')).toBe(1)
    expect(by('columna_ambigua')).toBe(2)
    expect(issues).toHaveLength(14)
    expect(issues.every((i) => i.resolution === 'pendiente')).toBe(true)
  })

  it('logs_every_manual_adjustment_with_reason', () => {
    const [issue] = run(demoRecords(), mappings)
    expect(() => resolve(issue, 'aceptada', '', 'Laura')).toThrow()
    const out = resolve(issue, 'aceptada', 'La localidad se confirmó por teléfono', 'Laura')
    expect(out.issue.resolution).toBe('aceptada')
    expect(out.issue.reason).toBe('La localidad se confirmó por teléfono')
    expect(out.audit).toHaveLength(1)
    expect(out.audit[0]).toMatchObject({ user: 'Laura', action: 'quality.aceptada', reason: 'La localidad se confirmó por teléfono' })
  })
})
