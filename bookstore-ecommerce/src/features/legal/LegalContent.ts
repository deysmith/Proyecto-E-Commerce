import { ENVIO_GRATIS_DESDE, ENVIO_MAXIMO, ENVIO_MINIMO, ENVIO_PORCENTAJE, IVA_RATE, getShippingCost } from "../carrito-de-compras/CartCalculations"
import { MAX_INTENTOS_PAGO } from "../ordenes/OrderPayment"
import { formatPrice } from "../../utils/formatPrice"
import {
  CORREO_ATENCION,
  DIAS_DEVOLUCION_DEFECTO,
  DIAS_DEVOLUCION_GENERAL,
  DIAS_REEMBOLSO,
  HORARIO_ATENCION,
  NOMBRE_TIENDA,
  RESPUESTA_ATENCION,
} from "./InfoTienda"
import type { ClavePaginaLegal, PaginaLegal } from "./LegalTypes"

/**
 * Contenido de la sección de información comercial de Booksmart.
 * Los montos y porcentajes (envío, IVA, intentos de pago) se leen de las mismas constantes que usa el carrito
 * y el checkout, así el texto de las políticas siempre coincide con lo que la tienda realmente cobra y hace.
 * Los textos son propios de la tienda y están escritos para el modelo de negocio de Booksmart.
 */

const ivaTexto = `${Math.round(IVA_RATE * 100)}\u00a0%`
const envioPorcentajeTexto = `${Math.round(ENVIO_PORCENTAJE * 100)}\u00a0%`
const envioMinimoTexto = formatPrice(ENVIO_MINIMO)
const envioMaximoTexto = formatPrice(ENVIO_MAXIMO)
const envioGratisTexto = formatPrice(ENVIO_GRATIS_DESDE)

// Subtotales de ejemplo para la tabla de costos de envío. El costo sale de la misma función que usa el carrito.
const SUBTOTALES_EJEMPLO = [8000, 20000, 30000, 39000, ENVIO_GRATIS_DESDE]
const filasEjemploEnvio = SUBTOTALES_EJEMPLO.map((subtotal) => {
  const envio = getShippingCost(subtotal)
  return [formatPrice(subtotal), envio === 0 ? "Gratis" : formatPrice(envio)]
})

