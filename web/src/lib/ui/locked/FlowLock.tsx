// Locked reference screen · FLOW recipe, step 1 "Carga" (upload files, then column mapping). Static: feature screens copy this.
import { Button, Chip, Light, PageHeader, PageLayout, Plate, Row, SectionHeader, SimBadge, Steps } from '../index.tsx'
import type { Tone } from '../index.tsx'

const FILES = ['jornadas_tamizaje.csv · 120 filas', 'salud_que_florece.xlsx · 80 filas', 'alianzas.csv · 8 filas']

const COLUMNS = ['Nombre', 'Apellido paterno', 'Fecha nacimiento', 'Telefono', 'Municipio', 'mpio']
const FIELDS = ['Nombre', 'Apellido paterno', 'Fecha de nacimiento', 'Teléfono', 'Municipio']

// One link per source column: target field index, suggested confidence, dashed when it needs a look.
const LINKS = [
  { to: 0, pct: '100 %', dashed: false },
  { to: 1, pct: '96 %', dashed: false },
  { to: 2, pct: '98 %', dashed: false },
  { to: 3, pct: '100 %', dashed: false },
  { to: 4, pct: '100 %', dashed: false },
  { to: 4, pct: '91 %', dashed: true },
]

const ROWS: { tone: Tone; title: string; meta: string; pct: string }[] = [
  { tone: 'ok', title: 'Municipio → Municipio', meta: 'jornadas_tamizaje.csv · sinónimo exacto', pct: '100 %' },
  { tone: 'ok', title: 'Apellido paterno → Apellido paterno', meta: 'jornadas_tamizaje.csv · sinónimo conocido', pct: '96 %' },
  { tone: 'warn', title: 'mpio → Municipio', meta: 'salud_que_florece.xlsx · similitud de nombre', pct: '91 %' },
]

// Geometry of the mapping network, in viewBox units (0 0 900 360).
const NODE_W = 220
const NODE_H = 36
const LEFT_X = 20
const RIGHT_X = 660
const MID_X = 450
const PORT = 6
const leftY = (i: number) => 20 + i * 54
const rightY = (i: number) => 26 + i * 66
const leftMid = (i: number) => leftY(i) + NODE_H / 2
const rightMid = (i: number) => rightY(i) + NODE_H / 2

function MappingNet() {
  return (
    <svg
      viewBox="0 0 900 360"
      role="img"
      aria-label="Red de mapeo: seis columnas de tus archivos enlazadas con cinco campos del modelo común"
      style={{ display: 'block', width: '100%', height: 'auto' }}
    >
      {LINKS.map((l, i) => {
        const y1 = leftMid(i)
        const y2 = rightMid(l.to)
        return (
          <path
            key={COLUMNS[i]}
            d={`M ${LEFT_X + NODE_W} ${y1} C ${MID_X} ${y1}, ${MID_X} ${y2}, ${RIGHT_X} ${y2}`}
            stroke="var(--rose-deep)"
            strokeWidth={2}
            strokeDasharray={l.dashed ? '7 6' : undefined}
            fill="none"
          />
        )
      })}

      {LINKS.map((l, i) => {
        const y = (leftMid(i) + rightMid(l.to)) / 2
        return (
          <g key={COLUMNS[i]}>
            <rect x={MID_X - 30} y={y - 11} width={60} height={22} fill="var(--surface)" />
            <text x={MID_X} y={y} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={600} fontFamily="inherit" fill="var(--text)">
              {l.pct}
            </text>
          </g>
        )
      })}

      {COLUMNS.map((c, i) => (
        <g key={c}>
          <rect x={LEFT_X} y={leftY(i)} width={NODE_W} height={NODE_H} fill="var(--surface)" stroke="var(--frame)" strokeWidth={1.5} />
          <rect x={LEFT_X + NODE_W - PORT / 2} y={leftMid(i) - PORT / 2} width={PORT} height={PORT} fill="var(--rose-deep)" />
          <text x={LEFT_X + 12} y={leftMid(i)} dominantBaseline="central" fontSize={14} fontFamily="inherit" fill="var(--text)">
            {c}
          </text>
        </g>
      ))}

      {FIELDS.map((f, i) => (
        <g key={f}>
          <rect x={RIGHT_X} y={rightY(i)} width={NODE_W} height={NODE_H} fill="var(--surface-2)" stroke="var(--frame)" strokeWidth={1.5} />
          <rect x={RIGHT_X - PORT / 2} y={rightMid(i) - PORT / 2} width={PORT} height={PORT} fill="var(--rose-deep)" />
          <text x={RIGHT_X + 16} y={rightMid(i)} dominantBaseline="central" fontSize={14} fontWeight={600} fontFamily="inherit" fill="var(--text)">
            {f}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default function FlowLock() {
  return (
    <PageLayout recipe="flow">
      <PageHeader title="Carga tus archivos" sub="Tus datos no salen de esta computadora." lamina="LÁMINA 01 · CARGA" />
      <Steps steps={['Cargar archivos', 'Revisar mapeo', 'Confirmar']} current={1} />

      <Plate
        head={
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--s-2)', flex: 1, minWidth: 0 }}>
            {FILES.map((f) => (
              <Chip key={f}>{f}</Chip>
            ))}
            <span style={{ marginLeft: 'auto' }}>
              <SimBadge />
            </span>
          </div>
        }
        foot="Confianza sugerida por sinónimos y similitud · tú confirmas"
      >
        <div style={{ padding: 'var(--s-4)' }}>
          <MappingNet />
        </div>
      </Plate>

      <SectionHeader title="Mapeo sugerido" meta="6 columnas" />
      <ul className="ui-rows">
        {ROWS.map((r) => (
          <Row
            key={r.title}
            lead={<Light tone={r.tone} />}
            title={r.title}
            meta={r.meta}
            end={
              <>
                <Chip size="sm">{r.pct}</Chip>
                <Button size="sm" aria-label={`Cambiar el mapeo ${r.title}`}>
                  Cambiar
                </Button>
              </>
            }
          />
        ))}
      </ul>

      <div className="ui-sticky-action" style={{ flexWrap: 'wrap' }}>
        <span className="ui-note">3 archivos · 200 filas + 8 alianzas</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)' }}>
          <Button>Cambiar archivos</Button>
          <Button variant="primary">Confirmar mapeo</Button>
        </div>
      </div>
    </PageLayout>
  )
}
