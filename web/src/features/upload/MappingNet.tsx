// The hero of step 1: each detected column is a node linked to its common-model field, with the confidence on the line.
import { motion, useReducedMotion } from 'framer-motion'
import type { ColumnMapping, TargetField } from '../../schemas/index.ts'
import { FIELD_LABEL, FIELD_ORDER, pct } from './fields.ts'

const W = 900
const NODE_W = 230
const NODE_H = 22
const GAP = 26

export default function MappingNet({ mappings }: { mappings: ColumnMapping[] }) {
  const still = useReducedMotion()
  const fields = FIELD_ORDER.filter((f) => f !== 'ignorar' && mappings.some((m) => m.target_field === f))
  const height = Math.max(mappings.length, fields.length) * GAP + 16
  const y = (i: number, n: number) => 8 + (height - 16 - n * GAP) / 2 + i * GAP
  const fieldY = (f: TargetField) => y(fields.indexOf(f), fields.length) + NODE_H / 2
  const x1 = 16 + NODE_W
  const x2 = W - 16 - NODE_W

  return (
    <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label="Red de mapeo: cada columna detectada se une con un campo del modelo común" style={{ display: 'block', width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      {mappings.map((m, i) => {
        if (m.target_field === 'ignorar') return null
        const ya = y(i, mappings.length) + NODE_H / 2
        const yb = fieldY(m.target_field)
        const d = `M ${x1} ${ya} C ${x1 + 150} ${ya}, ${x2 - 150} ${yb}, ${x2} ${yb}`
        const at = { delay: still ? 0 : 0.15 + i * 0.09, duration: still ? 0 : 0.55 }
        return (
          <g key={m.source_col}>
            <motion.path d={d} fill="none" stroke="var(--rose-deep)" strokeWidth={2} strokeDasharray={m.confidence < 0.9 ? '6 5' : undefined} initial={still ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={at} />
            <motion.g initial={still ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...at, delay: at.delay + 0.3 }}>
              <rect x={x1 + 62} y={ya - 9} width={50} height={18} fill="var(--surface)" />
              <text x={x1 + 87} y={ya + 4} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--text)">
                {pct(m.confidence)}
              </text>
            </motion.g>
          </g>
        )
      })}
      {mappings.map((m, i) => {
        const off = m.target_field === 'ignorar'
        return (
          <g key={m.source_col}>
            <rect x={16} y={y(i, mappings.length)} width={NODE_W} height={NODE_H} fill="var(--surface)" stroke={off ? 'var(--line)' : 'var(--frame)'} strokeWidth={1.5} strokeDasharray={off ? '4 4' : undefined} />
            <text x={28} y={y(i, mappings.length) + 15} fontSize={13} fill={off ? 'var(--text-2)' : 'var(--text)'}>
              {m.source_col}
              {off ? ' · no se usa' : ''}
            </text>
          </g>
        )
      })}
      {fields.map((f, i) => (
        <g key={f}>
          <rect x={x2} y={y(i, fields.length)} width={NODE_W} height={NODE_H} fill="var(--surface-2)" stroke="var(--frame)" strokeWidth={1.5} />
          <text x={x2 + 12} y={y(i, fields.length) + 15} fontSize={12} fontWeight={600} fill="var(--text)">
            {FIELD_LABEL[f]}
          </text>
        </g>
      ))}
    </svg>
  )
}
