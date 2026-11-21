// Synthetic dataset with a known truth (IDEA.md §3). demo_data: true.
// Every name is fictitious. Same seed → same files, so the demo and the tests agree.
import type { Alliance, DemoTruth } from '../../schemas/index.ts'

export type Row = { [col: string]: string }

export interface DemoDataset {
  jornadas: Row[]
  salud: Row[]
  alianzas: Alliance[]
  truth: DemoTruth
}

export const PERIODO = { desde: '2026-01-01', hasta: '2026-09-30' } as const

export interface Loc { estado: string; cve_ent: string; municipio: string; localidad: string; lada: string; jornada: string }

export function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function slug(s: string): string {
  return stripAccents(s).toUpperCase().replace(/[^A-Z]+/g, '-').replace(/^-|-$/g, '')
}

const LOCS: Loc[] = [
  ['Jalisco', '14', 'Zapopan', 'Tesistán', '33'],
  ['Jalisco', '14', 'Zapopan', 'La Venta del Astillero', '33'],
  ['Jalisco', '14', 'Tlajomulco de Zúñiga', 'San Agustín', '33'],
  ['Jalisco', '14', 'Tlajomulco de Zúñiga', 'Cajititlán', '33'],
  ['Jalisco', '14', 'Puerto Vallarta', 'Las Juntas', '322'],
  ['Jalisco', '14', 'Ameca', 'El Cabezón', '375'],
  ['Colima', '06', 'Colima', 'Los Asmoles', '312'],
  ['Colima', '06', 'Tecomán', 'Cerro de Ortega', '313'],
  ['Colima', '06', 'Manzanillo', 'El Colomo', '314'],
  ['Colima', '06', 'Villa de Álvarez', 'Joyitas', '312'],
  ['Michoacán', '16', 'Morelia', 'Tiripetío', '443'],
  ['Michoacán', '16', 'Morelia', 'Jesús del Monte', '443'],
  ['Michoacán', '16', 'Pátzcuaro', 'Tzurumútaro', '434'],
  ['Michoacán', '16', 'Uruapan', 'Angahuan', '452'],
  ['Michoacán', '16', 'Zamora', 'Ario de Rayón', '351'],
  ['Nayarit', '18', 'Tepic', 'Francisco I. Madero', '311'],
  ['Nayarit', '18', 'Tepic', 'Bellavista', '311'],
  ['Nayarit', '18', 'Bahía de Banderas', 'San Juan de Abajo', '329'],
  ['Nayarit', '18', 'Compostela', 'Las Varas', '327'],
  ['Nayarit', '18', 'Santiago Ixcuintla', 'Villa Hidalgo', '323'],
  ['Veracruz', '30', 'Xalapa', 'El Castillo', '228'],
  ['Veracruz', '30', 'Veracruz', 'Santa Fe', '229'],
  ['Veracruz', '30', 'Papantla', 'El Tajín', '784'],
  ['Veracruz', '30', 'Córdoba', 'San José de Tapia', '271'],
  ['Veracruz', '30', 'Coatzacoalcos', 'Allende', '921'],
].map(([estado, cve_ent, municipio, localidad, lada]) => ({
  estado, cve_ent, municipio, localidad, lada, jornada: 'JOR-' + slug(municipio),
}))

/** Locality catalog for the demo (25 hardcoded, demo_data). */
export const LOCALIDADES: readonly Loc[] = LOCS

const NOMBRES = ['María', 'Ana', 'Lucía', 'Inés', 'Mónica', 'Verónica', 'Sofía', 'Ángeles', 'Rocío', 'Bárbara',
  'Jazmín', 'Itzel', 'Guadalupe', 'Rosa', 'Teresa', 'Elena', 'Carmen', 'Josefina', 'Leticia', 'Paola',
  'Andrea', 'Fernanda', 'Xóchitl', 'Beatriz', 'Patricia']
const AP1 = ['Ejemplo', 'Prueba', 'Muestra', 'Ficticia', 'Simulada', 'Modelo', 'Ensayo', 'Patrón', 'Borrador', 'Maqueta']
const AP2 = ['Ruiz', 'Pérez', 'López', 'Hernández', 'Martínez', 'Núñez', 'Ramírez', 'Jiménez', 'Gómez', 'Díaz']
const SERVICIOS = ['Papanicolaou', 'Ultrasonido mamario', 'Exploración clínica de mama']
const TALLERES = ['Autoexploración', 'Nutrición y prevención', 'Salud menstrual', 'Mitos del cáncer']

