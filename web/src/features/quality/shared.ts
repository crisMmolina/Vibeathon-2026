// Shared by Calidad and Coincidencias: how a record is named on screen without exposing who she is.
import type { Record, SourceFile } from '../../schemas/index.ts'

const ESTADOS = ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Coahuila', 'Colima', 'Chiapas', 'Chihuahua', 'Ciudad de México', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas']

export const estadoNombre = (cve: string) => ESTADOS[Number(cve) - 1] ?? cve

/** "Xóchitl" → "Xó***": enough to tell rows apart, not enough to identify. */
export const mask = (v: string) => (v ? `${v.slice(0, 2)}***` : 'sin dato')

export const maskedName = (r: Record) => `${mask(r.nombre)} ${mask(r.ap1)}`

export const folio = (recordId: string) => recordId.slice(recordId.indexOf(':') + 1)

export const fileName = (files: SourceFile[], id: string) => files.find((f) => f.id === id)?.nombre ?? id

export const goTo = (tab: string) => window.dispatchEvent(new CustomEvent('huella:tab', { detail: tab }))

export const ROL_LABEL = { coordinacion: 'Coordinación', capturista: 'Capturista' } as const
