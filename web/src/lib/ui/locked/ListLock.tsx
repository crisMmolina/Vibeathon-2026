// Locked reference screen · recipe LIST · step 3 "Calidad" (web/DESIGN.md). Static, synthetic data (demo_data: true).
import type { CSSProperties } from 'react'
import { Button, Light, PageHeader, PageLayout, Row, SectionHeader, SimBadge, Stat } from '../index.tsx'
import type { Tone } from '../index.tsx'

interface Alert {
  id: string
  tone: Tone
  rule: string
  meta: string
}

const SUMMARY: { tone: Tone; text: string }[] = [
  { tone: 'bad', text: '6 sin localidad' },
  { tone: 'warn', text: '3 fechas inválidas + 2 teléfonos inválidos' },
  { tone: 'warn', text: '1 fuera de periodo · 2 columnas ambiguas' },
]

const ALERTS: Alert[] = [
  { id: 'J-001', tone: 'bad', rule: 'Falta la localidad', meta: 'J-001 · Xó*** M*** · Nayarit, Bahía de Banderas · jornadas_tamizaje.csv' },
  { id: 'J-002', tone: 'bad', rule: 'Falta la localidad', meta: 'J-002 · Ma*** G*** · Nayarit, Compostela · jornadas_tamizaje.csv' },
  { id: 'J-017', tone: 'warn', rule: 'Fecha de nacimiento inválida', meta: 'J-017 · Ro*** H*** · Jalisco, Puerto Vallarta · jornadas_tamizaje.csv' },
  { id: 'S-009', tone: 'warn', rule: 'Teléfono con menos de 10 dígitos', meta: 'S-009 · Le*** C*** · Nayarit, Tepic · salud_que_florece.xlsx' },
  { id: 'S-031', tone: 'warn', rule: 'Fecha de nacimiento inválida', meta: 'S-031 · An*** R*** · Jalisco, Cabo Corrientes · salud_que_florece.xlsx' },
  { id: 'J-088', tone: 'warn', rule: 'Atención fuera del periodo', meta: 'J-088 · Gu*** V*** · Nayarit, Bahía de Banderas · jornadas_tamizaje.csv' },
  { id: 'archivo-municipio', tone: 'warn', rule: 'Columna ambigua: Municipio / mpio', meta: 'Todo el archivo · 200 filas · jornadas_tamizaje.csv' },
]

const summaryRow: CSSProperties = { display: 'flex', gap: 'var(--s-8)', flexWrap: 'wrap', alignItems: 'flex-end' }
const summaryList: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', minWidth: 0, fontSize: 'var(--t-14)' }
const summaryItem: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--s-2)' }

export default function ListLock() {
  return (
    <PageLayout recipe="list">
      <PageHeader
        title="Calidad de los datos"
        sub="Cada ajuste pide un motivo y queda en la bitácora."
        action={<Button variant="primary">Ver coincidencias</Button>}
      />

      <div style={summaryRow}>
        <Stat size="hero" value="14" label="alertas por revisar" source="reglas v1 sobre 200 filas" />
        <div style={summaryList}>
          {SUMMARY.map((s) => (
            <span key={s.text} style={summaryItem}>
              <Light tone={s.tone} />
              {s.text}
            </span>
          ))}
        </div>
        <SimBadge label="DATOS SINTÉTICOS" />
      </div>

      <SectionHeader title="Alertas" meta="14 pendientes · 0 resueltas" />

      <ul className="ui-rows">
        {ALERTS.map((a) => (
          <Row
            key={a.id}
            lead={<Light tone={a.tone} />}
            title={a.rule}
            meta={a.meta}
            end={
              <>
                <Button size="sm">Corregir</Button>
                <Button size="sm" variant="ghost">
                  Excluir
                </Button>
              </>
            }
          />
        ))}
      </ul>

      <p className="ui-note">Nada se corrige solo: tú decides y el motivo queda registrado.</p>
    </PageLayout>
  )
}
