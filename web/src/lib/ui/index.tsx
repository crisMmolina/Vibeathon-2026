// UI kit · direction "Lámina" (web/DESIGN.md). Screens build from these; styles and tokens live in src/index.css.
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type Tone = 'ok' | 'warn' | 'bad'
type Size = 'sm' | 'md'

export function EiraLogo() {
  return (
    <svg viewBox="0 0 92 24" role="img" aria-label="EIRA">
      <g fill="var(--rose-deep)">
        <path d="M0 2h15v4H4.5v5H13v4H4.5v5H15v4H0z" />
        <path d="M21 2h4.5v22H21z" />
        <path d="M32 2h9.5c5 0 8 2.800 8 7.200 0 3.200-1.700 5.500-4.500 6.500L50 24h-5.200l-4.300-7.600h-4V24H32zm4.500 4v6.500h4.700c2.300 0 3.700-1.200 3.700-3.300S43.500 6 41.200 6z" />
        <path d="M73 1l15 23H58z" />
      </g>
    </svg>
  )
}

export function AppShell({ nav, children }: { nav: ReactNode; children: ReactNode }) {
  return (
    <div className="ui-shell">
      {nav}
      <main className="ui-main">{children}</main>
    </div>
  )
}

export interface NavItem {
  id: string
  label: string
}

export function NavBar({ items, current, onSelect, end }: { items: NavItem[]; current: string; onSelect: (id: string) => void; end?: ReactNode }) {
  return (
    <header className="ui-nav">
      <a className="ui-brand" href="/" aria-label="EIRA · Huella Rosa, inicio">
        <EiraLogo />
        <span className="ui-brand-name">Huella Rosa</span>
      </a>
      <nav className="ui-tabs" aria-label="Pasos">
        {items.map((it, i) => (
          <button key={it.id} className="ui-tab" aria-current={it.id === current ? 'page' : undefined} onClick={() => onSelect(it.id)}>
            <span className="ui-tab-n">{i + 1}</span>
            {it.label}
          </button>
        ))}
      </nav>
      <div className="ui-nav-end">{end}</div>
    </header>
  )
}

export function PageLayout({ recipe, children }: { recipe: 'map' | 'flow' | 'list' | 'detail'; children: ReactNode }) {
  return <div className={`ui-layout-${recipe}`}>{children}</div>
}

export function PageHeader({ title, sub, lamina, action }: { title: string; sub?: string; lamina?: string; action?: ReactNode }) {
  return (
    <div className="ui-page-header">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {action ?? (lamina && <span className="ui-lamina">{lamina}</span>)}
    </div>
  )
}

export function Button({ variant = 'secondary', size = 'md', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost'; size?: Size }) {
  return <button className="ui-btn" data-variant={variant} data-size={size} {...rest} />
}

export function Surface({ tone, children }: { tone?: 'pale'; children: ReactNode }) {
  return (
    <div className="ui-surface" data-tone={tone}>
      {children}
    </div>
  )
}

export function Plate({ head, foot, children }: { head?: ReactNode; foot?: ReactNode; children: ReactNode }) {
  return (
    <div className="ui-plate">
      {head && <div className="ui-plate-head">{head}</div>}
      {children}
      {foot && <div className="ui-plate-foot">{foot}</div>}
    </div>
  )
}

export function Chip({ tone, size = 'md', children }: { tone?: Tone | 'ink'; size?: Size; children: ReactNode }) {
  return (
    <span className="ui-chip" data-tone={tone} data-size={size}>
      {children}
    </span>
  )
}

export function SimBadge({ label = 'SIMULADO' }: { label?: string }) {
  return (
    <span className="ui-sim" title="Dato o función simulada con datos sintéticos (demo_data)">
      {label}
    </span>
  )
}

const toneLabel: Record<Tone, string> = { ok: 'Sin problema', warn: 'Revisar', bad: 'Corregir' }

export function Light({ tone }: { tone: Tone }) {
  return <span className="ui-light" data-tone={tone} role="img" aria-label={toneLabel[tone]} />
}

export function Stat({ value, label, source, size = 'md' }: { value: ReactNode; label: string; source: string; size?: 'md' | 'hero' }) {
  return (
    <div className="ui-stat" data-size={size} title={`Fuente: ${source}`}>
      <span className="ui-stat-value">{value}</span>
      <span className="ui-stat-label">{label}</span>
      <span className="ui-stat-source">Fuente: {source}</span>
    </div>
  )
}

export function SectionHeader({ title, meta }: { title: string; meta?: ReactNode }) {
  return (
    <div className="ui-section-header">
      <h2>{title}</h2>
      {meta && <span>{meta}</span>}
    </div>
  )
}

export const RAMP = ['var(--rose-pale)', 'var(--rose)', 'var(--rose-deep)', 'var(--accent)']

export function Legend({ title, min, max, items }: { title: string; min: ReactNode; max: ReactNode; items?: { label: string }[] }) {
  return (
    <div className="ui-legend">
      <span className="ui-legend-title">{title}</span>
      <span className="ui-legend-ramp">
        {min}
        <span style={{ display: 'flex' }}>
          {RAMP.map((c) => (
            <i key={c} style={{ background: c }} />
          ))}
        </span>
        {max}
      </span>
      {items?.map((it) => (
        <span key={it.label} className="ui-legend-item">
          <span className="ui-dot" />
          {it.label}
        </span>
      ))}
    </div>
  )
}

export function Segmented<T extends string>({ options, value, onChange, label }: { options: { id: T; label: string }[]; value: T; onChange: (id: T) => void; label: string }) {
  return (
    <div className="ui-seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} aria-pressed={o.id === value} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Steps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="ui-steps">
      {steps.map((s, i) => (
        <li key={s} data-state={i < current ? 'done' : i === current ? 'now' : 'next'} aria-current={i === current ? 'step' : undefined}>
          {i + 1}. {s}
        </li>
      ))}
    </ol>
  )
}

export function Row({ lead, title, meta, end }: { lead: ReactNode; title: ReactNode; meta?: ReactNode; end?: ReactNode }) {
  return (
    <li className="ui-row">
      {lead}
      <div>
        <div className="ui-row-title">{title}</div>
        {meta && <div className="ui-row-meta">{meta}</div>}
      </div>
      {end && <div className="ui-row-end">{end}</div>}
    </li>
  )
}

export function EmptyState({ text, action }: { text: string; action?: ReactNode }) {
  return (
    <div className="ui-empty">
      <p>{text}</p>
      {action}
    </div>
  )
}

export function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
