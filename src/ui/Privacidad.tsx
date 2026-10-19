import { MESES_CONSERVACION, responsable } from '../legal'

export function Privacidad() {
  const contacto = responsable.emailPrivacidad || 'el email desde el que recibiste el informe'
  return (
    <article className="legal">
      <h1>Política de privacidad</h1>
      <p>Última actualización: 19 de octubre de 2026.</p>

      <h2>Quién trata tus datos</h2>
      <p>
        {responsable.nombre}
        {responsable.identificacion && `, ${responsable.identificacion}`}
        {responsable.domicilio && `, con domicilio en ${responsable.domicilio}`}. Contacto: {contacto}.
      </p>

      <h2>Qué datos tratamos y para qué</h2>
      <p>
        Las respuestas del diagnóstico se procesan para mostrarte el resultado y no se guardan si no pedís el informe.
        Si pedís el informe guardamos tu nombre, empresa, email, respuestas, resultado y, si existe, la campaña de la
        que llegaste (parámetros UTM). Los usamos para enviarte el informe en PDF y para contactarte sobre él.
      </p>

      <h2>Base legal</h2>
      <p>Tu consentimiento (art. 6.1.a RGPD), que podés retirar en cualquier momento sin afectar lo ya tratado.</p>

      <h2>Quién más accede</h2>
      <ul>
        <li>Netlify (alojamiento de la web): procesa el pedido en tránsito.</li>
        <li>Google (Google Sheets): almacena los pedidos de informe.</li>
        <li>Brevo (Francia): envía el email con el informe.</li>
      </ul>
      <p>
        Algunos de estos proveedores pueden tratar datos fuera del Espacio Económico Europeo, con las garantías del
        Marco de Privacidad de Datos UE-EE.UU. o cláusulas contractuales tipo. El aviso interno de nuevos pedidos no
        incluye datos personales.
      </p>

      <h2>Cuánto tiempo</h2>
      <p>
        Conservamos tus datos de contacto {MESES_CONSERVACION} meses desde el pedido o hasta que retires el
        consentimiento. Después los eliminamos y solo conservamos el resultado de forma anónima.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Podés pedir acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a {contacto}.
        También podés reclamar ante la autoridad de protección de datos competente.
      </p>

      <p>
        <a href="/">Volver al diagnóstico</a>
      </p>
    </article>
  )
}
