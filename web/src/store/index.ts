// Single app state (zustand). Every number on screen derives from here via src/lib/.
import { create } from 'zustand'
import type { Alliance, AuditEntry, ColumnMapping, MatchPair, QualityIssue, Record, SourceFile } from '../schemas/index.ts'

export type Rol = 'coordinacion' | 'capturista'

export interface AppState {
  rol: Rol
  files: SourceFile[]
  mappings: ColumnMapping[]
  records: Record[]
  alliances: Alliance[]
  issues: QualityIssue[]
  pairs: MatchPair[]
  audit: AuditEntry[]
  setRol: (rol: Rol) => void
  set: (patch: Partial<Omit<AppState, 'set' | 'setRol' | 'reset'>>) => void
  reset: () => void
}

const empty = { rol: 'coordinacion' as Rol, files: [], mappings: [], records: [], alliances: [], issues: [], pairs: [], audit: [] }

export const useApp = create<AppState>((set) => ({
  ...empty,
  setRol: (rol) => set({ rol }),
  set: (patch) => set(patch),
  reset: () => set(empty),
}))
