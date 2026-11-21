// Paso 4 · Coincidencias (recipe: detail). The system only suggests pairs; a person in the validator role decides each one.
import { useEffect, useState } from 'react'
import { compute } from '../../lib/indicators.ts'
import { band, candidates, decide } from '../../lib/match.ts'
import { RULES } from '../../lib/quality.ts'
import { Button, Chip, EmptyState, Light, PageHeader, PageLayout, Plate, Row, SectionHeader, Stat } from '../../lib/ui/index.tsx'
import type { MatchPair, Record } from '../../schemas/index.ts'
import { useApp } from '../../store/index.ts'
import { estadoNombre, fileName, folio, goTo, mask, ROL_LABEL } from '../quality/shared.ts'

const careful = (p: MatchPair) => p.reasons.includes('revisar con cuidado')
const VERDICT_LABEL = { misma: 'Misma persona', distinta: 'Distintas', pendiente: 'Pendiente' } as const

export default function MatchesView() {
  const { records, pairs, files, audit, rol, set } = useApp()
  const [selected, setSelected] = useState<string | null>(null)
  const validator = rol === 'coordinacion'

  useEffect(() => {
    if (records.length && !pairs.length) set({ pairs: candidates(records) })
  }, [records, pairs.length, set])

  const header = <PageHeader title="Coincidencias" sub="Nunca se fusiona sola: tú decides cada par." action={<Button onClick={() => goTo('mapa')}>Ver el mapa</Button>} />

  if (!records.length)
    return (
      <PageLayout recipe="detail">
        {header}
        <EmptyState text="Primero carga tus archivos." action={<Button variant="primary" onClick={() => goTo('carga')}>Ir a Carga</Button>} />
      </PageLayout>
    )

  const byId = new Map(records.map((r) => [r.record_id, r]))
  const live = pairs.filter((p) => byId.has(p.a_id) && byId.has(p.b_id))
  const pending = live.filter((p) => p.verdict === 'pendiente')
  const current = live.find((p) => p.pair_id === selected) ?? pending[0]
  const unique = compute({ records, pairs: live, fecha_corte: RULES.periodo.hasta }).find((i) => i.id === 'personas_unicas')!
  const range = typeof unique.valor === 'number' ? null : unique.valor
  const same = live.filter((p) => p.verdict === 'misma').length

  function choose(verdict: 'misma' | 'distinta') {
    if (!current || !validator) return
    const next = decide(pairs, current.pair_id, verdict, rol, audit)
    set({ pairs: next.pairs, audit: next.audit })
    setSelected(null)
  }

  const show = (v: string) => (validator ? v || 'sin dato' : mask(v))
  const side = (r: Record) => (
    <div style={{ flex: '1 1 240px', padding: 'var(--s-4) var(--s-6)', display: 'grid', gap: 'var(--s-2)', alignContent: 'start' }}>
      <span className="ui-note">
        {fileName(files, r.source_file_id)} · {folio(r.record_id)}
      </span>
      <h2 style={{ fontSize: 'var(--t-20)' }}>
        {show(r.nombre)} {show(r.ap1)} {r.ap2 ? show(r.ap2) : ''}
      </h2>
      {[
        ['Fecha de nacimiento', show(r.fecha_nac)],
        ['Teléfono', show(r.tel)],
        ['Localidad', r.localidad || 'sin dato'],
        ['Municipio', `${r.municipio || 'sin dato'}, ${estadoNombre(r.estado)}`],
        [r.tipo === 'atencion' ? 'Atención' : 'Participación', `${r.servicio} · ${r.fecha_servicio}`],
      ].map(([k, v]) => (
        <div key={k}>
          <div className="ui-note">{k}</div>
          <div>{v}</div>
        </div>
      ))}
    </div>
  )

  return (
    <PageLayout recipe="detail">
      {header}
      <div className="ui-cols">
        <div style={{ display: 'grid', gap: 'var(--s-4)', alignContent: 'start' }}>
          {current ? (
            <>
              <Plate
                head={
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)', alignItems: 'center', width: '100%' }}>
                    <strong style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--t-20)' }}>{Math.round(current.score * 100)} % de parecido</strong>
                    {careful(current) ? <Chip tone="warn">Revisar con cuidado: mismo nombre, otra fecha</Chip> : <Chip tone={band(current) === 'probable' ? 'ok' : undefined}>{band(current) === 'probable' ? 'Probable' : 'Revisar'}</Chip>}
                    {current.verdict !== 'pendiente' && <Chip tone="ink">{VERDICT_LABEL[current.verdict]}</Chip>}
                  </div>
                }
                foot={`Por qué se sugiere: ${current.reasons.filter((x) => x !== 'revisar con cuidado').join(' + ')}`}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {side(byId.get(current.a_id)!)}
                  <div style={{ width: 1.5, background: 'var(--frame)' }} />
                  {side(byId.get(current.b_id)!)}
                </div>
              </Plate>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-3)', alignItems: 'center' }}>
                <Button variant="primary" disabled={!validator} onClick={() => choose('misma')}>
                  Es la misma persona
                </Button>
                <Button disabled={!validator} onClick={() => choose('distinta')}>
                  Son distintas
                </Button>
                <span className="ui-note">{validator ? 'Tu decisión queda en la bitácora con tu rol y la hora.' : `Solo Coordinación puede decidir. Estás como ${ROL_LABEL[rol]}: los datos de identidad se ocultan.`}</span>
              </div>
            </>
          ) : (
            <EmptyState text="No quedan pares por decidir. El conteo de personas únicas ya está validado." action={<Button variant="primary" onClick={() => goTo('informe')}>Ver el informe</Button>} />
          )}
        </div>
        <aside style={{ display: 'grid', gap: 'var(--s-6)', alignContent: 'start' }}>
          <Stat size="hero" value={range ? `${range.min} a ${range.max}` : String(unique.valor)} label={range ? 'personas únicas: estimado, no oficial' : 'personas únicas: validado'} source={`${records.length} filas menos ${same} vínculos confirmados; faltan ${pending.length} pares por decidir`} />
          <div>
            <SectionHeader title="Pares sugeridos" meta={`${live.length - pending.length} de ${live.length} decididos`} />
            <ul className="ui-rows" style={{ maxHeight: 320, overflow: 'auto' }}>
              {[...pending, ...live.filter((p) => p.verdict !== 'pendiente')].map((p) => (
                <Row
                  key={p.pair_id}
                  lead={<Light tone={p.verdict !== 'pendiente' ? 'ok' : careful(p) ? 'bad' : 'warn'} />}
                  title={
                    <button onClick={() => setSelected(p.pair_id)} aria-current={p === current ? 'true' : undefined} style={{ all: 'unset', cursor: 'pointer', fontWeight: p === current ? 600 : 400 }}>
                      {folio(p.a_id)} y {folio(p.b_id)}
                    </button>
                  }
                  meta={p.verdict !== 'pendiente' ? VERDICT_LABEL[p.verdict] : careful(p) ? 'revisar con cuidado' : undefined}
                  end={<Chip size="sm">{Math.round(p.score * 100)} %</Chip>}
                />
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </PageLayout>
  )
}
