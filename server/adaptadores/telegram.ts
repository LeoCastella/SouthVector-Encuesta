import type { VersionCuestionario } from '../../src/domain'
import type { Avisos } from '../puertos'

/** Avisa al grupo de Telegram que entró un lead. Solo cuadrante y fecha: sin datos personales. */
export function avisosTelegram(
  token: string,
  chatId: string,
  cuestionario: VersionCuestionario,
  fetcher: typeof fetch = fetch,
): Avisos {
  return {
    async nuevoLead(cuadrante, fecha) {
      const texto = `Nuevo lead en el diagnóstico QA\nCuadrante: ${cuestionario.cuadrantes[cuadrante].titulo}\nFecha: ${fecha.slice(0, 16).replace('T', ' ')} UTC\nLos datos de contacto están en la Sheet de leads.`
      const res = await fetcher(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: texto }),
      })
      if (!res.ok) throw new Error(`Telegram respondió ${res.status}`)
    },
  }
}
