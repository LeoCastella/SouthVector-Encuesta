import type { Pregunta, Servicio, VersionCuestionario } from './types'

/**
 * Versión 1 del cuestionario. Los textos son idénticos a la web original.
 * Ejes, pesos y umbral pendientes de validación con South Vector (LEO-20).
 */

const qualityEngineering: Servicio = {
  nombre: 'Quality Engineering',
  descripcion:
    'Servicio complementario: incorporamos prácticas de ingeniería de calidad dentro del ciclo de desarrollo para sostener las mejoras en el tiempo.',
}

const preguntas: Pregunta[] = [
  {
    id: 1,
    perspectiva: 'rrhh',
    eje: 'X',
    peso: 1,
    nombre: 'Madurez Técnica (QA y Automatización)',
    descripcion:
      'Evalúa el nivel de autonomía y modernización de su equipo para ejecutar pruebas de software sin depender de terceros o de tareas manuales.',
    opciones: [
      'Alta automatización mantenida de forma autónoma por nuestro equipo.',
      'Mezcla de automatización y pruebas manuales (cuellos de botella ocasionales).',
      'Principalmente manual; automatización desactualizada o rota.',
      '100% manual o inexistente; dependemos del ensayo y error.',
    ],
  },
  {
    id: 2,
    perspectiva: 'rrhh',
    eje: 'X',
    peso: 1,
    nombre: 'Adopción de Inteligencia Artificial',
    descripcion:
      'Mide el grado en que su equipo de ingeniería utiliza herramientas asistidas por IA para acelerar el diseño y ejecución de pruebas.',
    opciones: [
      'IA totalmente integrada en nuestros flujos de trabajo diarios.',
      'En fase de experimentación o uso básico por algunos ingenieros.',
      'Se ha discutido, pero no hay iniciativas reales implementadas.',
      'Nada; los procesos siguen siendo completamente tradicionales.',
    ],
  },
  {
    id: 3,
    perspectiva: 'rrhh',
    eje: 'Y',
    peso: 1,
    nombre: 'Tasa de Rotación / Burnout Rate',
    descripcion:
      'Refleja el impacto emocional y el nivel de estrés que los ciclos de despliegue a producción generan en su equipo técnico.',
    opciones: [
      'Proceso tranquilo y rutinario, sin estrés adicional.',
      'Genera algo de tensión, pero manejable en horario laboral.',
      'Requiere horas extras frecuentes y genera frustración evidente.',
      'Provoca renuncias, desgaste extremo y crisis nerviosas.',
    ],
  },
  {
    id: 4,
    perspectiva: 'operacion',
    eje: 'X',
    peso: 1,
    nombre: 'Tasa de Fallos (Change Failure Rate)',
    descripcion:
      'Mide la frecuencia con la que un nuevo lanzamiento a producción genera errores que requieren parches de emergencia (hotfixes).',
    opciones: [
      'Rara vez (menos del 5% de los lanzamientos).',
      'Ocasionalmente (un 10–20% de las veces).',
      'Frecuentemente (casi la mitad de los despliegues fallan).',
      'Siempre (cada despliegue significa apagar incendios).',
    ],
  },
  {
    id: 5,
    perspectiva: 'operacion',
    eje: 'X',
    peso: 1,
    nombre: 'Estabilidad de Pruebas (Flaky Tests)',
    descripcion:
      'Evalúa el porcentaje de alertas falsas en sus pruebas automatizadas debido a problemas de entorno, que hacen perder tiempo a los ingenieros.',
    opciones: [
      'Casi nunca, las alertas son siempre reales.',
      'A veces, pero lo detectamos rápido.',
      'Frecuentemente, perdemos horas revisando falsos positivos.',
      'Constantemente; nadie confía ya en la automatización.',
    ],
  },
  {
    id: 6,
    perspectiva: 'operacion',
    eje: 'X',
    peso: 1,
    nombre: 'Tiempo de Ciclo de Despliegue (Lead Time)',
    descripcion:
      'Calcula el tiempo promedio desde que se termina de escribir el código hasta que está disponible de forma segura para el usuario final.',
    opciones: [
      'Minutos u horas (integración/despliegue continuo reales).',
      'Días (requiere algunas revisiones manuales antes de salir).',
      'Semanas (fases de QA largas y tediosas).',
      'Meses (el ciclo burocrático frena el negocio).',
    ],
  },
  {
    id: 7,
    perspectiva: 'cliente',
    eje: 'Y',
    peso: 1,
    nombre: 'Disponibilidad del Sistema (Uptime / SLA)',
    descripcion:
      'Mide la estabilidad de su plataforma de cara al cliente y la frecuencia de caídas que impiden el uso normal del servicio.',
    opciones: [
      'Nunca; cumplimos rigurosamente nuestros SLAs.',
      'Caídas menores esporádicas sin gran impacto.',
      'Interrupciones notables que saturan soporte.',
      'Caídas críticas frecuentes que paralizan a los usuarios.',
    ],
  },
  {
    id: 8,
    perspectiva: 'cliente',
    eje: 'Y',
    peso: 1,
    nombre: 'Satisfacción del Cliente (CSAT / NPS)',
    descripcion:
      'Evalúa la reacción de sus usuarios cuando se enfrentan a un fallo o error introducido tras una actualización.',
    opciones: [
      'Casi no lo notan o son comprensivos.',
      'Generan tickets de soporte, pero mantienen el servicio.',
      'Exigen compensaciones o reuniones con directivos.',
      'Pérdida de confianza y daño severo a la reputación.',
    ],
  },
  {
    id: 9,
    perspectiva: 'cliente',
    eje: 'X',
    peso: 1,
    nombre: 'Velocidad de Lanzamiento (Time-to-Market)',
    descripcion:
      'Compara la rapidez con la que su empresa entrega nuevas funciones de valor frente a las demandas del mercado o la competencia.',
    opciones: [
      'Líderes; lanzamos innovaciones constantemente.',
      'A la par del mercado.',
      'Lentos; nos cuesta reaccionar a demandas de usuarios.',
      'Estancados; el esfuerzo se va en mantenimiento.',
    ],
  },
  {
    id: 10,
    perspectiva: 'financiera',
    eje: 'Y',
    peso: 1,
    nombre: 'Presupuesto de Mantenimiento (QA Budget)',
    descripcion:
      'Proporción del tiempo y presupuesto de ingeniería que se consume reparando deuda técnica en lugar de crear nuevas funcionalidades.',
    opciones: [
      'Menos del 10%.',
      'Entre 10% y 30%.',
      'Hasta un 50%. La ineficiencia consume recursos.',
      'Más del 50%. Esclavos del mantenimiento.',
    ],
  },
  {
    id: 11,
    perspectiva: 'financiera',
    eje: 'Y',
    peso: 1,
    nombre: 'Costo de Mitigación (Costo del Caos)',
    descripcion:
      'Impacto económico interno directo (horas de ingeniería, paralización de proyectos) requerido para resolver un incidente crítico.',
    opciones: [
      'Insignificante (rollback automático o minutos).',
      'Moderado (algunas horas de un desarrollador).',
      'Alto (detiene a seniors y bloquea proyectos).',
      'Crítico (pérdida de ventas directas, horas extra).',
    ],
  },
  {
    id: 12,
    perspectiva: 'financiera',
    eje: 'Y',
    peso: 1,
    nombre: 'Retención de Clientes (Churn Rate)',
    descripcion:
      'Evalúa la pérdida de ingresos recurrentes o cancelación de contratos clave generada directamente por inestabilidad del software.',
    opciones: [
      'Nulo. Clientes leales por la estabilidad.',
      'Bajo. Algún cliente pequeño se va ocasionalmente.',
      'Medio. Dificultad para cerrar renovaciones (upselling).',
      'Alto. Perdemos cuentas clave (churn) directamente por fallos.',
    ],
  },
]

