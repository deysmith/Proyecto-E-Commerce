import { useState } from "react"
import type { MarcaTarjeta } from "./CardValidations"

interface MarcaInfo {
  nombre: MarcaTarjeta
  archivo: string
  clase: string
}

const MARCAS: MarcaInfo[] = [
  { nombre: "Visa", archivo: "visa.png", clase: "visa" },
  { nombre: "Mastercard", archivo: "mastercard.png", clase: "mastercard" },
  { nombre: "American Express", archivo: "americanexpress.png", clase: "amex" },
]

interface MarcasTarjetaProps {
  marcaDetectada: MarcaTarjeta | null
}

/**
 * Muestra las marcas de tarjeta que acepta la tienda.
 * Cuando el usuario escribe el número, la marca detectada se resalta y las demás se atenúan.
 * Si alguna imagen no carga, se muestra el nombre de la marca en texto para que nunca quede un espacio roto.
 */
export function MarcasTarjeta({ marcaDetectada }: MarcasTarjetaProps) {
  const [sinImagen, setSinImagen] = useState<string[]>([])

  return (
    <ul className="marcas" aria-label="Tarjetas aceptadas: Visa, Mastercard y American Express">
      {MARCAS.map((marca) => {
        const apagada = marcaDetectada !== null && marcaDetectada !== marca.nombre

        return (
          <li key={marca.nombre} className={apagada ? "marcas__item marcas__item--apagada" : "marcas__item"}>
            {sinImagen.includes(marca.nombre) ? (
              <span className="marcas__texto">{marca.nombre}</span>
            ) : (
              <img
                // BASE_URL es la ruta base del proyecto, así funciona también en GitHub Pages
                className={`marcas__img marcas__img--${marca.clase}`}
                src={`${import.meta.env.BASE_URL}tarjetas/${marca.archivo}`}
                alt={marca.nombre}
                onError={() => setSinImagen((anteriores) => [...anteriores, marca.nombre])}
              />
            )}
          </li>
        )
      })}
    </ul>
  )
}