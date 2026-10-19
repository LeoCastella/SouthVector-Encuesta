import type { EnvioEmail } from '../puertos'

const escapar = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** Envía el informe con la API transaccional de Brevo (empresa de la UE). */
export function envioBrevo(
  apiKey: string,
  remitente: { email: string; nombre: string },
  fetcher: typeof fetch = fetch,
): EnvioEmail {
  return {
    async enviarInforme(destino, pdf, cuadrante) {
      const res = await fetcher('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          sender: { email: remitente.email, name: remitente.nombre },
          to: [{ email: destino.email, name: destino.nombre }],
          replyTo: { email: remitente.email, name: remitente.nombre },
          subject: 'Tu diagnóstico de madurez en calidad de software',
          htmlContent: `<p>Hola ${escapar(destino.nombre)},</p>
<p>Gracias por completar el diagnóstico de South Vector. Tu resultado es <strong>${escapar(cuadrante)}</strong>.
Adjuntamos el informe completo en PDF.</p>
<p>Si querés conversar sobre los próximos pasos, respondé este email.</p>
<p>Equipo South Vector</p>`,
          attachment: [{ name: 'diagnostico-south-vector.pdf', content: Buffer.from(pdf).toString('base64') }],
        }),
      })
      if (!res.ok) throw new Error(`Brevo respondió ${res.status}: ${await res.text()}`)
    },
  }
}
