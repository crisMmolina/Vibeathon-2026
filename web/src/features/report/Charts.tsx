// HR-016 · Report charts: suggested charts + "Arma tu gráfica". Data from src/lib/charts; colors from tokens only.
import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button, Chip, SectionHeader } from '../../lib/ui/index.tsx'
import {
  DIMENSION_LABEL, MEASURE_LABEL, TYPE_LABEL, measuresFor, series, suggest, typeCheck,
  type ChartCtx, type ChartSpec, type ChartType, type Dimension, type Measure,
} from '../../lib/charts.ts'

const SERIES_COLORS = ['var(--rose-deep)', 'var(--rose)', 'var(--accent)', 'var(--rose-pale)']
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function ChartView({ ctx, spec, estado, fuente, onRemove }: { ctx: ChartCtx; spec: ChartSpec; estado: string; fuente: string; onRemove?: () => void }) {
  const rows = useMemo(() => series(ctx, spec).slice(0, spec.dimension === 'mes' ? 24 : 12), [ctx, spec])
  const anim = !reduced()
  const h = spec.type === 'barras' ? Math.max(160, rows.length * 30 + 40) : 240
  const axisTick = { fill: 'var(--text-2)', fontSize: 12 }
  return (
    <figure className="report-chart" style={{ margin: 0, border: '1px solid var(--line)', padding: 'var(--s-4)', display: 'grid', gap: 'var(--s-3)', breakInside: 'avoid' }}>
      <figcaption style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--s-3)', alignItems: 'baseline' }}>
        <strong>{spec.title}</strong>
        {onRemove && <Button variant="ghost" size="sm" className="no-print" onClick={onRemove} aria-label={`Quitar ${spec.title} del informe`}>Quitar</Button>}
      </figcaption>
      {rows.length === 0 ? (
        <p className="ui-note">Sin datos para esta combinación.</p>
      ) : (
        <div style={{ width: '100%', height: h }} role="img" aria-label={`${spec.title}: ${rows.map((r) => `${r.label} ${spec.measures.map((m) => r[m]).join(' / ')}`).join('; ')}`}>
          <ResponsiveContainer>
            {spec.type === 'pastel' ? (
              <PieChart>
                <Pie data={rows} dataKey={spec.measures[0]} nameKey="label" outerRadius="80%" isAnimationActive={anim} label>
                  {rows.map((_, i) => <Cell key={i} fill={SERIES_COLORS[i % SERIES_COLORS.length]} stroke="var(--bg)" />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            ) : spec.type === 'linea' ? (
              <LineChart data={rows} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="label" tick={axisTick} />
                <YAxis allowDecimals={false} tick={axisTick} width={36} />
                <Tooltip />
                <Legend />
                {spec.measures.map((m, i) => <Line key={m} type="monotone" dataKey={m} name={MEASURE_LABEL[m]} stroke={SERIES_COLORS[i]} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={anim} />)}
              </LineChart>
            ) : spec.type === 'barras' ? (
              <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid stroke="var(--line)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={axisTick} />
                <YAxis type="category" dataKey="label" tick={axisTick} width={150} />
                <Tooltip />
                {spec.measures.length > 1 && <Legend />}
                {spec.measures.map((m, i) => <Bar key={m} dataKey={m} name={MEASURE_LABEL[m]} fill={SERIES_COLORS[i]} isAnimationActive={anim} />)}
              </BarChart>
            ) : (
              <BarChart data={rows} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="label" tick={axisTick} interval={0} />
                <YAxis allowDecimals={false} tick={axisTick} width={36} />
                <Tooltip />
                {spec.measures.length > 1 && <Legend />}
                {spec.measures.map((m, i) => <Bar key={m} dataKey={m} name={MEASURE_LABEL[m]} fill={SERIES_COLORS[i]} isAnimationActive={anim} />)}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
      <span className="ui-stat-source">
        Fuente: {fuente} · {spec.measures.map((m) => MEASURE_LABEL[m]).join(' y ')} por {DIMENSION_LABEL[spec.dimension].toLowerCase()}
        {spec.measures.includes('personas') ? ` · ${estado}` : ''}
        {spec.measures.length > 1 ? ' · series separadas, no se suman' : ''}
      </span>
    </figure>
  )
}

export function ChartBuilder({ ctx, onAdd }: { ctx: ChartCtx; onAdd: (s: ChartSpec) => void }) {
  const [dimension, setDimension] = useState<Dimension>('servicio')
  const [measure, setMeasure] = useState<Measure>('personas')
  const [type, setType] = useState<ChartType>('barras')
  const valid = measuresFor(dimension)
  const m = valid.includes(measure) ? measure : valid[0]
  const cats = useMemo(() => series(ctx, { id: '', title: '', dimension, measures: [m], type }).length, [ctx, dimension, m, type])
  const field = { display: 'grid', gap: 'var(--s-1)' } as const
  const check = typeCheck(type, dimension, [m], cats)
  return (
    <div className="no-print" style={{ display: 'grid', gap: 'var(--s-4)', border: '1px dashed var(--frame)', padding: 'var(--s-4)' }}>
      <SectionHeader title="Arma tu gráfica" meta="elige qué medir y cómo agrupar" />
      <div style={{ display: 'flex', gap: 'var(--s-4)', flexWrap: 'wrap', alignItems: 'end' }}>
        <label style={field}>
          <span className="ui-note">Agrupar por</span>
          <select value={dimension} onChange={(e) => setDimension(e.target.value as Dimension)}>
            {(Object.keys(DIMENSION_LABEL) as Dimension[]).map((d) => <option key={d} value={d}>{DIMENSION_LABEL[d]}</option>)}
          </select>
        </label>
        <label style={field}>
          <span className="ui-note">Medir</span>
          <select value={m} onChange={(e) => setMeasure(e.target.value as Measure)}>
            {valid.map((x) => <option key={x} value={x}>{MEASURE_LABEL[x]}</option>)}
          </select>
        </label>
        <label style={field}>
          <span className="ui-note">Tipo</span>
          <select value={type} onChange={(e) => setType(e.target.value as ChartType)}>
            {(Object.keys(TYPE_LABEL) as ChartType[]).map((t) => {
              const c = typeCheck(t, dimension, [m], cats)
              return <option key={t} value={t} disabled={!c.ok}>{TYPE_LABEL[t]}{c.ok ? '' : ' (no aplica)'}</option>
            })}
          </select>
        </label>
        <Button
          variant="primary"
          disabled={!check.ok || cats === 0}
          onClick={() => onAdd({ id: `custom-${dimension}-${m}-${type}-${Date.now()}`, title: `${MEASURE_LABEL[m]} por ${DIMENSION_LABEL[dimension].toLowerCase()}`, dimension, measures: [m], type })}
        >
          Agregar al informe
        </Button>
      </div>
      {!check.ok && <p className="ui-note" role="status">{check.reason}</p>}
      {check.ok && cats === 0 && <p className="ui-note" role="status">No hay datos para esta combinación.</p>}
    </div>
  )
}

/** The charts section of the report: suggested charts (toggle) + custom ones. */
export function ReportCharts({ ctx, estado, fuente, chosen, setChosen }: { ctx: ChartCtx; estado: string; fuente: string; chosen: ChartSpec[]; setChosen: (s: ChartSpec[]) => void }) {
  const suggested = useMemo(() => suggest(ctx), [ctx])
  const ids = new Set(chosen.map((c) => c.id))
  return (
    <section className="report-page" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <SectionHeader title="Gráficas" meta={`${chosen.length} en el informe`} />
      <div className="no-print" style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="ui-note">Sugeridas para tus datos:</span>
        {suggested.map((s) => (
          <button
            key={s.id}
            aria-pressed={ids.has(s.id)}
            onClick={() => setChosen(ids.has(s.id) ? chosen.filter((c) => c.id !== s.id) : [...chosen, s])}
            style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
          >
            <Chip tone={ids.has(s.id) ? 'ink' : undefined}>{ids.has(s.id) ? '✓ ' : '+ '}{s.title}</Chip>
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 'var(--s-4)' }}>
        {chosen.map((s) => <ChartView key={s.id} ctx={ctx} spec={s} estado={estado} fuente={fuente} onRemove={() => setChosen(chosen.filter((c) => c.id !== s.id))} />)}
      </div>
      <ChartBuilder ctx={ctx} onAdd={(s) => setChosen([...chosen, s])} />
    </section>
  )
}
