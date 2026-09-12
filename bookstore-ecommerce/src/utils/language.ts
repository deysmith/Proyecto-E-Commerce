/**
 * Traduce el código de idioma por su nombre
 * @param language - Código del idioma
 * @returns EL nombre del idioma en español
 */
export function translateLanguage(language: string): string {
  if (language === "en") {
    return "Inglés"
  }

  if (language === "es") {
    return "Español"
  }

  return language
}