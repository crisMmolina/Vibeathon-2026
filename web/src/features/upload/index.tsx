// Paso 1 · Carga (recipe: flow). Files are read in the browser; nothing is stored until "Confirmar mapeo".
import { useEffect, useRef, useState, type DragEvent } from 'react'
import { useReducedMotion } from 'framer-motion'
import { DEMO_FILES, parse, parseFile, type ParsedFile } from '../../lib/ingest.ts'
import { apply, suggest } from '../../lib/mapping.ts'
import { Button, Chip, Light, PageHeader, PageLayout, Plate, Row, SectionHeader, Segmented, SimBadge, Stat, Steps, type Tone } from '../../lib/ui/index.tsx'
import type { ColumnMapping, TargetField } from '../../schemas/index.ts'
import { useApp } from '../../store/index.ts'
import { FIELD_LABEL, FIELD_ORDER, pct, toAlliances } from './fields.ts'
import MappingNet from './MappingNet.tsx'

type Phase = 'empty' | 'loading' | 'mapping' | 'done'
const STEPS = ['Cargar archivos', 'Revisar mapeo', 'Confirmar']
const isCatalog = (p: ParsedFile) => p.file.programa === 'alianzas'

function tone(m: ColumnMapping): Tone {
  if (m.target_field === 'ignorar') return m.confidence === 1 ? 'ok' : 'bad'
  return m.confidence >= 0.9 ? 'ok' : 'warn'
}

function why(m: ColumnMapping): string {
  if (m.confirmed_by) return 'elegido por ti'
  if (m.target_field === 'ignorar') return m.confidence === 1 ? 'folio o nota: no se usa para contar' : 'no reconocimos esta columna: elige un campo o déjala fuera'
  return m.confidence === 1 ? 'nombre de columna reconocido' : 'parecido de nombre o de valores: revisa'
}

