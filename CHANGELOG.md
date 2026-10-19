# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [versionado semántico](https://semver.org/lang/es/).

## [Sin publicar]

### Agregado

- Cuestionario v1 con las 12 preguntas, textos idénticos a la web original.
- Motor de puntaje como función pura: ejes, semáforos y cuadrante (umbral 15, inclusivo).
- Quality Engineering como servicio complementario en Código rojo y Deuda técnica operativa.
- Formulario accesible con progreso y resultado en pantalla sin pedir datos.
- Endpoint `POST /api/diagnostico` que valida y recalcula en el servidor.
- Pedido del informe PDF con consentimiento RGPD, campo trampa antispam, límite por IP y registro de UTM.
- Endpoint `POST /api/informe`: guarda el lead en Google Sheets, envía el PDF con Brevo y avisa por Telegram sin datos personales.
- Deduplicación: el mismo email en 24 h recibe el PDF pero no genera un nuevo aviso.
- Apps Script para la Sheet de leads con columna de estado comercial (panel básico).
- Política de privacidad.
- Fuentes autoalojadas y cabeceras de seguridad (CSP).
- CI con lint, formato, tipos, cobertura y E2E con axe en escritorio y móvil.