export const cuestionarioV1: VersionCuestionario = {
  version: 1,
  umbral: 15,
  perspectivas: [
    { clave: 'rrhh', nombre: 'Aprendizaje y Crecimiento — Recursos Humanos', corto: 'RRHH' },
    { clave: 'operacion', nombre: 'Procesos Internos — Operación', corto: 'Operación' },
    { clave: 'cliente', nombre: 'Perspectiva del Cliente — Satisfacción', corto: 'Satisfacción' },
    { clave: 'financiera', nombre: 'Financiera', corto: 'Financiera' },
  ],
  preguntas,
  cuadrantes: {
    'codigo-rojo': {
      clave: 'codigo-rojo',
      numero: 1,
      titulo: 'Código rojo (caos total)',
      diagnostico:
        'El desarrollo está generando más problemas que soluciones. Su empresa enfrenta ineficiencia operativa constante que se traduce en costos millonarios, pérdida de clientes y alto riesgo de desgaste de su equipo (burnout).',
      servicioPrincipal: {
        nombre: 'Fractional QA Leadership + Technical Accelerators',
        descripcion:
          'Contratación de Intervención Integral. Necesita desplegar nuestro servicio de Fractional QA Leadership con urgencia para auditar, tomar el control operativo y frenar las fugas financieras, aplicando Technical Accelerators para reconstruir la infraestructura base en tiempo récord.',
      },
      servicioComplementario: qualityEngineering,
    },
    'intervencion-quirurgica': {
      clave: 'intervencion-quirurgica',
      numero: 2,
      titulo: 'Intervención quirúrgica',
      diagnostico:
        'Sus procesos son mayormente estables, pero su arquitectura es altamente sensible. Cuando ocurre un fallo, las consecuencias financieras, de reputación o de esfuerzo de mitigación son catastróficas.',
      servicioPrincipal: {
        nombre: 'Maturity & Release Readiness',
        descripcion:
          'Consultoría directa. Su equipo requiere nuestro servicio de Maturity & Release Readiness para auditar infraestructuras complejas y establecer marcos de gobernanza inquebrantables. No necesitan capacitación básica, necesitan blindaje experto para proteger el negocio.',
      },
    },
    'deuda-tecnica': {
      clave: 'deuda-tecnica',
      numero: 3,
      titulo: 'Deuda técnica operativa',
      diagnostico:
        'Su producto no sufre caídas críticas que espanten a los clientes, pero internamente la operación es lenta y costosa. Hay un exceso de procesos manuales o repetitivos que limitan gravemente su velocidad de lanzamiento al mercado.',
      servicioPrincipal: {
        nombre: 'Training & Workshops',
        descripcion:
          'Capacitación y empoderamiento. El servicio ideal para usted es Training & Workshops. South Vector capacitará a su talento interno y les proveerá plantillas (Starters) para que ellos mismos sistematicen y automaticen la calidad, devolviéndole velocidad a la empresa.',
      },
      servicioComplementario: qualityEngineering,
    },
    optimizacion: {
      clave: 'optimizacion',
      numero: 4,
      titulo: 'Zona de optimización',
      diagnostico:
        'Operación saludable y madura. Tienen controlados los fallos y sus procesos internos no representan una amenaza financiera inminente.',
      servicioPrincipal: {
        nombre: 'AI-Assisted QA Workflows',
        descripcion:
          'El siguiente nivel. Es el momento perfecto para explorar nuestros AI-Assisted QA Workflows. Consultoría estratégica para integrar Inteligencia Artificial, maximizar el rendimiento del equipo actual y consolidarse como líderes en velocidad y eficiencia frente a su competencia.',
      },
    },
  },
}
