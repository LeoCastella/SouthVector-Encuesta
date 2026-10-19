import type { Lead, RepositorioLeads } from '../puertos'

/** Guarda leads en la Google Sheet a través del Apps Script publicado (ver apps-script/Codigo.gs). */
export function repositorioSheets(url: string, token: string, fetcher: typeof fetch = fetch): RepositorioLeads {
  return {
    async registrar(lead: Lead) {
      const fila = {
        token,
        fecha: lead.fecha,
        empresa: lead.empresa,
        nombre: lead.nombre,
        email: lead.email,
        version: lead.diagnostico.version,
        respuestas: lead.diagnostico.detalle.map((r) => r.valor),
        ejeX: lead.diagnostico.ejeX,
        ejeY: lead.diagnostico.ejeY,
        cuadrante: lead.diagnostico.cuadrante,
        utmSource: lead.utm?.source ?? '',
        utmMedium: lead.utm?.medium ?? '',
        utmCampaign: lead.utm?.campaign ?? '',
      }
      // Apps Script responde con una redirección 302 a googleusercontent; fetch la sigue.
      const res = await fetcher(url, {
        method: 'POST',
        headers: { 'content-type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(fila),
        redirect: 'follow',
      })
      if (!res.ok) throw new Error(`Apps Script respondió ${res.status}`)
      const cuerpo = (await res.json()) as { ok: boolean; duplicado?: boolean; error?: string }
      if (!cuerpo.ok) throw new Error(`Apps Script: ${cuerpo.error ?? 'error desconocido'}`)
      return { duplicado: Boolean(cuerpo.duplicado) }
    },
  }
}
