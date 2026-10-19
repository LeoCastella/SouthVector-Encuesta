# ADR 0001 · Stack y arquitectura

- Estado: aceptado
- Fecha: 2026-10-19
- Ticket: LEO-14

## Contexto

El diagnóstico QA de South Vector era un HTML único que enviaba respuestas a una Google Sheet mediante Apps Script,
sin validación, con el puntaje calculado en el navegador. Los requisitos piden resultado inmediato sin datos personales,
informe PDF por email con consentimiento (RGPD, UE), aviso de leads por Telegram sin datos personales y un panel comercial.

## Decisión

| Capa                    | Elección                                 | Motivo                                                                                   |
| ----------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| Frontend                | React + TypeScript + Vite                | Tipado, ecosistema amplio, build estático rápido                                         |
| Dominio                 | Módulo puro `src/domain`                 | El motor de puntaje se prueba sin UI, red ni base de datos y se comparte con el servidor |
| Validación              | Zod                                      | Un mismo esquema en navegador y servidor                                                 |
| Backend                 | Netlify Functions (TypeScript)           | Mismo hosting que el frontend, sin servidores que mantener                               |
| Datos y login del panel | Supabase (Postgres + Auth) en Frankfurt  | Región UE, migraciones SQL, autenticación y roles incluidos                              |
| PDF                     | pdf-lib en una función                   | Sin navegador headless, liviano                                                          |
| Email                   | Brevo (UE)                               | Proveedor europeo; requiere dominio verificado                                           |
| Avisos                  | Bot de Telegram                          | Decisión 2026-10-19; el aviso no lleva datos personales                                  |
| Pruebas                 | Vitest, Testing Library, Playwright, axe | Unitarias, integración, E2E en escritorio y móvil, WCAG 2.1 AA                           |
| CI                      | GitHub Actions                           | Lint, formato, tipos, cobertura ≥ 90 % y E2E obligatorios en cada PR                     |
| Fuentes                 | Autoalojadas (@fontsource)               | Evita enviar IPs a Google Fonts (RGPD)                                                   |

## Ramas y entornos

- `feature/LEO-xx-descripcion` → PR a `develop` (integración, deploy de rama en Netlify).
- `develop` → PR a `testing` (staging, deploy de rama en Netlify, pruebas de aceptación).
- `testing` → PR a `main` (producción). Cada pase a `main` se etiqueta con versión semántica (`v1.0.0`).
- Cada PR tiene su deploy preview.

## Alternativas descartadas

- Supabase (Postgres + Auth en Frankfurt): más robusto, pero agrega un servicio. Queda como opción si el volumen o el panel crecen.
- Panel web propio con login: innecesario mientras el equipo comercial sea chico.
- Next.js: agrega SSR que el formulario no necesita.
- Puntaje solo en el navegador: el servidor recalcula siempre y no confía en el cliente.

## Consecuencias

- Hay que crear una cuenta en Brevo y un bot de Telegram, y publicar el Apps Script. Los secretos van como variables de entorno en Netlify.
- Las funciones de Netlify y Google procesan datos fuera de la UE con garantías (DPF / cláusulas tipo).
  Se documenta en la política de privacidad.
- Sin dominio propio, el email sale desde un remitente verificado en Brevo; con dominio se configura SPF/DKIM.
- Ejes, pesos y umbral sin cambios en la 1.0.0 (LEO-20 queda para la próxima versión).