interface Woman { nombre: string; ap1: string; ap2: string; fecha_nac: string; tel: string; loc: Loc }

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pad = (n: number, w = 2) => String(n).padStart(w, '0')

export function generateDemo(seed = 2026): DemoDataset {
  const rnd = mulberry32(seed)
  const int = (lo: number, hi: number) => lo + Math.floor(rnd() * (hi - lo + 1))
  const pick = <T,>(xs: readonly T[]): T => xs[int(0, xs.length - 1)]
  const date = (y0: number, y1: number) => `${int(y0, y1)}-${pad(int(1, 12))}-${pad(int(1, 28))}`
  const shuffle = <T,>(xs: T[]): T[] => {
    for (let i = xs.length - 1; i > 0; i--) { const j = int(0, i); [xs[i], xs[j]] = [xs[j], xs[i]] }
    return xs
  }
  const woman = (loc: Loc = pick(LOCS)): Woman => {
    let tel = loc.lada
    while (tel.length < 10) tel += String(int(0, 9))
    return { nombre: pick(NOMBRES), ap1: pick(AP1), ap2: pick(AP2), fecha_nac: date(1955, 2000), tel, loc }
  }
  const servicioDate = () => `2026-${pad(int(1, 9))}-${pad(int(1, 28))}`

  // File 1: 110 women, 10 of them come back for a second atención → 120 rows.
  const w1 = Array.from({ length: 110 }, () => woman())
  const repeaters = w1.slice(0, 10)
  const linked = w1.slice(10, 38) // 28 women who also attend a workshop (file 2)
  const homonymSrc = w1.slice(38, 42) // 4 women whose namesakes appear in file 2

  const jRows = shuffle([...w1, ...repeaters]).map((w) => ({
    w,
    row: {
      Folio: '', Nombre: w.nombre, 'Apellido paterno': w.ap1, 'Apellido materno': w.ap2,
      'Fecha nacimiento': w.fecha_nac, Telefono: w.tel, Estado: w.loc.estado, Municipio: w.loc.municipio,
      Localidad: w.loc.localidad, Jornada: w.loc.jornada, 'Fecha atencion': servicioDate(), Servicio: pick(SERVICIOS),
    } as Row,
  }))
  jRows.forEach((j, i) => { j.row.Folio = `J-${pad(i + 1, 3)}` })
  const firstFolio = new Map<Woman, string>()
  const repeats: [string, string][] = []
  for (const j of jRows) {
    const prev = firstFolio.get(j.w)
    if (prev) repeats.push([prev, j.row.Folio])
    else firstFolio.set(j.w, j.row.Folio)
  }

  // File 2: 28 linked (with spelling variations) + 4 homonyms + 48 new women = 80 rows.
  type S = { kind: 'link' | 'homonym' | 'new'; src?: Woman; w: Woman }
  const sWomen: S[] = [
    ...linked.map((src, i): S => {
      const w = { ...src }
      if (i % 3 === 0) w.nombre = stripAccents(w.nombre) // acentos
      if (i % 3 === 1) w.ap2 = '' // segundo apellido omitido
      if (i % 3 === 2) w.tel = '+52 ' + w.tel // teléfono con lada internacional
      return { kind: 'link', src, w }
    }),
    ...homonymSrc.map((src): S => {
      const other = woman(LOCS.find((l) => l.estado !== src.loc.estado)!)
      let fecha = other.fecha_nac
      while (fecha === src.fecha_nac) fecha = date(1955, 2000)
      return { kind: 'homonym', src, w: { ...other, nombre: src.nombre, ap1: src.ap1, ap2: src.ap2, fecha_nac: fecha } }
    }),
    ...Array.from({ length: 48 }, (): S => ({ kind: 'new', w: woman() })),
  ]
  const sRows = shuffle(sWomen).map((s, i) => ({
    s,
    row: {
      Folio: `S-${pad(i + 1, 3)}`, Nombre: s.w.nombre, 'Apellido 1': s.w.ap1, 'Apellido 2': s.w.ap2,
      'Fecha de nacimiento': s.w.fecha_nac, Telefono: s.w.tel, Estado: s.w.loc.estado, mpio: s.w.loc.municipio,
      Localidad: s.w.loc.localidad, 'Fecha taller': servicioDate(), Taller: pick(TALLERES),
    } as Row,
  }))
  const links: [string, string][] = []
  const homonyms: [string, string][] = []
  for (const { s, row } of sRows) {
    if (s.kind === 'link') links.push([firstFolio.get(s.src!)!, row.Folio])
    if (s.kind === 'homonym') homonyms.push([firstFolio.get(s.src!)!, row.Folio])
  }

  // Seeded anomalies (14), only on plain rows so the known truth stays intact.
  const special = new Set([...repeaters, ...linked, ...homonymSrc])
  const plainJ = jRows.filter((j) => !special.has(j.w)).map((j) => j.row)
  const plainS = sRows.filter((x) => x.s.kind === 'new').map((x) => x.row)
  for (const r of [plainJ[0], plainJ[1], plainJ[2], plainJ[3], plainS[0], plainS[1]]) r.Localidad = ''
  plainJ[4]['Fecha nacimiento'] = '31/02/1980'
  plainJ[5]['Fecha nacimiento'] = 'sin dato'
  plainS[2]['Fecha de nacimiento'] = '15-15-1979'
  plainJ[6].Telefono = '33123'
  plainS[3].Telefono = 'N/A'
  plainJ[7]['Fecha atencion'] = '2026-10-15' // fuera del periodo

  const alianzas: Alliance[] = [
    { id: 'AL-01', nombre: 'Municipio de Zapopan', tipo: 'municipio', estado: '14', municipio: 'Zapopan', lat: 20.7214, lng: -103.3918, jornadas: ['JOR-ZAPOPAN'] },
    { id: 'AL-02', nombre: 'DIF Tlajomulco', tipo: 'DIF', estado: '14', municipio: 'Tlajomulco de Zúñiga', lat: 20.4736, lng: -103.4469, jornadas: ['JOR-TLAJOMULCO-DE-ZUNIGA'] },
    { id: 'AL-03', nombre: 'Textiles Ejemplo S.A. de C.V.', tipo: 'empresa', estado: '14', municipio: 'Puerto Vallarta', lat: 20.6534, lng: -105.2253, jornadas: ['JOR-PUERTO-VALLARTA', 'JOR-AMECA'] },
    { id: 'AL-04', nombre: 'DIF Estatal Colima', tipo: 'DIF', estado: '06', municipio: 'Colima', lat: 19.2433, lng: -103.725, jornadas: ['JOR-COLIMA', 'JOR-VILLA-DE-ALVAREZ', 'JOR-TECOMAN', 'JOR-MANZANILLO'] },
    { id: 'AL-05', nombre: 'Municipio de Morelia', tipo: 'municipio', estado: '16', municipio: 'Morelia', lat: 19.705, lng: -101.1944, jornadas: ['JOR-MORELIA', 'JOR-PATZCUARO'] },
    { id: 'AL-06', nombre: 'DIF Uruapan', tipo: 'DIF', estado: '16', municipio: 'Uruapan', lat: 19.4167, lng: -102.05, jornadas: ['JOR-URUAPAN', 'JOR-ZAMORA'] },
    { id: 'AL-07', nombre: 'Municipio de Tepic', tipo: 'municipio', estado: '18', municipio: 'Tepic', lat: 21.5042, lng: -104.8946, jornadas: ['JOR-TEPIC', 'JOR-BAHIA-DE-BANDERAS', 'JOR-COMPOSTELA', 'JOR-SANTIAGO-IXCUINTLA'] },
    { id: 'AL-08', nombre: 'Fundación Ejemplo Veracruz', tipo: 'ONG', estado: '30', municipio: 'Xalapa', lat: 19.5438, lng: -96.9102, jornadas: ['JOR-XALAPA', 'JOR-VERACRUZ', 'JOR-PAPANTLA', 'JOR-CORDOBA', 'JOR-COATZACOALCOS'] },
  ]

  return {
    jornadas: jRows.map((j) => j.row),
    salud: sRows.map((x) => x.row),
    alianzas,
    truth: { demo_data: true, links, homonyms, repeats, unique_people: 110 + 80 - links.length },
  }
}
