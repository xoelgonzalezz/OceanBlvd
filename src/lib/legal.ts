// Textos legales (plantillas conformes a la normativa española/UE).
// ⚠️ Rellena los datos del titular en BUSINESS y revisa con un profesional.

export const BUSINESS = {
  tradeName: "Ocean Blvd Vinyl",
  // ⚠️ Confirma que en tu DNI figura exactamente así (corregí "Gonzálezs" →
  // "González"; si tu apellido lleva la "s", dímelo).
  legalName: "Xoel González Pereira",
  taxId: "45163741K",
  // ⚠️ Recomendable añadir el número de portal para una dirección fiscal completa.
  address: "Rúa Brasil, 15009 A Coruña",
  email: "info@oceanblvdvinyl.com",
  site: "oceanblvdvinyl.com",
};

const UPDATED = { es: "junio de 2026", en: "June 2026" };

export interface LegalSection {
  h: string;
  p?: string[];
  list?: string[];
}
export interface LegalDoc {
  title: string;
  updatedLabel: string;
  intro?: string;
  sections: LegalSection[];
}

const B = BUSINESS;

export const LEGAL_SLUGS = [
  "aviso-legal",
  "privacidad",
  "condiciones",
  "devoluciones",
  "cookies",
] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

/* ===================== ESPAÑOL ===================== */
const es: Record<LegalSlug, LegalDoc> = {
  "aviso-legal": {
    title: "Aviso legal",
    updatedLabel: `Última actualización: ${UPDATED.es}`,
    intro:
      "En cumplimiento de la Ley 34/2002 de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los datos del titular de este sitio web.",
    sections: [
      {
        h: "1. Datos del titular",
        list: [
          `Titular: ${B.legalName} (marca comercial "${B.tradeName}")`,
          `NIF/CIF: ${B.taxId}`,
          `Domicilio: ${B.address}`,
          `Correo electrónico: ${B.email}`,
          `Sitio web: ${B.site}`,
        ],
      },
      {
        h: "2. Objeto",
        p: [
          `El presente aviso legal regula el uso del sitio web ${B.site}, cuya finalidad es la venta online de discos de vinilo y productos relacionados.`,
          "El acceso y uso del sitio atribuye la condición de usuario e implica la aceptación de las condiciones recogidas en este aviso legal.",
        ],
      },
      {
        h: "3. Condiciones de uso",
        p: [
          "El usuario se compromete a hacer un uso adecuado y lícito del sitio y de sus contenidos, de conformidad con la legislación aplicable, la buena fe y el orden público.",
          "Queda prohibido el uso del sitio con fines ilícitos o lesivos para el titular o terceros, o que de cualquier forma puedan dañar, inutilizar o sobrecargar el sitio.",
        ],
      },
      {
        h: "4. Propiedad intelectual e industrial",
        p: [
          "El diseño del sitio, sus textos, logotipos y código son titularidad del propietario o cuenta con la correspondiente autorización. Las portadas, nombres y marcas de artistas y sellos pertenecen a sus respectivos titulares y se muestran con fines identificativos del producto.",
          "Queda prohibida la reproducción, distribución o transformación de los contenidos sin autorización expresa.",
        ],
      },
      {
        h: "5. Responsabilidad",
        p: [
          "El titular no se hace responsable de los daños derivados del uso indebido del sitio ni de las interrupciones, errores u omisiones que pudieran existir, sin perjuicio de adoptar las medidas para evitarlos.",
        ],
      },
      {
        h: "6. Legislación y jurisdicción",
        p: [
          "Las presentes condiciones se rigen por la legislación española. Para la resolución de cualquier controversia, las partes se someten a los juzgados y tribunales que correspondan conforme a derecho.",
        ],
      },
    ],
  },

  privacidad: {
    title: "Política de privacidad",
    updatedLabel: `Última actualización: ${UPDATED.es}`,
    intro:
      "Tratamos tus datos personales conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD). A continuación te explicamos cómo.",
    sections: [
      {
        h: "1. Responsable del tratamiento",
        list: [
          `Responsable: ${B.legalName}`,
          `NIF/CIF: ${B.taxId}`,
          `Dirección: ${B.address}`,
          `Contacto: ${B.email}`,
        ],
      },
      {
        h: "2. Datos que tratamos",
        list: [
          "Datos de cuenta: nombre y correo electrónico (la contraseña se guarda cifrada con bcrypt; nunca en claro).",
          "Datos de pedido: nombre, dirección de envío, teléfono y correo.",
          "Datos de contacto: los que nos facilitas en el formulario.",
          "Datos de navegación: cookies técnicas y funcionales (ver Política de cookies).",
        ],
      },
      {
        h: "3. Finalidades y base legal",
        list: [
          "Gestionar tu cuenta y tus pedidos — base: ejecución del contrato.",
          "Procesar el pago — base: ejecución del contrato (a través de Stripe).",
          "Enviarte la confirmación del pedido — base: ejecución del contrato.",
          "Atender tus consultas — base: tu consentimiento o interés legítimo.",
          "Cumplir obligaciones legales (p. ej. facturación) — base: obligación legal.",
        ],
      },
      {
        h: "4. Destinatarios",
        p: [
          "No vendemos tus datos. Compartimos lo imprescindible con proveedores que actúan como encargados del tratamiento:",
        ],
        list: [
          "Stripe Payments Europe — procesamiento de pagos.",
          "Resend — envío del correo de confirmación.",
          "Vercel y Neon — alojamiento de la web y la base de datos.",
        ],
      },
      {
        h: "5. Conservación",
        p: [
          "Conservamos tus datos mientras mantengas tu cuenta y, tras su baja, durante los plazos legales aplicables (p. ej. fiscales y mercantiles).",
        ],
      },
      {
        h: "6. Tus derechos",
        p: [
          `Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a ${B.email}. Tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).`,
        ],
      },
      {
        h: "7. Seguridad",
        p: [
          "Aplicamos medidas técnicas y organizativas: cifrado en tránsito (HTTPS), contraseñas cifradas, sesiones firmadas, control de acceso y cabeceras de seguridad.",
        ],
      },
    ],
  },

  condiciones: {
    title: "Condiciones de venta",
    updatedLabel: `Última actualización: ${UPDATED.es}`,
    intro:
      "Estas condiciones regulan la compra de productos en este sitio web, de acuerdo con el Real Decreto Legislativo 1/2007 (Ley General para la Defensa de los Consumidores y Usuarios).",
    sections: [
      {
        h: "1. Vendedor",
        list: [
          `${B.legalName} — NIF/CIF: ${B.taxId}`,
          `${B.address} · ${B.email}`,
        ],
      },
      {
        h: "2. Productos y disponibilidad",
        p: [
          "Vendemos discos de vinilo nuevos y de segunda mano. En los productos de segunda mano se indica su estado (Mint, VG+, etc.). La disponibilidad está sujeta a stock; si un producto no estuviera disponible tras la compra, te informaremos y reembolsaremos el importe.",
        ],
      },
      {
        h: "3. Precios e impuestos",
        p: [
          "Los precios se muestran en euros (€) e incluyen los impuestos aplicables. Los gastos de envío se calculan y muestran antes de finalizar la compra.",
        ],
      },
      {
        h: "4. Proceso de compra",
        p: [
          "Añade los productos al carrito, introduce tus datos de envío y completa el pago. Una vez confirmado el pago recibirás un correo con la confirmación del pedido, que constituye el justificante de la compra.",
        ],
      },
      {
        h: "5. Formas de pago",
        p: [
          "El pago se realiza con tarjeta a través de la pasarela segura de Stripe. No almacenamos los datos de tu tarjeta.",
        ],
      },
      {
        h: "6. Envíos",
        p: [
          "Los plazos y costes de envío se detallan en la Política de envíos. El riesgo de pérdida o deterioro se transmite al recibir el producto.",
        ],
      },
      {
        h: "7. Desistimiento y devoluciones",
        p: [
          "Dispones de 14 días naturales para desistir de la compra, con las excepciones legales previstas (ver Política de devoluciones).",
        ],
      },
      {
        h: "8. Garantía legal",
        p: [
          "Los productos nuevos cuentan con la garantía legal de conformidad de 3 años. En productos de segunda mano, el plazo de garantía podrá pactarse y no será inferior a un año.",
        ],
      },
      {
        h: "9. Atención al cliente y resolución de litigios",
        p: [
          `Para cualquier incidencia, escríbenos a ${B.email}. Como consumidor, puedes acudir a la plataforma de resolución de litigios en línea de la Comisión Europea: https://ec.europa.eu/consumers/odr.`,
        ],
      },
    ],
  },

  devoluciones: {
    title: "Devoluciones y desistimiento",
    updatedLabel: `Última actualización: ${UPDATED.es}`,
    intro:
      "Queremos que disfrutes de tu música. Aquí te explicamos cómo devolver un producto y ejercer tu derecho de desistimiento.",
    sections: [
      {
        h: "1. Derecho de desistimiento",
        p: [
          "Como consumidor, tienes derecho a desistir de la compra en un plazo de 14 días naturales desde que recibes el producto, sin necesidad de justificación.",
        ],
      },
      {
        h: "2. Importante para discos precintados",
        p: [
          "Conforme al art. 103.i del RDL 1/2007, el derecho de desistimiento NO se aplica a las grabaciones sonoras precintadas que hayan sido desprecintadas tras la entrega. Es decir: un vinilo nuevo precintado que abras pierde el derecho de desistimiento (salvo que sea defectuoso). Los discos no abiertos y los de segunda mano sí admiten desistimiento.",
        ],
      },
      {
        h: "3. Cómo solicitar la devolución",
        p: [
          `Comunícanoslo antes de que finalice el plazo escribiendo a ${B.email}, indicando tu número de pedido. Puedes usar el modelo de formulario de desistimiento del Anexo B del RDL 1/2007. Después dispones de 14 días para enviarnos el producto.`,
        ],
      },
      {
        h: "4. Estado del producto",
        p: [
          "El producto debe devolverse en el mismo estado en que lo recibiste, con su funda y elementos originales. Responderás de la disminución de valor derivada de una manipulación distinta a la necesaria para comprobar el producto.",
        ],
      },
      {
        h: "5. Reembolso",
        p: [
          "Una vez recibido y comprobado el producto, te reembolsaremos el importe (incluidos los gastos de envío estándar) en un plazo máximo de 14 días, por el mismo medio de pago que utilizaste.",
        ],
      },
      {
        h: "6. Coste de la devolución",
        p: [
          "Salvo que el producto sea defectuoso o erróneo, los gastos de envío de la devolución corren por cuenta del cliente.",
        ],
      },
      {
        h: "7. Productos defectuosos",
        p: [
          `Si recibes un producto defectuoso o distinto al pedido, contáctanos en ${B.email} y nos haremos cargo de la sustitución o reembolso y de los gastos de envío.`,
        ],
      },
    ],
  },

  cookies: {
    title: "Política de cookies",
    updatedLabel: `Última actualización: ${UPDATED.es}`,
    intro:
      "Usamos únicamente cookies técnicas y de funcionalidad necesarias para que la web funcione. No usamos cookies de publicidad ni de analítica de terceros.",
    sections: [
      {
        h: "1. ¿Qué cookies usamos?",
        list: [
          "theme — recuerda tu preferencia de tema (claro/oscuro). Funcional.",
          "locale — recuerda tu idioma (ES/EN). Funcional.",
          "ob_session — mantiene tu sesión de usuario iniciada. Técnica.",
          "ob_admin — sesión del panel de administración. Técnica.",
          "Carrito — se guarda en el almacenamiento local del navegador (localStorage), no en cookies.",
        ],
      },
      {
        h: "2. Base legal",
        p: [
          "Estas cookies son técnicas y funcionales, exentas del deber de consentimiento conforme al art. 22.2 de la LSSI, por ser necesarias para prestar el servicio que solicitas.",
        ],
      },
      {
        h: "3. Cómo gestionarlas",
        p: [
          "Puedes eliminar o bloquear las cookies desde la configuración de tu navegador. Ten en cuenta que desactivarlas puede afectar al funcionamiento del sitio (por ejemplo, no recordar tu sesión o idioma).",
        ],
      },
    ],
  },
};

