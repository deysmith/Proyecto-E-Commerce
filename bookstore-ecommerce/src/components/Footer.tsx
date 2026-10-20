import { Link } from "react-router-dom"

const legalLinks = [
  { to: "/terminos-y-condiciones", label: "Términos y Condiciones" },
  { to: "/politica-de-devoluciones", label: "Política de Devoluciones" },
  { to: "/politica-de-envios", label: "Política de Envíos" },
  { to: "/politica-de-privacidad", label: "Política de Privacidad" },
  { to: "/preguntas-frecuentes", label: "Preguntas Frecuentes (FAQ)" },
]

export function Footer() {
  return (
    <footer className="catalog-footer">
      <div className="catalog-footer__details">
        <span>Comercio Electrónico</span>
        <span>Limón, Costa Rica · CRC</span>
      </div>

      <nav className="catalog-footer__legal" aria-label="Información y políticas">
        <ul>
          {legalLinks.map(({ to, label }) => (
            <li key={to}>
              <Link to={to}>{label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  )
}