const terminos: PaginaLegal = {
  clave: "terminos",
  ruta: "/terminos-y-condiciones",
  titulo: "Términos y Condiciones",
  tituloCorto: "Términos y Condiciones",
  destacados: [
    { valor: "CRC", etiqueta: "Todos los precios están en colones costarricenses" },
    { valor: ivaTexto, etiqueta: "IVA, desglosado en el resumen de tu compra" },
    { valor: `${MAX_INTENTOS_PAGO} intentos`, etiqueta: "Para completar el pago de cada orden" },
  ],
  secciones: [
    {
      id: "condiciones-de-uso",
      titulo: "Condiciones de uso del sitio",
      bloques: [
        {
          tipo: "parrafo",
          texto: `${NOMBRE_TIENDA} es una librería virtual con sede en Limón, Costa Rica, que ofrece libros de distintas categorías a personas compradoras dentro del territorio nacional. Al navegar por el sitio, agregar libros al carrito o realizar una compra, aceptas estas condiciones.`,
        },
        {
          tipo: "lista",
          items: [
            "Puedes consultar el catálogo, buscar y filtrar libros sin necesidad de crear una cuenta.",
            "El sitio debe usarse de forma lícita y de buena fe: no está permitido alterar su funcionamiento, intentar acceder a información de otras personas ni usarlo con fines fraudulentos.",
            "La información bibliográfica, las descripciones y las portadas de los libros provienen de Google Books y pertenecen a sus respectivos titulares. " + NOMBRE_TIENDA + " no reclama derechos sobre ese material.",
            `El nombre, el diseño y los textos propios de ${NOMBRE_TIENDA} no pueden copiarse ni reutilizarse sin autorización.`,
          ],
        },
        {
          tipo: "aviso",
          texto: `${NOMBRE_TIENDA} funciona actualmente en ambiente de pruebas. Puedes recorrer todo el proceso de compra, pero los pagos son simulados: no se realiza ningún cobro real ni se despachan libros físicos. Por favor, no ingreses los datos de tu tarjeta personal.`,
        },
      ],
    },
    {
      id: "condiciones-generales-de-compra",
      titulo: "Condiciones generales de compra",
      bloques: [
        {
          tipo: "lista",
          items: [
            `Los precios del catálogo se muestran en colones costarricenses (CRC) y no incluyen IVA. El resumen de tu compra desglosa el subtotal de los libros, el IVA (${ivaTexto}), el costo de envío y el total a pagar.`,
            "Agregar un libro al carrito no lo reserva ni garantiza su disponibilidad: esta se confirma cuando se procesa tu orden.",
            "Al confirmar el resumen de tu compra se genera una orden con un número único (por ejemplo, BKS-20261023-A7K2MX) que inicia en estado Pendiente.",
            "La compra se considera completada solo cuando el pago es aprobado. En ese momento la orden pasa a Confirmada y se muestra tu comprobante.",
            "Si el pago es rechazado o el servicio de pago presenta un error, la orden no se confirma y no se te cobra nada.",
            `Cada orden admite hasta ${MAX_INTENTOS_PAGO} intentos de pago. Si se agotan, la orden queda como Fallida y puedes generar una nueva desde tu carrito, que se conserva intacto.`,
            "Aceptamos tarjetas Visa, Mastercard y American Express.",
            "Al aceptar estos términos en el resumen de tu compra, la aceptación queda registrada en tu orden junto con su fecha y la versión vigente de los documentos.",
            "Si detectamos un error evidente de precio o de disponibilidad, podremos cancelar la orden y reembolsar cualquier monto cobrado, avisándote por el correo o el teléfono que registraste.",
          ],
        },
      ],
    },
    {
      id: "responsabilidades-del-cliente",
      titulo: "Responsabilidades del cliente",
      bloques: [
        {
          tipo: "parrafo",
          texto: "Para que tu pedido llegue bien y a tiempo, te pedimos:",
        },
        {
          tipo: "lista",
          items: [
            "Ser mayor de edad o contar con la autorización de tu madre, padre o persona encargada.",
            "Proporcionar datos verdaderos, completos y actualizados (nombre, correo, teléfono y dirección). Un dato incorrecto puede retrasar o impedir la entrega.",
            "Revisar el resumen antes de confirmar: libros, cantidades, montos y dirección de entrega.",
            "Usar únicamente medios de pago propios o que estés autorizado a utilizar, y custodiar sus datos.",
            "Recibir el pedido, o designar a alguien para hacerlo, en la dirección indicada.",
            "Revisar el estado del paquete al recibirlo y reportar cualquier daño dentro de los plazos de la Política de Devoluciones.",
          ],
        },
      ],
    },
    {
      id: "responsabilidades-de-la-tienda",
      titulo: "Responsabilidades de la tienda",
      bloques: [
        {
          tipo: "parrafo",
          texto: `Por su parte, ${NOMBRE_TIENDA} se compromete a:`,
        },
        {
          tipo: "lista",
          items: [
            "Mostrar los precios, la disponibilidad y las descripciones de los libros de forma clara y veraz.",
            "Procesar y despachar las órdenes confirmadas en los tiempos indicados en la Política de Envíos.",
            "Proteger tus datos personales según la Política de Privacidad y no almacenar nunca el número completo ni el código de seguridad de tu tarjeta.",
            "Atender consultas, reclamos y devoluciones conforme a la Política de Devoluciones y por los canales de atención al cliente.",
            "Informarte oportunamente si una orden no puede cumplirse y reembolsar lo que se haya cobrado.",
          ],
        },
        {
          tipo: "parrafo",
          texto: `${NOMBRE_TIENDA} no se hace responsable por retrasos o interrupciones causados por circunstancias fuera de su control (fallas de internet, eventos climáticos, cierres de carreteras o casos de fuerza mayor), ni por datos erróneos suministrados por la persona compradora.`,
        },
      ],
    },
    {
      id: "modificaciones",
      titulo: "Modificaciones de estos términos",
      bloques: [
        {
          tipo: "parrafo",
          texto: "Podemos actualizar estos términos para reflejar cambios en la tienda. La versión vigente se identifica con su número y fecha al inicio de esta página. Las órdenes ya confirmadas se rigen por la versión que aceptaste al comprar.",
        },
      ],
    },
  ],
}

