import type { Alliance, TargetField } from '../../schemas/index.ts'
import type { ParsedFile } from '../../lib/ingest.ts'

export const FIELD_LABEL: { [f in TargetField]: string } = {
  nombre: 'Nombre',
  ap1: 'Apellido paterno',
  ap2: 'Apellido materno',
  fecha_nac: 'Fecha de nacimiento',
  tel: 'Teléfono',
  curp: 'CURP',
  estado: 'Estado',
  municipio: 'Municipio',
  localidad: 'Localidad',
  cve_loc_inegi: 'Clave de localidad INEGI',
  fecha_servicio: 'Fecha del servicio',
  servicio: 'Servicio',
  ignorar: 'No usar',
}

export const FIELD_ORDER = Object.keys(FIELD_LABEL) as TargetField[]

export const pct = (confidence: number) => `${Math.round(confidence * 100)} %`

const TIPOS: Alliance['tipo'][] = ['municipio', 'DIF', 'empresa', 'ONG']

/** alianzas.csv is a catalog with fixed columns, not a people file: it skips the column mapping. */
export function toAlliances(p: ParsedFile): Alliance[] {
  return p.rows.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    tipo: TIPOS.find((t) => t.toLowerCase() === r.tipo.toLowerCase()) ?? 'ONG',
    estado: r.estado,
    municipio: r.municipio,
    lat: Number(r.lat),
    lng: Number(r.lng),
    jornadas: r.jornadas.split(/[|;]/).map((j) => j.trim()).filter(Boolean),
  }))
}
