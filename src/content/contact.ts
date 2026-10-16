export const contactContent = {
  subject: "[StrongWood Ventas] Nueva consulta",
  invalidData: "Revisá los datos del formulario e intentá nuevamente.",
  unavailable: "El formulario no está disponible. Intentá más tarde.",
  rateLimited: "Alcanzaste el límite de envíos. Intentá nuevamente más tarde.",
  sendError: "No se pudo enviar el email. Intentá nuevamente más tarde.",
  honeypotLabel: "Dejá este campo vacío",
  protection: {
    label: "Verificación de seguridad",
    required: "Completá la verificación de seguridad antes de enviar.",
    invalid: "No pudimos validar la verificación de seguridad. Intentá nuevamente.",
    unavailable: "La verificación de seguridad no está disponible. Intentá más tarde.",
  },
};

export const turnstileConfig = {
  action: "contact",
  tokenFieldName: "cf-turnstile-response",
  scriptUrl: "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
  verificationUrl: "https://challenges.cloudflare.com/turnstile/v0/siteverify",
};