const devoluciones: PaginaLegal = {
  clave: "devoluciones",
  ruta: "/politica-de-devoluciones",
  titulo: "Política de Devoluciones",
  tituloCorto: "Devoluciones",
  descripcion: "Queremos que te quedes con libros que disfrutes. Si algo no sale como esperabas, aquí te explicamos cómo resolverlo.",
  destacados: [
    { valor: `${DIAS_DEVOLUCION_GENERAL} días`, etiqueta: "Para devolver un libro por cambio de opinión" },
    { valor: `${DIAS_DEVOLUCION_DEFECTO} días`, etiqueta: "Si llega dañado, defectuoso o equivocado" },
    { valor: "Mismo medio", etiqueta: "De pago para recibir tu reembolso" },
  ],
  secciones: [
    {
      id: "plazo",
      titulo: "Plazo para solicitar devoluciones",
      bloques: [
        {
          tipo: "parrafo",
          texto: "El plazo se cuenta en días naturales a partir de la fecha en que recibes tu pedido.",
        },
        {
          tipo: "tabla",
          encabezados: ["Motivo de la devolución", "Plazo para solicitarla"],
          filas: [
            ["Cambio de opinión o compra por error", `${DIAS_DEVOLUCION_GENERAL} días naturales`],
            ["Libro dañado en el transporte, con defecto de impresión o encuadernación, o distinto al que pediste", `${DIAS_DEVOLUCION_DEFECTO} días naturales`],
          ],
        },
        {
          tipo: "parrafo",
          texto: "Esta política no limita los derechos que la legislación costarricense de protección al consumidor te reconoce.",
        },
      ],
    },
    {
      id: "condiciones",
      titulo: "Condiciones para aprobar una devolución",
      bloques: [
        {
          tipo: "lista",
          items: [
            "Indicar el número de orden de una compra confirmada (tiene el formato BKS-AAAAMMDD-XXXXXX).",
            "En devoluciones por cambio de opinión, el libro debe estar en perfecto estado: sin uso, sin subrayados, anotaciones, dobleces ni marcas, y con su empaque original si lo tenía.",
            "En devoluciones por daño, defecto o error en el envío, adjuntar fotografías del libro y del empaque para agilizar la revisión.",
            "Devolver el libro completo, junto con cualquier material adicional que haya venido con él.",
          ],
        },
      ],
    },
    {
      id: "casos-no-aceptados",
      titulo: "Casos en los que no se aceptan devoluciones",
      bloques: [
        {
          tipo: "lista",
          items: [
            "Solicitudes presentadas fuera de los plazos indicados.",
            "Libros con señales de uso, subrayados, anotaciones, humedad, páginas dobladas o daños ocasionados después de la entrega.",
            "Compras cuyo número de orden no se pueda verificar o que no estén en estado Confirmada.",
            "Órdenes en estado Pendiente o Fallida, porque en ellas no se realizó ningún cobro.",
            "Libros enviados de vuelta sin que la solicitud haya sido aprobada previamente.",
          ],
        },
      ],
    },
    {
      id: "procedimiento",
      titulo: "Procedimiento para gestionar solicitudes",
      bloques: [
        {
          tipo: "pasos",
          items: [
            `Escríbenos a ${CORREO_ATENCION} con el asunto «Devolución» e indica tu número de orden, el libro y el motivo. Si hubo daño o error, adjunta fotografías.`,
            `Revisaremos tu caso y te responderemos en un máximo de ${RESPUESTA_ATENCION} con la aprobación o con la información que haga falta.`,
            "Si se aprueba, te indicaremos cómo y adónde enviar el libro. Empácalo bien para que llegue en buen estado.",
            "Cuando recibamos el libro y lo revisemos, te confirmaremos el reembolso.",
            `El reembolso se hace al mismo medio de pago que usaste, por el valor del libro con su IVA, en un plazo de hasta ${DIAS_REEMBOLSO} días hábiles.`,
          ],
        },
        {
          tipo: "aviso",
          texto: "Si la devolución se debe a un error nuestro o a un libro dañado o defectuoso, cubrimos el envío de regreso y también te reembolsamos el costo de envío original. En un cambio de opinión, el envío de regreso corre por tu cuenta y el costo de envío original no es reembolsable.",
        },
      ],
    },
  ],
}

