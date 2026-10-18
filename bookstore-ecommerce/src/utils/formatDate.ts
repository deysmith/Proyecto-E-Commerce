/**
 * Formatea una fecha ISO para mostrarla al usuario.
 */
export function formatDate(fechaIso: string) {
  const fecha = new Date(fechaIso)

  // Si la fecha está dañada se muestra vacío en vez de "Invalid Date"
  if (Number.isNaN(fecha.getTime())) return ""

  return new Intl.DateTimeFormat("es-CR", { dateStyle: "long", timeStyle: "short" }).format(fecha)
}