import { useState, type FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Footer } from "../components/Footer"
import { Header } from "../components/Header"
import { useSession } from "../features/session/sessionContext"

export default function LoginPage() {
  const { signIn } = useSession()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const destination = (location.state as { from?: string } | null)?.from ?? "/analytics"

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Escribe un correo electrónico válido.")
      return
    }

    const name = normalizedEmail.split("@")[0].replace(/[._-]+/g, " ")
    signIn(normalizedEmail, name)
    navigate(destination, { replace: true })
  }

  return (
    
    <div className="catalog-shell">
      <Header />
      <div className="detail-page">
        <button
          className="detail-back"
          onClick={() => navigate(-1)}
        >
          Volver
        </button>
      </div>
      <main className="session-page">
        <section className="session-panel" aria-labelledby="login-title">
          <p className="eyebrow">Booksmart · Tu espacio</p>
          <h1 id="login-title">Iniciar sesión</h1>
          <p className="session-panel__intro">Continúa tu recorrido por el catálogo.</p>

          <form className="session-form" onSubmit={submit}>
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
              required
            />
            {error && <p className="session-form__error" role="alert">{error}</p>}
            <button type="submit" className="session-form__submit">Ingresar</button>
          </form>

          <p className="session-panel__note">
            Acceso de demostración: la sesión se guarda en este navegador y no valida cuentas en un servidor.
          </p>
          <Link className="session-panel__back" to="/">Volver al catálogo</Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}