const envios: PaginaLegal = {
  clave: "envios",
  ruta: "/politica-de-envios",
  titulo: "Política de Envíos",
  tituloCorto: "Envíos",
  descripcion: "Cómo, cuándo y a qué costo llegan tus libros a la puerta de tu casa.",
  destacados: [
    { valor: `${envioMinimoTexto} – ${envioMaximoTexto}`, etiqueta: "Costo de envío, según el subtotal de tus libros" },
    { valor: "Gratis", etiqueta: `En compras con un subtotal de ${envioGratisTexto} o más` },
    { valor: "1 a 6 días", etiqueta: "Hábiles de entrega, según tu provincia" },
  ],
  secciones: [
    {
      id: "cobertura",
      titulo: "Cobertura de entrega",
      bloques: [
        {
          tipo: "parrafo",
          texto: "Entregamos en todo el territorio de Costa Rica, en las siete provincias: San José, Alajuela, Cartago, Heredia, Guanacaste, Puntarenas y Limón. Selecciona tu provincia, cantón y distrito en el formulario de entrega durante el checkout.",
        },
        {
          tipo: "lista",
          items: [
            "Por ahora no realizamos envíos al extranjero.",
            "Entregamos en la dirección exacta que indicas en el checkout; no hacemos entregas en apartados postales.",
          ],
        },
      ],
    },
    {
      id: "tiempos",
      titulo: "Tiempos estimados de envío",
      bloques: [
        {
          tipo: "parrafo",
          texto: "Preparamos tu pedido en 1 a 2 días hábiles después de que el pago es aprobado. A partir de ese momento, el tiempo de entrega depende de tu provincia:",
        },
        {
          tipo: "tabla",
          encabezados: ["Provincia", "Entrega estimada"],
          filas: [
            ["Limón", "1 a 3 días hábiles"],
            ["San José, Alajuela, Cartago y Heredia", "2 a 4 días hábiles"],
            ["Guanacaste y Puntarenas", "3 a 6 días hábiles"],
          ],
        },
        {
          tipo: "parrafo",
          texto: "Son estimaciones, no garantías: los feriados, los fines de semana y las condiciones del clima pueden extender el plazo. Los días hábiles no incluyen sábados, domingos ni feriados.",
        },
      ],
    },
    {
      id: "costos",
      titulo: "Costos de envío",
      bloques: [
        {
          tipo: "parrafo",
          texto: `El costo de envío se calcula automáticamente con el subtotal de los libros de tu carrito (sin IVA): corresponde al ${envioPorcentajeTexto} del subtotal, con un mínimo de ${envioMinimoTexto} y un máximo de ${envioMaximoTexto}. Si el subtotal es de ${envioGratisTexto} o más, el envío es gratis.`,
        },
        {
          tipo: "tabla",
          encabezados: ["Subtotal de los libros (sin IVA)", "Costo de envío"],
          filas: filasEjemploEnvio,
        },
        {
          tipo: "parrafo",
          texto: `Verás el costo de envío en el resumen de tu compra antes de pagar, junto con el IVA (${ivaTexto}) calculado sobre el subtotal de los libros. Ese monto no cambia después de que confirmas tu orden.`,
        },
      ],
    },
    {
      id: "restricciones",
      titulo: "Restricciones y condiciones especiales",
      bloques: [
        {
          tipo: "lista",
          items: [
            "Alguien debe recibir el pedido en la dirección indicada. Si nadie está disponible, intentaremos comunicarnos al teléfono que registraste para reprogramar la entrega.",
            "Si el pedido no se puede entregar tras dos intentos, regresa a la tienda y te contactaremos para coordinar un nuevo envío. Si el problema se debió a datos incorrectos, el costo del reenvío corre por cuenta de la persona compradora.",
            "Las zonas de difícil acceso pueden requerir hasta 3 días hábiles adicionales.",
            "Los pedidos con muchos libros pueden dividirse en más de un paquete, sin costo adicional.",
            `Si necesitas cambiar la dirección, escríbenos a ${CORREO_ATENCION} con tu número de orden antes de que el pedido salga de la tienda.`,
            "Revisa el paquete al recibirlo. Si llega dañado, repórtalo según la Política de Devoluciones.",
          ],
        },
      ],
    },
  ],
}

