const placeholder = " [Espacio para completar esta información.]"

export const legalPages = {
  terminos: {
    title: "Términos y Condiciones",
    sections: [
      { title: "Condiciones de uso del sitio", text: placeholder },
      { title: "Condiciones generales de compra", text: placeholder },
      { title: "Responsabilidades del cliente", text: placeholder },
      { title: "Responsabilidades de la tienda", text: placeholder },
    ],
  },
  devoluciones: {
    title: "Política de Devoluciones",
    sections: [
      { title: "Plazo para solicitar devoluciones", text: placeholder },
      { title: "Condiciones para aprobar una devolución", text: placeholder },
      { title: "Casos en los que no se aceptan devoluciones", text: placeholder },
      { title: "Procedimiento para gestionar solicitudes", text: placeholder },
    ],
  },
  envios: {
    title: "Política de Envíos",
    sections: [
      { title: "Cobertura de entrega", text: placeholder },
      { title: "Tiempos estimados de envío", text: placeholder },
      { title: "Costos de envío", text: placeholder },
      { title: "Restricciones y condiciones especiales", text: placeholder },
    ],
  },
  privacidad: {
    title: "Política de Privacidad",
    sections: [
      { 
        title: "Información que recopila la tienda", 
        text: "https://deysmith.github.io/Proyecto-E-Commerce/ recopila su siguiente información personal: nombre completo, correo electrónico, " + 
              " teléfono y dirección. Esta información se utiliza para mejorar su experiencia en la compra y notificarle sobre las actualización " +
              "del estado de su pedido. Es nuestra política no divulgar cualquiera de su información personal en cualquier momento, a menos de que " +
              "usted lo autorice. No vendemos, no negociamos ni alquilamos su información personal a terceros."
      },
      { 
        title: "Uso de la información del cliente", 
        text: "" 
      },
      { 
        title: "Protección de datos", 
        text: "Utilizamos métodos estándar para proteger su información contra el acceso desautorizado. Para asegurar la seguridad de su información " +
              "personal, incluyendo su número de tarjeta, utilizamos tecnología Transport Layer Security (TLS). TLS protege la información que cruza " +
              "por Internet. Cualquier dato almacenado mantiene una localización segura off-site y se almacena en un servidor password-protected."
      },
    ],
  },
  preguntas: {
    title: "Preguntas Frecuentes (FAQ)",
    sections: [
      { title: "¿Cómo puedo realizar una compra?", text: placeholder },
      { title: "¿Qué métodos de pago se aceptan?", text: placeholder },
      { title: "¿Cuáles son las opciones y tiempos de envío?", text: placeholder },
      { title: "¿Cómo puedo solicitar una devolución?", text: placeholder },
      { title: "¿Cómo puedo contactar a atención al cliente?", text: placeholder },
    ],
  },
} as const