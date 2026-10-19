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

## Estructura

```
src/domain/          Modelo, cuestionario v1, motor de puntaje y esquemas (sin dependencias de UI)
src/ui/              Componentes React
netlify/functions/   API (Netlify Functions)
e2e/                 Pruebas Playwright
docs/adr/            Decisiones de arquitectura
```

## Ramas

`feature/LEO-xx-…` → `develop` → `testing` → `main`. Detalle en [ADR 0001](docs/adr/0001-stack-y-arquitectura.md).