const privacidad: PaginaLegal = {
  clave: "privacidad",
  ruta: "/politica-de-privacidad",
  titulo: "Política de Privacidad",
  tituloCorto: "Privacidad",
  descripcion: "Qué datos usamos, para qué los usamos y cómo los cuidamos. Pedimos solo lo necesario para que tu compra llegue.",
  destacados: [
    { valor: "Solo lo necesario", etiqueta: "Pedimos únicamente los datos para procesar tu compra" },
    { valor: "Nunca", etiqueta: "Guardamos tu tarjeta completa ni su código de seguridad" },
    { valor: "Tú decides", etiqueta: "Puedes pedir acceso, corrección o eliminación de tus datos" },
  ],
  secciones: [
    {
      id: "informacion-recopilada",
      titulo: "Información que recopila la tienda",
      bloques: [
        {
          tipo: "parrafo",
          texto: "Recopilamos únicamente los datos necesarios para procesar y entregar tus compras:",
        },
        {
          tipo: "lista",
          items: [
            "Datos del comprador: nombre completo, correo electrónico y teléfono.",
            "Datos de entrega: provincia, cantón, distrito, dirección exacta e indicaciones adicionales.",
            "Datos de la orden: libros, cantidades, montos, fecha, estado de la orden y del pago, y la aceptación de los términos con su versión.",
            "Datos de navegación: tu carrito y búsquedas recientes se guardan en tu propio navegador para mejorar tu experiencia.",
          ],
        },
      ],
    },
    {
      id: "uso-de-la-informacion",
      titulo: "Uso de la información del cliente",
      bloques: [
        {
          tipo: "lista",
          items: [
            "Generar, procesar y confirmar tu orden, y mostrarte tu comprobante.",
            "Coordinar la entrega de tus libros y contactarte si hay algún inconveniente con tu pedido.",
            "Atender tus consultas, reclamos y devoluciones.",
            "Cumplir con las obligaciones legales y contables asociadas a una venta.",
          ],
        },
        {
          tipo: "parrafo",
          texto: "No vendemos, alquilamos ni cedemos tus datos personales con fines publicitarios. Solo los compartimos con quienes son indispensables para completar tu compra: el proveedor de pagos, para procesar el cobro, y el servicio de mensajería, para entregar tu pedido (nombre, teléfono y dirección). La búsqueda del catálogo funciona con Algolia, que recibe únicamente los términos que escribes.",
        },
      ],
    },
    {
      id: "proteccion-de-datos",
      titulo: "Medidas básicas de protección de datos",
      bloques: [
        {
          tipo: "lista",
          items: [
            "El sitio se sirve mediante una conexión cifrada (HTTPS).",
            "Validamos los datos que ingresas antes de procesarlos, y el formulario de pago oculta el código de seguridad de la tarjeta mientras lo escribes.",
            "El número completo de tu tarjeta se envía únicamente al proveedor de pagos para autorizar el cobro y no se almacena en " + NOMBRE_TIENDA + ".",
            "Limitamos el acceso a tus datos a quienes los necesitan para atender tu orden.",
          ],
        },
        {
          tipo: "aviso",
          texto: "En esta versión de pruebas, tu carrito y tus órdenes se guardan en el almacenamiento local de tu propio navegador, no en un servidor de Booksmart. Puedes borrarlos en cualquier momento limpiando los datos del sitio desde la configuración de tu navegador.",
        },
      ],
    },
    {
      id: "tus-derechos",
      titulo: "Tus derechos",
      bloques: [
        {
          tipo: "parrafo",
          texto: `Puedes pedirnos acceso a tus datos, corregirlos o solicitar que los eliminemos. Escríbenos a ${CORREO_ATENCION} con el asunto «Datos personales» y respondemos en un máximo de 5 días hábiles. Para atender tu solicitud podremos pedirte que confirmes tu identidad con el número de una orden.`,
        },
      ],
    },
    {
      id: "cambios-a-esta-politica",
      titulo: "Cambios a esta política",
      bloques: [
        {
          tipo: "parrafo",
          texto: "Si cambiamos la forma en que tratamos tus datos, actualizaremos esta página e indicaremos la nueva versión y fecha al inicio de ella.",
        },
      ],
    },
  ],
}

