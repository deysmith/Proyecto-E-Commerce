/**
 * Tipos de los datos que se piden durante el checkout.
 */

// Información del comprador
export interface DatosComprador {
  nombreCompleto: string
  correo: string
  telefono: string
}

export type CampoComprador = keyof DatosComprador

// Mensaje de error en cada campo del formulario de checkout. Se usa Partial para que no sea obligatorio tener un mensaje de error para cada campo.
export type ErroresComprador = Partial<Record<CampoComprador, string>>

// Valores iniciales del formulario
export const compradorVacio: DatosComprador = {
  nombreCompleto: "",
  correo: "",
  telefono: "",
}

// Información de entrega
export interface DatosEntrega {
  provincia: number | null
  canton: number | null
  distrito: number | null
  direccion: string
  infoAdicional: string
}

export type CampoEntrega = keyof DatosEntrega

export type ErroresEntrega = Partial<Record<CampoEntrega, string>>

export const entregaVacia: DatosEntrega = {
  provincia: null,
  canton: null,
  distrito: null,
  direccion: "",
  infoAdicional: "",
}