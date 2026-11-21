// Contract for every module (IDEA.md §6). Identity fields live only in memory.

export type Programa = 'tamizaje_rosa' | 'salud_que_florece'
export type TipoRegistro = 'atencion' | 'participacion'

export interface SourceFile {
  id: string
  nombre: string
  programa: Programa | 'alianzas'
  periodo: { desde: string; hasta: string }
  filas: number
  hash: string
  fecha_carga: string
}

/** Fields of the common model a source column can map to. */
export type TargetField =
  | 'nombre' | 'ap1' | 'ap2' | 'fecha_nac' | 'tel' | 'curp'
  | 'estado' | 'municipio' | 'localidad' | 'cve_loc_inegi'
  | 'fecha_servicio' | 'servicio' | 'ignorar'

export interface ColumnMapping {
  source_file_id: string
  source_col: string
  target_field: TargetField
  confidence: number // 0..1
  confirmed_by: string | null
}

export interface Record {
  record_id: string
  source_file_id: string
  nombre: string
  ap1: string
  ap2: string
  fecha_nac: string // ISO yyyy-mm-dd, or the raw invalid string
  tel: string
  curp?: string
  estado: string // cve_ent, two digits ("14" Jalisco)
  municipio: string
  localidad: string
  cve_loc_inegi?: string
  fecha_servicio: string
  tipo: TipoRegistro
  servicio: string
}

export interface Person {
  person_id: string
  record_ids: string[]
  status: 'estimada' | 'validada'
}

export type Severity = 'rojo' | 'ambar' | 'verde'

export interface QualityIssue {
  record_id: string
  rule_id: string
  severity: Severity
  resolution: 'pendiente' | 'corregida' | 'excluida' | 'aceptada'
  reason: string | null
  user: string | null
  ts: string | null
}

export type Verdict = 'pendiente' | 'misma' | 'distinta'

export interface MatchPair {
  pair_id: string
  a_id: string
  b_id: string
  score: number
  reasons: string[]
  verdict: Verdict
  user: string | null
  ts: string | null
}

export interface Alliance {
  id: string
  nombre: string
  tipo: 'municipio' | 'DIF' | 'empresa' | 'ONG'
  estado: string
  municipio: string
  lat: number
  lng: number
  jornadas: string[]
}

export interface AuditEntry {
  ts: string
  user: string
  action: string
  entity: string
  before: unknown
  after: unknown
  reason: string
}

export interface Indicator {
  id: string
  nombre: string
  valor: number | { min: number; max: number }
  denominador: string
  fecha_corte: string
  fuentes: string[]
  regla_version: string
  estado: 'estimado' | 'validado'
}

/** Known truth of the synthetic dataset (demo_data/truth.json). */
export interface DemoTruth {
  demo_data: true
  /** Pairs [jornadas row id, salud row id] that are the same woman. */
  links: [string, string][]
  /** Pairs that look alike but are different women. */
  homonyms: [string, string][]
  /** Pairs inside jornadas of the 10 women with a second atención. */
  repeats: [string, string][]
  unique_people: number
}
