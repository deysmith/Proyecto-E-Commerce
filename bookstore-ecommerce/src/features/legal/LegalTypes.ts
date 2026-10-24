/**
 * Tipos del contenido de las páginas informativas (términos, políticas y preguntas frecuentes).
 * El contenido se escribe como datos y una sola página (LegalPage) lo dibuja, así todas se ven igual
 * y agregar o cambiar un texto no requiere tocar el diseño.
 */

export type ClavePaginaLegal = "terminos" | "devoluciones" | "envios" | "privacidad" | "preguntas"

// Cada sección está hecha de bloques
export type BloqueLegal =
  | { tipo: "parrafo"; texto: string }
  | { tipo: "lista"; items: string[] }
  | { tipo: "pasos"; items: string[] }
  | { tipo: "aviso"; texto: string }
  | { tipo: "tabla"; encabezados: string[]; filas: string[][] }
  | { tipo: "pregunta"; pregunta: string; respuesta: string; enlace?: { texto: string; clave: ClavePaginaLegal } }

export interface SeccionLegal {
  // Se usa para el id de la sección y para el índice lateral
  id: string
  titulo: string
  bloques: BloqueLegal[]
}

// Dato clave que se muestra arriba de la página
export interface DestacadoLegal {
  valor: string
  etiqueta: string
}

export interface PaginaLegal {
  clave: ClavePaginaLegal
  ruta: string
  titulo: string
  // Nombre corto para el menú lateral
  tituloCorto: string
  descripcion?: string
  destacados?: DestacadoLegal[]
  secciones: SeccionLegal[]
}