// Writes web/public/demo_data/ from the deterministic generator: npm run gen:demo
import { writeFileSync, mkdirSync } from 'node:fs'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { generateDemo } from './generate.ts'

const out = new URL('../../../public/demo_data/', import.meta.url)
mkdirSync(out, { recursive: true })
const d = generateDemo()
writeFileSync(new URL('jornadas_tamizaje.csv', out), Papa.unparse(d.jornadas))
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(d.salud), 'Participaciones')
writeFileSync(new URL('salud_que_florece.xlsx', out), XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
writeFileSync(new URL('alianzas.csv', out), Papa.unparse(d.alianzas.map((a) => ({ ...a, jornadas: a.jornadas.join('|') }))))
writeFileSync(new URL('truth.json', out), JSON.stringify(d.truth, null, 2))
console.log(`demo_data: ${d.jornadas.length} atenciones, ${d.salud.length} participaciones, ${d.alianzas.length} alianzas`)
