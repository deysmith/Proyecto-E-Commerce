/**
 * Íconos SVG pequeños que usa el carrito.
 * Usan currentColor para tomar el color del texto donde se colocan.
 */

export function MinusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  )
}

export function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
    </svg>
  )
}

export function TruckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </svg>
  )
}

/**
 * Ilustración de una pila de libros para el carrito vacío
 */
export function EmptyBooksIllustration() {
  return (
    <svg width="132" height="112" viewBox="0 0 132 112" fill="none" aria-hidden="true">
      <rect x="18" y="84" width="96" height="18" rx="3" fill="var(--color-primary)" />
      <rect x="18" y="84" width="10" height="18" fill="var(--color-accent)" />
      <rect x="26" y="64" width="82" height="18" rx="3" fill="var(--color-accent-soft)" />
      <path d="M34 70h40" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
      <rect x="22" y="44" width="88" height="18" rx="3" transform="rotate(-4 22 44)" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="2" />
      <path d="M86 18v22l6-5 6 5V18" fill="var(--color-accent)" />
      <path d="M2 104h128" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}