function useCountUp(target: number): number {
  const still = useReducedMotion()
  const [n, setN] = useState(0)
  useEffect(() => {
    if (still || !target) return setN(target)
    const t0 = performance.now()
    let raf = requestAnimationFrame(function tick(t) {
      const k = Math.min(1, (t - t0) / 1200)
      setN(Math.round(target * k))
      if (k < 1) raf = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(raf)
  }, [target, still])
  return n
}

export default function UploadView() {
  const stored = useApp((s) => s.records)
  const alliances = useApp((s) => s.alliances)
  const rol = useApp((s) => s.rol)
  const [phase, setPhase] = useState<Phase>(stored.length ? 'done' : 'empty')
  const [error, setError] = useState('')
  const [parsed, setParsed] = useState<ParsedFile[]>([])
  const [mappings, setMappings] = useState<ColumnMapping[]>([])
  const [active, setActive] = useState('')
  const [over, setOver] = useState(false)
  const picker = useRef<HTMLInputElement>(null)

  const people = parsed.filter((p) => !isCatalog(p))
  const totalRows = people.reduce((n, p) => n + p.file.filas, 0)
  const counted = useCountUp(phase === 'mapping' ? totalRows : 0)

  async function load(read: () => Promise<ParsedFile[]>) {
    setPhase('loading')
    setError('')
    try {
      const files = await read()
      const withPeople = files.filter((p) => !isCatalog(p))
      if (!withPeople.some((p) => p.rows.length)) throw new Error('No encontramos filas de personas en esos archivos.')
      setParsed(files)
      setMappings(withPeople.flatMap((p) => suggest(p.file.id, p.columns, p.rows)))
      setActive(withPeople[0].file.id)
      setPhase('mapping')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos leer los archivos.')
      setPhase('empty')
    }
  }

  const loadDemo = () =>
    load(() =>
      Promise.all(
        DEMO_FILES.map(async (name) => {
          const res = await fetch(`/demo_data/${name}`)
          if (!res.ok) throw new Error(`No pudimos leer ${name}. Recarga la página y vuelve a intentar.`)
          return parseFile(name, await res.arrayBuffer())
        }),
      ),
    )

  const loadFiles = (list: FileList | null) => {
    const files = Array.from(list ?? [])
    if (!files.length) return
    const bad = files.find((f) => !/\.(csv|xlsx?)$/i.test(f.name))
    if (bad) return setError(`No pudimos leer ${bad.name}. Usa archivos CSV o Excel (.xlsx).`)
    load(() => parse(files))
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    loadFiles(e.dataTransfer.files)
  }

  const choose = (m: ColumnMapping, target_field: TargetField) =>
    setMappings((all) => all.map((x) => (x === m ? { ...x, target_field, confidence: 1, confirmed_by: rol } : x)))

  function confirm() {
    const confirmed = mappings.map((m) => ({ ...m, confirmed_by: m.confirmed_by ?? rol }))
    useApp.getState().set({
      files: parsed.map((p) => p.file),
      mappings: confirmed,
      records: people.flatMap((p) => apply(p, confirmed.filter((m) => m.source_file_id === p.file.id))),
      alliances: parsed.filter(isCatalog).flatMap(toAlliances),
    })
    setPhase('done')
  }

  function restart() {
    useApp.getState().reset()
    setParsed([])
    setMappings([])
    setPhase('empty')
  }

  const header = <PageHeader title="Carga tus archivos" sub="Tus datos no salen de esta computadora." lamina="LÁMINA 01 · CARGA" />

  if (phase === 'done') {
    const atenciones = stored.filter((r) => r.tipo === 'atencion').length
    return (
      <PageLayout recipe="flow">
        {header}
        <Steps steps={STEPS} current={2} />
        <Plate foot="Son filas, no personas: una misma mujer puede aparecer en los dos archivos. Eso se revisa en Coincidencias.">
          <div style={{ padding: 'var(--s-8) var(--s-6)', display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
            <h2 style={{ fontSize: 'var(--t-28)' }}>{stored.length} registros listos para el mapa</h2>
            <div style={{ display: 'flex', gap: 'var(--s-12)', flexWrap: 'wrap' }}>
              <Stat value={atenciones} label="atenciones" source="archivo de jornadas, filas con mapeo confirmado" />
              <Stat value={stored.length - atenciones} label="participaciones" source="archivo de talleres, filas con mapeo confirmado" />
              <Stat value={alliances.length} label="alianzas" source="catálogo de alianzas" />
            </div>
          </div>
        </Plate>
        <div className="ui-sticky-action">
          <span className="ui-note">Mapeo confirmado por {rol === 'coordinacion' ? 'Coordinación' : 'Capturista'}</span>
          <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
            <Button onClick={restart}>Cargar otros archivos</Button>
            <Button variant="primary" onClick={() => window.dispatchEvent(new CustomEvent('huella:tab', { detail: 'mapa' }))}>
              Ver el mapa
            </Button>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (phase === 'mapping') {
    const current = people.find((p) => p.file.id === active) ?? people[0]
    return (
      <PageLayout recipe="flow">
        {header}
        <Steps steps={STEPS} current={1} />
        <Plate
          head={
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)', alignItems: 'center', width: '100%' }}>
              {parsed.map((p) => (
                <Chip key={p.file.id}>{`${p.file.nombre} · ${p.file.filas} ${isCatalog(p) ? 'alianzas' : 'filas'}`}</Chip>
              ))}
              {parsed.every((p) => (DEMO_FILES as readonly string[]).includes(p.file.nombre)) && <SimBadge label="DATOS SINTÉTICOS" />}
            </div>
          }
          foot={
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-3)', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span>
                <strong>{counted}</strong> filas leídas · confianza sugerida por sinónimos y similitud, tú confirmas
              </span>
              {people.length > 1 && <Segmented label="Archivo en la red" value={current.file.id} onChange={setActive} options={people.map((p) => ({ id: p.file.id, label: p.file.nombre }))} />}
            </div>
          }
        >
          <div style={{ padding: 'var(--s-2) var(--s-4)' }}>
            <MappingNet key={current.file.id} mappings={mappings.filter((m) => m.source_file_id === current.file.id)} />
          </div>
        </Plate>
        {people.map((p) => {
          const own = mappings.filter((m) => m.source_file_id === p.file.id)
          return (
            <div key={p.file.id}>
              <SectionHeader title={p.file.nombre} meta={`${own.length} columnas · ${own.filter((m) => tone(m) !== 'ok').length} por revisar`} />
              <ul className="ui-rows">
                {own.map((m) => (
                  <Row
                    key={m.source_col}
                    lead={<Light tone={tone(m)} />}
                    title={m.source_col}
                    meta={why(m)}
                    end={
                      <>
                        <Chip size="sm">{pct(m.confidence)}</Chip>
                        <select className="ui-btn" data-size="sm" aria-label={`Campo para ${m.source_col} (${p.file.nombre})`} value={m.target_field} onChange={(e) => choose(m, e.target.value as TargetField)}>
                          {FIELD_ORDER.map((f) => (
                            <option key={f} value={f}>
                              {FIELD_LABEL[f]}
                            </option>
                          ))}
                        </select>
                      </>
                    }
                  />
                ))}
              </ul>
            </div>
          )
        })}
        <div className="ui-sticky-action">
          <span className="ui-note">
            {parsed.length} archivos · {totalRows} filas
          </span>
          <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
            <Button onClick={restart}>Cambiar archivos</Button>
            <Button variant="primary" onClick={confirm}>
              Confirmar mapeo
            </Button>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout recipe="flow">
      {header}
      <Steps steps={STEPS} current={0} />
      {error && (
        <p role="alert" style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'center' }}>
          <Light tone="bad" />
          {error}
        </p>
      )}
      <Plate foot="Aceptamos CSV y Excel. Se leen en este navegador: no hay servidor ni nube.">
        {phase === 'loading' ? (
          <div aria-busy="true" aria-label="Leyendo archivos" style={{ padding: 'var(--s-6)', display: 'grid', gap: 'var(--s-3)' }}>
            {[72, 56, 64, 48, 60].map((w) => (
              <div key={w} className="ui-skeleton" style={{ width: `${w}%`, height: 26 }} />
            ))}
          </div>
        ) : (
          <div onDragOver={(e) => (e.preventDefault(), setOver(true))} onDragLeave={() => setOver(false)} onDrop={onDrop} style={{ padding: 'var(--s-12) var(--s-6)', display: 'grid', justifyItems: 'center', gap: 'var(--s-4)', textAlign: 'center', background: over ? 'var(--surface-2)' : undefined }}>
            <h2 style={{ fontSize: 'var(--t-28)' }}>Arrastra aquí tus archivos</h2>
            <p style={{ color: 'var(--text-2)', maxWidth: 520 }}>Las atenciones de las jornadas, las participaciones en talleres y el catálogo de alianzas. Reconocemos las columnas aunque se llamen distinto en cada archivo.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-3)', justifyContent: 'center' }}>
              <Button variant="primary" onClick={loadDemo}>
                Usar datos de demostración
              </Button>
              <Button onClick={() => picker.current?.click()}>Elegir archivos</Button>
            </div>
            <input ref={picker} type="file" multiple accept=".csv,.xlsx,.xls" hidden onChange={(e) => loadFiles(e.target.files)} />
          </div>
        )}
      </Plate>
    </PageLayout>
  )
}
