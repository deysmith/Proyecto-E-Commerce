import { useState, type FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Footer } from "../components/Footer"
import { Header } from "../components/Header"
import { useSession } from "../features/session/sessionContext"
import { validarCredenciales } from "../features/session/authService"
import { useCart } from "../features/carrito-de-compras/useCart"

// Alturas y colores de los lomos del estante decorativo
const LOMOS = [
  { alto: 78, color: "var(--color-accent)" },
  { alto: 92, color: "#E7E7E5" },
  { alto: 70, color: "#3D6F72" },
  { alto: 96, color: "var(--color-accent-soft)" },
  { alto: 84, color: "#F4F2F1" },
  { alto: 62, color: "var(--color-accent-strong)" },
  { alto: 88, color: "#6A8F90" },
  { alto: 74, color: "#E7E7E5" },
  { alto: 98, color: "var(--color-accent)" },
  { alto: 66, color: "var(--color-accent-soft)" },
  { alto: 90, color: "#3D6F72" },
  { alto: 80, color: "#F4F2F1" },
]

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const { user, signIn } = useSession()
  const { totals } = useCart()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [clave, setClave] = useState("")
  const [mostrarClave, setMostrarClave] = useState(false)
  // Errores de cada campo (formato) y error general (credenciales o servicio)
  const [errorEmail, setErrorEmail] = useState("")
  const [errorClave, setErrorClave] = useState("")
  const [errorGeneral, setErrorGeneral] = useState("")
  // Mientras se consulta a Algolia se bloquea el botón para no enviar dos veces
  const [validando, setValidando] = useState(false)
  // Libros que el invitado tiene en el carrito y que se pierden al iniciar sesión
  const librosInvitado = user ? 0 : totals.totalUnidades
  // Página a la que vuelve después de iniciar sesión
  const destination = (location.state as { from?: string } | null)?.from ?? "/"

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (validando) return

    const normalizedEmail = email.trim().toLowerCase()
    const nuevoErrorEmail = CORREO_VALIDO.test(normalizedEmail) ? "" : "Escribe un correo como nombre@correo.com."
    const nuevoErrorClave = clave ? "" : "Escribe tu contraseña."
    setErrorEmail(nuevoErrorEmail)
    setErrorClave(nuevoErrorClave)
    setErrorGeneral("")
    if (nuevoErrorEmail || nuevoErrorClave) return

    setValidando(true)
    const resultado = await validarCredenciales(normalizedEmail, clave)
    setValidando(false)

    if (!resultado.ok) {
      setErrorGeneral(resultado.error)
      return
    }

    signIn(resultado.usuario)
    navigate(destination, { replace: true })
  }

  return (
    <div className="catalog-shell">
      <Header />
      <main className="login-page">
        <section className="login-card">
          <aside className="login-aside" aria-hidden="true">
            <p className="login-aside__titular">Tu próxima lectura te está esperando.</p>
            <ul className="login-aside__lista">
              <li>Retoma los libros que viste</li>
              <li>Recibe recomendaciones según lo que buscas</li>
              <li>Encuentra tu carrito tal como lo dejaste</li>
            </ul>
            <div className="login-estante">
              {LOMOS.map((lomo, index) => (
                <span key={index} style={{ height: `${lomo.alto}%`, background: lomo.color }} />
              ))}
            </div>
          </aside>

          <div className="login-formulario">
            <h1 id="login-title">Inicia sesión</h1>
            <p className="login-formulario__intro">Usa el correo y la contraseña de tu cuenta Booksmart.</p>

            {librosInvitado > 0 && (
              <p className="login-aviso" role="note">
                Tienes {librosInvitado} {librosInvitado === 1 ? "libro" : "libros"} en el carrito. Al iniciar sesión
                se cargará el carrito de tu cuenta y {librosInvitado === 1 ? "ese libro se eliminará" : "esos libros se eliminarán"}.
              </p>
            )}

            <form onSubmit={submit} noValidate aria-labelledby="login-title">
              {errorGeneral && (
                <p className="login-alerta" role="alert">{errorGeneral}</p>
              )}

              <div className="login-campo">
                <label htmlFor="login-email">Correo electrónico</label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setErrorEmail("")
                    setErrorGeneral("")
                  }}
                  placeholder="nombre@correo.com"
                  aria-invalid={errorEmail !== ""}
                  aria-describedby={errorEmail ? "login-email-error" : undefined}
                />
                {errorEmail && <p id="login-email-error" className="login-campo__error">{errorEmail}</p>}
              </div>

              <div className="login-campo">
                <label htmlFor="login-clave">Contraseña</label>
                <div className="login-campo__clave">
                  <input
                    id="login-clave"
                    type={mostrarClave ? "text" : "password"}
                    autoComplete="current-password"
                    value={clave}
                    onChange={(event) => {
                      setClave(event.target.value)
                      setErrorClave("")
                      setErrorGeneral("")
                    }}
                    aria-invalid={errorClave !== ""}
                    aria-describedby={errorClave ? "login-clave-error" : undefined}
                  />
                  <button
                    type="button"
                    className="login-campo__ver"
                    onClick={() => setMostrarClave(!mostrarClave)}
                    aria-pressed={mostrarClave}
                    aria-controls="login-clave"
                  >
                    {mostrarClave ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                {errorClave && <p id="login-clave-error" className="login-campo__error">{errorClave}</p>}
              </div>

              <button type="submit" className="login-enviar" disabled={validando}>
                {validando && <span className="login-enviar__spinner" aria-hidden="true" />}
                {validando ? "Validando cuenta..." : "Iniciar sesión"}
              </button>
            </form>

            <p className="login-formulario__invitado">
              ¿Solo quieres mirar? <Link to="/">Seguir como invitado</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}