/* ===================== ENGLISH ===================== */
const en: Record<LegalSlug, LegalDoc> = {
  "aviso-legal": {
    title: "Legal notice",
    updatedLabel: `Last updated: ${UPDATED.en}`,
    intro:
      "In compliance with Spanish Law 34/2002 (LSSI-CE) on information society services and e-commerce, the details of the owner of this website are provided below.",
    sections: [
      {
        h: "1. Owner details",
        list: [
          `Owner: ${B.legalName} (trade name "${B.tradeName}")`,
          `Tax ID: ${B.taxId}`,
          `Address: ${B.address}`,
          `Email: ${B.email}`,
          `Website: ${B.site}`,
        ],
      },
      {
        h: "2. Purpose",
        p: [
          `This legal notice governs the use of the website ${B.site}, whose purpose is the online sale of vinyl records and related products.`,
          "Accessing and using the site grants the condition of user and implies acceptance of these terms.",
        ],
      },
      {
        h: "3. Terms of use",
        p: [
          "The user agrees to make appropriate and lawful use of the site and its content, in accordance with applicable law, good faith and public order.",
          "Using the site for unlawful purposes or in ways that may damage, disable or overload it is prohibited.",
        ],
      },
      {
        h: "4. Intellectual property",
        p: [
          "The site design, texts, logos and code belong to the owner or are duly licensed. Album artwork, artist names and label trademarks belong to their respective owners and are shown to identify the product.",
          "Reproduction, distribution or transformation of the content without express authorisation is prohibited.",
        ],
      },
      {
        h: "5. Liability",
        p: [
          "The owner is not liable for damages arising from improper use of the site or for interruptions, errors or omissions that may occur, without prejudice to taking measures to avoid them.",
        ],
      },
      {
        h: "6. Governing law and jurisdiction",
        p: [
          "These terms are governed by Spanish law. Any dispute shall be submitted to the courts and tribunals legally competent.",
        ],
      },
    ],
  },

  privacidad: {
    title: "Privacy policy",
    updatedLabel: `Last updated: ${UPDATED.en}`,
    intro:
      "We process your personal data in accordance with the EU General Data Protection Regulation (GDPR) and Spanish Organic Law 3/2018. Here is how.",
    sections: [
      {
        h: "1. Data controller",
        list: [
          `Controller: ${B.legalName}`,
          `Tax ID: ${B.taxId}`,
          `Address: ${B.address}`,
          `Contact: ${B.email}`,
        ],
      },
      {
        h: "2. Data we process",
        list: [
          "Account data: name and email (passwords are stored hashed with bcrypt; never in plain text).",
          "Order data: name, shipping address, phone and email.",
          "Contact data: whatever you provide in the contact form.",
          "Browsing data: technical and functional cookies (see Cookie policy).",
        ],
      },
      {
        h: "3. Purposes and legal basis",
        list: [
          "Manage your account and orders — basis: performance of the contract.",
          "Process payment — basis: performance of the contract (via Stripe).",
          "Send your order confirmation — basis: performance of the contract.",
          "Answer your enquiries — basis: your consent or legitimate interest.",
          "Comply with legal obligations (e.g. invoicing) — basis: legal obligation.",
        ],
      },
      {
        h: "4. Recipients",
        p: ["We do not sell your data. We share only what is essential with processors:"],
        list: [
          "Stripe Payments Europe — payment processing.",
          "Resend — sending the confirmation email.",
          "Vercel and Neon — website and database hosting.",
        ],
      },
      {
        h: "5. Retention",
        p: [
          "We keep your data while you hold an account and, after closure, for the applicable legal periods (e.g. tax and commercial).",
        ],
      },
      {
        h: "6. Your rights",
        p: [
          `You may exercise your rights of access, rectification, erasure, objection, restriction and portability by writing to ${B.email}. You have the right to lodge a complaint with the Spanish Data Protection Agency (www.aepd.es).`,
        ],
      },
      {
        h: "7. Security",
        p: [
          "We apply technical and organisational measures: encryption in transit (HTTPS), hashed passwords, signed sessions, access control and security headers.",
        ],
      },
    ],
  },

  condiciones: {
    title: "Terms of sale",
    updatedLabel: `Last updated: ${UPDATED.en}`,
    intro:
      "These terms govern the purchase of products on this website, in accordance with Spanish consumer protection law (RDL 1/2007).",
    sections: [
      { h: "1. Seller", list: [`${B.legalName} — Tax ID: ${B.taxId}`, `${B.address} · ${B.email}`] },
      {
        h: "2. Products and availability",
        p: [
          "We sell new and second-hand vinyl records. Second-hand products show their grade (Mint, VG+, etc.). Availability is subject to stock; if a product is unavailable after purchase, we will inform you and refund the amount.",
        ],
      },
      {
        h: "3. Prices and taxes",
        p: [
          "Prices are shown in euros (€) and include applicable taxes. Shipping costs are calculated and shown before completing the purchase.",
        ],
      },
      {
        h: "4. Order process",
        p: [
          "Add products to the cart, enter your shipping details and complete payment. Once payment is confirmed you will receive an order confirmation email, which serves as proof of purchase.",
        ],
      },
      {
        h: "5. Payment",
        p: [
          "Payment is made by card through Stripe's secure gateway. We do not store your card details.",
        ],
      },
      {
        h: "6. Shipping",
        p: [
          "Shipping times and costs are detailed in the Shipping policy. The risk of loss or damage passes to you upon receipt of the product.",
        ],
      },
      {
        h: "7. Withdrawal and returns",
        p: [
          "You have 14 calendar days to withdraw from the purchase, subject to the legal exceptions (see Returns policy).",
        ],
      },
      {
        h: "8. Legal warranty",
        p: [
          "New products carry the 3-year legal warranty of conformity. For second-hand products, the warranty period may be agreed and shall not be less than one year.",
        ],
      },
      {
        h: "9. Customer service and dispute resolution",
        p: [
          `For any issue, write to ${B.email}. As a consumer, you may use the European Commission's online dispute resolution platform: https://ec.europa.eu/consumers/odr.`,
        ],
      },
    ],
  },

  devoluciones: {
    title: "Returns & withdrawal",
    updatedLabel: `Last updated: ${UPDATED.en}`,
    intro:
      "We want you to enjoy your music. Here is how to return a product and exercise your right of withdrawal.",
    sections: [
      {
        h: "1. Right of withdrawal",
        p: [
          "As a consumer, you have the right to withdraw from the purchase within 14 calendar days of receiving the product, with no need to give a reason.",
        ],
      },
      {
        h: "2. Important for sealed records",
        p: [
          "Under art. 103.i of RDL 1/2007, the right of withdrawal does NOT apply to sealed sound recordings that have been unsealed after delivery. In other words: a new, sealed record that you open loses the right of withdrawal (unless it is defective). Unopened records and second-hand records can be returned.",
        ],
      },
      {
        h: "3. How to request a return",
        p: [
          `Let us know before the deadline by writing to ${B.email} with your order number. You may use the model withdrawal form from Annex B of RDL 1/2007. You then have 14 days to send the product back.`,
        ],
      },
      {
        h: "4. Condition of the product",
        p: [
          "The product must be returned in the same condition you received it, with its sleeve and original items. You are liable for any diminished value resulting from handling beyond what is necessary to check the product.",
        ],
      },
      {
        h: "5. Refund",
        p: [
          "Once we receive and check the product, we will refund the amount (including standard shipping) within a maximum of 14 days, using the same payment method you used.",
        ],
      },
      {
        h: "6. Return cost",
        p: [
          "Unless the product is defective or wrong, the cost of return shipping is borne by the customer.",
        ],
      },
      {
        h: "7. Defective products",
        p: [
          `If you receive a defective or incorrect product, contact us at ${B.email} and we will handle the replacement or refund and the shipping costs.`,
        ],
      },
    ],
  },

  cookies: {
    title: "Cookie policy",
    updatedLabel: `Last updated: ${UPDATED.en}`,
    intro:
      "We only use technical and functional cookies necessary for the site to work. We do not use advertising or third-party analytics cookies.",
    sections: [
      {
        h: "1. Which cookies we use",
        list: [
          "theme — remembers your theme preference (light/dark). Functional.",
          "locale — remembers your language (ES/EN). Functional.",
          "ob_session — keeps your user session signed in. Technical.",
          "ob_admin — admin panel session. Technical.",
          "Cart — stored in the browser's local storage (localStorage), not in cookies.",
        ],
      },
      {
        h: "2. Legal basis",
        p: [
          "These cookies are technical and functional, exempt from the consent requirement under art. 22.2 of the LSSI, as they are necessary to provide the service you request.",
        ],
      },
      {
        h: "3. How to manage them",
        p: [
          "You can delete or block cookies from your browser settings. Note that disabling them may affect how the site works (for example, not remembering your session or language).",
        ],
      },
    ],
  },
};

export const LEGAL: Record<"es" | "en", Record<LegalSlug, LegalDoc>> = { es, en };

export function getLegalDoc(slug: LegalSlug, locale: "es" | "en"): LegalDoc {
  return LEGAL[locale][slug];
}
