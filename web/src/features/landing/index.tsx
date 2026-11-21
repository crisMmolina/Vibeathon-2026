// Landing (skill landing-story). Copy comes from IDEA.md §1, §3, §4 and §10; every screen is a real capture of this app
// running on the synthetic demo files (web/public/landing/, taken with Playwright).
import './landing.css'
import { Button, Plate, SimBadge } from '../../lib/ui/index.tsx'

const start = () => window.dispatchEvent(new CustomEvent('huella:tab', { detail: 'carga' }))

const STEPS = [
  { title: 'Carga tus Excel como están', text: 'Arrastra los archivos de cada programa. Huella Rosa reconoce las columnas aunque se llamen distinto, como Municipio y mpio, y tú confirmas el mapeo.', img: '/landing/carga.png', alt: 'Captura de la pantalla Carga: cada columna del archivo unida con un campo del modelo común y su porcentaje de confianza', w: 1824, h: 878, crop: true },
  { title: 'Mira dónde está el impacto', text: 'México se levanta en 3D: cada estado sube según las personas atendidas y cada punto es una alianza. Atenciones, participaciones y personas se cuentan por separado.', img: '/landing/mapa-antes.jpg', alt: 'Captura de la pantalla Mapa: estados de México elevados en rosa y panel con atenciones, participaciones y personas únicas', w: 2560, h: 1312 },
  { title: 'Decide tú quién es la misma persona', text: 'El sistema sugiere pares con su puntaje y sus razones. Nada se fusiona solo: cada decisión es de una persona y queda en la bitácora. Al confirmar, el mapa baja.', img: '/landing/coincidencias.png', alt: 'Captura de la pantalla Coincidencias: dos registros lado a lado con 100 % de parecido y las razones', w: 1494, h: 914 },
]

export default function LandingView() {
  return (
    <div className="ld" data-feature="landing">
      <section className="ld-hero">
        <div className="ld-hero-text">
          <h1>
            Cada mujer cuenta, <span>una sola vez.</span>
          </h1>
          <p className="ld-lead">Huella Rosa une los Excel de los programas de EIRA en un mapa de México y quita el doble conteo con confirmación humana.</p>
          <div className="ld-actions">
            <Button variant="primary" onClick={start}>
              Probar con datos de demostración
            </Button>
            <a className="ui-btn" href="#como-funciona">
              Cómo funciona
            </a>
          </div>
          <p className="ui-note">Tus datos no salen de esta computadora: todo corre en el navegador, sin servidor.</p>
        </div>
        <Plate
          head={
            <>
              <strong>El doble conteo se ve desaparecer</strong>
              <SimBadge label="DATOS SINTÉTICOS" />
            </>
          }
          foot="Capturas reales de la demo: antes y después de confirmar 38 coincidencias. El máximo de personas únicas baja de 200 a 162."
        >
          <div className="ld-stage">
            <img src="/landing/mapa-antes.jpg" width={2560} height={1312} alt="Mapa de México con los estados elevados antes de confirmar coincidencias: entre 152 y 200 personas únicas" />
            <img src="/landing/mapa-despues.jpg" width={2560} height={1312} alt="El mismo mapa después de confirmar 38 coincidencias: entre 152 y 162 personas únicas y estados más bajos" />
          </div>
        </Plate>
      </section>

      <section className="ld-pain">
        <strong>51,000</strong>
        <div>
          <h2>personas beneficiadas acumuladas no son 51,000 pacientes únicas.</h2>
          <p className="ld-lead" style={{ marginTop: 'var(--s-3)' }}>
            EIRA reporta más de 51,000 a septiembre de 2026. Consolidar a mano los archivos de cada programa para un donante arriesga contar dos veces a la misma mujer.
          </p>
          <p className="ui-note" style={{ marginTop: 'var(--s-2)' }}>Fuente: Guía institucional y técnica de EIRA para participantes (PDF del evento).</p>
        </div>
      </section>

      <section id="como-funciona">
        <h2>Cómo funciona, en tres pasos</h2>
        <div className="ld-steps">
          {STEPS.map((s, i) => (
            <div className="ld-step" key={s.title}>
              <div>
                <div className="ld-step-n">{i + 1}</div>
                <h3>{s.title}</h3>
                <p className="ld-lead">{s.text}</p>
              </div>
              <Plate>
                <img className="ld-shot" data-crop={s.crop || undefined} src={s.img} width={s.w} height={s.h} alt={s.alt} loading="lazy" />
              </Plate>
            </div>
          ))}
        </div>
      </section>

      <section className="ld-proof">
        <div>
          <h2>El caso práctico de la guía de EIRA</h2>
          <p className="ld-lead" style={{ marginTop: 'var(--s-3)' }}>
            Dos archivos ficticios: uno con 120 atenciones de tamizaje y otro con 80 participaciones en talleres. Algunas filas son de la misma mujer, escrita distinto en cada archivo.
          </p>
        </div>
        <div>
          <div className="ld-sum">
            120 + 80 = <s>200 mujeres</s>
          </div>
          <p className="ld-lead" style={{ marginTop: 'var(--s-3)' }}>
            Son 200 filas. Cuántas personas son lo decide quien valida cada coincidencia; mientras tanto la cifra se muestra como intervalo y dice "estimado, no oficial".
          </p>
          <p className="ui-note" style={{ marginTop: 'var(--s-2)' }}>Datos sintéticos generados para esta demo. Fuente del caso: Guía EIRA, Reto 3.</p>
        </div>
      </section>

      <section>
        <h2>Para quién</h2>
        <ul className="ld-who">
          <li>
            <strong>Laura, coordinadora de programa</strong>
            Sube sus archivos sin rehacer columnas.
          </li>
          <li>
            <strong>Coordinación, quien valida</strong>
            Decide si dos registros son la misma mujer. Nunca es automático.
          </li>
          <li>
            <strong>Dirección de EIRA</strong>
            Ve de un vistazo dónde llegaron y a cuántas, con fecha de corte y fuente.
          </li>
        </ul>
      </section>

      <section className="ld-ask">
        <h2>Pruébalo con el caso de la guía</h2>
        <p className="ld-lead">Un clic carga los tres archivos de demostración. No necesitas cuenta ni conexión con ningún servidor.</p>
        <Button variant="primary" onClick={start}>
          Probar con datos de demostración
        </Button>
      </section>

      <footer>
        <span>Huella Rosa · Reto 3 de EIRA Movimiento Rosa A.C. · Nerdearla Vibeathon by Devin, CDMX 2026.</span>
        <span>Todos los datos de la demo son sintéticos. Mapa base: Mapbox. Límites estatales: ver web/public/geo/SOURCE.md en el repositorio.</span>
      </footer>
    </div>
  )
}
