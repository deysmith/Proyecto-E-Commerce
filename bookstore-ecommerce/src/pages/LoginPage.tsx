import { useState, type FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Footer } from "../components/Footer"
import { Header } from "../components/Header"
import { useSession } from "../features/session/sessionContext"
import { validarCredenciales } from "../features/session/authService"

export default function LoginPage() {
  const { signIn } = useSession()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [clave, setClave] = useState("")
  const [error, setError] = useState("")
  const [validando, setValidando] = useState(false)
  const destination = (location.state as { from?: string } | null)?.from ?? "/"

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (validando) return

    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Escribe un correo electrónico válido.")
      return
    }
    if (!clave) {
      setError("Escribe tu contraseña.")
      return
    }

    setValidando(true)
    const resultado = await validarCredenciales(normalizedEmail, clave)
    setValidando(false)

    if (!resultado.ok) {
      setError(resultado.error)
      return
    }

    signIn(resultado.usuario)
    navigate(destination, { replace: true })
  }

  return (
    <div className="catalog-shell">
      <Header />
      <main className="session-page">
        <section className="session-panel" aria-labelledby="login-title">
          <p className="eyebrow">Booksmart · Tu espacio</p>
          <h1 id="login-title">Iniciar sesión</h1>
          <p className="session-panel__intro">Continúa tu recorrido por el catálogo.</p>

          <form className="session-form" onSubmit={submit} noValidate>
            <label htmlFor="login-email">Correo electrónico</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setError("")
              }}
              placeholder="nombre@correo.com"
            />

            <label htmlFor="login-clave">Contraseña</label>
            <input
              id="login-clave"
              type="password"
              autoComplete="current-password"
              value={clave}
              onChange={(event) => {
                setClave(event.target.value)
                setError("")
              }}
            />

            {error && <p className="session-form__error" role="alert">{error}</p>}
            <button type="submit" className="session-form__submit" disabled={validando}>
              {validando ? "Validando..." : "Ingresar"}
            </button>
          </form>

          <Link className="session-panel__back" to="/">Volver al catálogo</Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}