import { Component, type ErrorInfo, type ReactNode } from "react"

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hayError: boolean
}

/**
 * Error Boundary: atrapa los errores inesperados que ocurren al dibujar la aplicación y muestra un mensaje entendible en lugar de dejar la pantalla en blanco.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hayError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hayError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // El detalle técnico solo se guarda en la consola para el desarrollador, no se le muestra al usuario
    console.error("Error inesperado en la aplicación:", error, info.componentStack)
  }

  reintentar = () => {
    this.setState({ hayError: false })
  }

  irAlCatalogo = () => {
    window.location.hash = "#/"
    this.setState({ hayError: false })
  }

  render() {
    if (!this.state.hayError) return this.props.children

    return (
      <main className="error-page" role="alert">
        <div className="error-page__card">
          <h1 className="error-page__title">Algo salió mal</h1>
          <p className="error-page__text">
            Ocurrió un problema inesperado y no pudimos mostrar esta página.
            Tus datos guardados no se perdieron. Puedes intentarlo de nuevo o volver al catálogo.
          </p>
          <div className="error-page__actions">
            <button type="button" className="checkout-btn" onClick={this.reintentar}>Intentar de nuevo</button>
            <button type="button" className="checkout-btn checkout-btn--ghost" onClick={this.irAlCatalogo}>Ir al catálogo</button>
          </div>
        </div>
      </main>
    )
  }
}