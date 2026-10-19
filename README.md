# South Vector · Diagnóstico QA

Diagnóstico gratuito de madurez en calidad de software: 12 preguntas en un Balanced Scorecard, ubicación en una
matriz 2x2 y recomendación de servicio. El resultado se ve al instante, sin dejar datos.

## Requisitos

- Node 22 o superior

## Uso local

```bash
npm install
npm run dev          # http://localhost:5173 (solo frontend)
npx netlify dev      # frontend + funciones en http://localhost:8888
```

## Pruebas

```bash
npm run check        # lint, formato, tipos y pruebas unitarias con cobertura
npm run test:e2e     # E2E y accesibilidad (escritorio y móvil) sobre el build local
E2E_BASE_URL=https://<deploy>.netlify.app npm run test:e2e   # contra un deploy
```

## Variables de entorno (Netlify)

| Variable                 | Para qué                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| `SHEETS_WEBHOOK_URL`     | URL `/exec` del Apps Script de la Sheet de leads ([apps-script/Codigo.gs](apps-script/Codigo.gs)) |
| `SHEETS_TOKEN`           | Token compartido con el Apps Script (propiedad `TOKEN`)                                           |
| `BREVO_API_KEY`          | Clave de la API de Brevo                                                                          |
| `EMAIL_REMITENTE`        | Remitente verificado en Brevo                                                                     |
| `EMAIL_REMITENTE_NOMBRE` | Opcional, por defecto `South Vector`                                                              |
| `TELEGRAM_BOT_TOKEN`     | Token del bot (BotFather)                                                                         |
| `TELEGRAM_CHAT_ID`       | Id del grupo "South Vector - Encuestas"                                                           |

Marcar todas como secretas. Nunca se suben al repositorio.

## Panel comercial

La Sheet de leads es el panel básico: acceso con cuentas de Google, filtro en los encabezados, columna **Estado**
(Nuevo, Contactado, En negociación, Ganado, Perdido) y exportación a CSV desde Archivo > Descargar.

## Estructura

```
src/domain/          Modelo, cuestionario v1, motor de puntaje y esquemas (sin dependencias de UI)
src/ui/              Componentes React
server/              Caso de uso "pedir informe", PDF y adaptadores (Sheets, Brevo, Telegram)
netlify/functions/   API (Netlify Functions)
apps-script/         Receptor de leads para la Google Sheet
e2e/                 Pruebas Playwright
docs/adr/            Decisiones de arquitectura
```

## Ramas

`feature/LEO-xx-…` → `develop` → `testing` → `main`. Detalle en [ADR 0001](docs/adr/0001-stack-y-arquitectura.md).