const preguntas: PaginaLegal = {
  clave: "preguntas",
  ruta: "/preguntas-frecuentes",
  titulo: "Preguntas Frecuentes (FAQ)",
  tituloCorto: "Preguntas frecuentes",
  descripcion: "Respuestas rápidas a las dudas más comunes sobre compras, pagos, envíos, devoluciones y atención al cliente.",
  secciones: [
    {
      id: "compras",
      titulo: "Compras",
      bloques: [
        {
          tipo: "pregunta",
          pregunta: "¿Necesito crear una cuenta para comprar?",
          respuesta: "No. Puedes explorar el catálogo, armar tu carrito y comprar sin registrarte. Solo te pedimos tus datos de comprador y de entrega durante el checkout.",
        },
        {
          tipo: "pregunta",
          pregunta: "¿Cómo puedo realizar una compra?",
          respuesta: "Agrega los libros al carrito, revisa las cantidades y los montos, y continúa al checkout. Completa tus datos de comprador y de entrega, revisa el resumen, acepta los Términos y Condiciones y paga con tarjeta. Cuando el pago sea aprobado verás tu número de orden.",
        },
        {
          tipo: "pregunta",
          pregunta: "¿Mi carrito se pierde si cierro la página?",
          respuesta: "No. El carrito se guarda en tu navegador y lo recuperas al volver, siempre que uses el mismo navegador y no borres los datos del sitio.",
        },
      ],
    },
    {
      id: "pagos",
      titulo: "Pagos",
      bloques: [
        {
          tipo: "pregunta",
          pregunta: "¿Qué métodos de pago se aceptan?",
          respuesta: "Aceptamos tarjetas de crédito y débito Visa, Mastercard y American Express.",
        },
        {
          tipo: "pregunta",
          pregunta: "¿Los precios incluyen IVA?",
          respuesta: `No. Los precios del catálogo no incluyen IVA. El impuesto (${ivaTexto}) se suma y se muestra desglosado en el resumen de tu compra, antes de que pagues.`,
        },
        {
          tipo: "pregunta",
          pregunta: "¿Qué pasa si mi pago es rechazado o falla?",
          respuesta: `Te avisamos de inmediato y no se te cobra nada. Tu orden sigue pendiente y puedes intentarlo de nuevo o usar otra tarjeta, hasta ${MAX_INTENTOS_PAGO} veces. Si se agotan los intentos, la orden queda como fallida y tu carrito sigue intacto para que generes una nueva.`,
        },
        {
          tipo: "pregunta",
          pregunta: "¿Es seguro pagar en Booksmart?",
          respuesta: `Nunca guardamos el número completo de tu tarjeta ni su código de seguridad: solo la marca y los últimos 4 dígitos. Además, ${NOMBRE_TIENDA} funciona en ambiente de pruebas, por lo que ningún cobro es real. No ingreses los datos de tu tarjeta personal.`,
          enlace: { texto: "Ver la Política de Privacidad", clave: "privacidad" },
        },
      ],
    },
    {
      id: "envios",
      titulo: "Envíos",
      bloques: [
        {
          tipo: "pregunta",
          pregunta: "¿Cuánto cuesta el envío?",
          respuesta: `El envío es el ${envioPorcentajeTexto} del subtotal de tus libros, con un mínimo de ${envioMinimoTexto} y un máximo de ${envioMaximoTexto}. Si tu subtotal es de ${envioGratisTexto} o más, el envío es gratis.`,
          enlace: { texto: "Ver la Política de Envíos", clave: "envios" },
        },
        {
          tipo: "pregunta",
          pregunta: "¿Cuánto tarda en llegar mi pedido?",
          respuesta: "Preparamos tu pedido en 1 a 2 días hábiles y luego la entrega tarda entre 1 y 6 días hábiles, según tu provincia: Limón es la más rápida y Guanacaste y Puntarenas las que más tardan.",
        },
        {
          tipo: "pregunta",
          pregunta: "¿Hacen envíos fuera de Costa Rica?",
          respuesta: "Por ahora no. Solo entregamos dentro del territorio costarricense, en las siete provincias.",
        },
      ],
    },
    {
      id: "devoluciones",
      titulo: "Devoluciones",
      bloques: [
        {
          tipo: "pregunta",
          pregunta: "¿Puedo devolver un libro?",
          respuesta: `Sí. Tienes ${DIAS_DEVOLUCION_GENERAL} días naturales desde que recibes tu pedido para devolver un libro por cambio de opinión (debe estar sin uso), y ${DIAS_DEVOLUCION_DEFECTO} días si llegó dañado, defectuoso o distinto al que pediste.`,
          enlace: { texto: "Ver la Política de Devoluciones", clave: "devoluciones" },
        },
        {
          tipo: "pregunta",
          pregunta: "¿Cómo solicito una devolución y cuándo recibo mi reembolso?",
          respuesta: `Escríbenos a ${CORREO_ATENCION} con tu número de orden y el motivo. Te respondemos en un máximo de ${RESPUESTA_ATENCION}. Una vez que recibimos y revisamos el libro, el reembolso se hace al mismo medio de pago en hasta ${DIAS_REEMBOLSO} días hábiles.`,
        },
      ],
    },
    {
      id: "atencion-al-cliente",
      titulo: "Atención al cliente",
      bloques: [
        {
          tipo: "pregunta",
          pregunta: "¿Cómo puedo contactar a atención al cliente?",
          respuesta: `Escríbenos a ${CORREO_ATENCION}. Atendemos ${HORARIO_ATENCION.charAt(0).toLowerCase()}${HORARIO_ATENCION.slice(1)} y respondemos en un máximo de ${RESPUESTA_ATENCION}.`,
        },
        {
          tipo: "pregunta",
          pregunta: "¿Dónde encuentro mi número de orden?",
          respuesta: "Se genera cuando confirmas el resumen de tu compra y aparece en la pantalla de pago y en la confirmación final. Tiene el formato BKS-AAAAMMDD-XXXXXX. Guárdalo para cualquier consulta.",
        },
        {
          tipo: "pregunta",
          pregunta: "¿Cómo sé si mi compra fue exitosa?",
          respuesta: "Verás la pantalla «¡Compra confirmada!» con tu número de orden y el resumen de tu compra. La orden aparece como Confirmada y el pago como Aprobado. Si no ves esa pantalla, tu compra no se completó y no se te cobró.",
        },
      ],
    },
  ],
}

export const paginasLegales: Record<ClavePaginaLegal, PaginaLegal> = {
  terminos,
  devoluciones,
  envios,
  privacidad,
  preguntas,
}

// Orden en que aparecen en el menú lateral, en el pie de página y en los botones de anterior/siguiente
export const ordenPaginasLegales: ClavePaginaLegal[] = ["terminos", "devoluciones", "envios", "privacidad", "preguntas"]

export const listaPaginasLegales: PaginaLegal[] = ordenPaginasLegales.map((clave) => paginasLegales[clave])