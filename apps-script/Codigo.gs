/**
 * South Vector · Diagnóstico QA — receptor de leads para Google Sheets.
 *
 * Instalación (una sola vez):
 * 1. En la Sheet de leads: Extensiones > Apps Script, pegar este archivo.
 * 2. Configuración del proyecto > Propiedades del script: agregar TOKEN con un valor largo y aleatorio.
 *    El mismo valor va en la variable SHEETS_TOKEN de Netlify.
 * 3. Implementar > Nueva implementación > Aplicación web. Ejecutar como: yo. Acceso: cualquier usuario.
 *    La URL /exec va en la variable SHEETS_WEBHOOK_URL de Netlify.
 *
 * Solo acepta pedidos con el token correcto, que únicamente conoce la función de Netlify.
 */

var HOJA = 'Leads'
var ENCABEZADOS = [
  'Fecha', 'Empresa', 'Nombre', 'Email', 'Versión',
  'KPI 1', 'KPI 2', 'KPI 3', 'KPI 4', 'KPI 5', 'KPI 6', 'KPI 7', 'KPI 8', 'KPI 9', 'KPI 10', 'KPI 11', 'KPI 12',
  'Eje X (frecuencia)', 'Eje Y (impacto)', 'Cuadrante',
  'UTM source', 'UTM medium', 'UTM campaign',
  'Estado', 'Notas',
]
var ESTADOS = ['Nuevo', 'Contactado', 'En negociación', 'Ganado', 'Perdido']
var COL_EMAIL = 4
var COL_ESTADO = 24
var VENTANA_DUPLICADO_MS = 24 * 60 * 60 * 1000

function doPost(e) {
  var lock = LockService.getScriptLock()
  try {
    var datos = JSON.parse(e.postData.contents)
    var token = PropertiesService.getScriptProperties().getProperty('TOKEN')
    if (!token || datos.token !== token) return responder({ ok: false, error: 'token inválido' })
    if (!Array.isArray(datos.respuestas) || datos.respuestas.length !== 12) {
      return responder({ ok: false, error: 'respuestas inválidas' })
    }

    lock.waitLock(10000)
    var hoja = obtenerHoja()
    var duplicado = esDuplicado(hoja, String(datos.email).toLowerCase(), new Date(datos.fecha))

    hoja.appendRow([
      new Date(datos.fecha), texto(datos.empresa), texto(datos.nombre), String(datos.email).toLowerCase(), datos.version,
    ].concat(datos.respuestas.map(Number)).concat([
      datos.ejeX, datos.ejeY, datos.cuadrante,
      texto(datos.utmSource), texto(datos.utmMedium), texto(datos.utmCampaign),
      duplicado ? 'Duplicado' : 'Nuevo', '',
    ]))
    return responder({ ok: true, duplicado: duplicado })
  } catch (err) {
    return responder({ ok: false, error: String(err) })
  } finally {
    lock.releaseLock()
  }
}

/** Prepara la hoja: encabezados, filas congeladas, filtro y lista desplegable de estados. */
function obtenerHoja() {
  var libro = SpreadsheetApp.getActiveSpreadsheet()
  var hoja = libro.getSheetByName(HOJA) || libro.insertSheet(HOJA)
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(ENCABEZADOS)
    hoja.setFrozenRows(1)
    hoja.getRange(1, 1, 1, ENCABEZADOS.length).setFontWeight('bold')
    hoja.getRange(1, 1, 1, ENCABEZADOS.length).createFilter()
    var regla = SpreadsheetApp.newDataValidation().requireValueInList(ESTADOS.concat(['Duplicado']), true).build()
    hoja.getRange(2, COL_ESTADO, hoja.getMaxRows() - 1, 1).setDataValidation(regla)
  }
  return hoja
}

/** El mismo email ya pidió un informe en las últimas 24 h. */
function esDuplicado(hoja, email, fecha) {
  var filas = hoja.getLastRow() - 1
  if (filas < 1) return false
  var desde = Math.max(2, hoja.getLastRow() - 500)
  var datos = hoja.getRange(desde, 1, hoja.getLastRow() - desde + 1, COL_EMAIL).getValues()
  return datos.some(function (fila) {
    return fila[COL_EMAIL - 1] === email && fecha - new Date(fila[0]) < VENTANA_DUPLICADO_MS
  })
}

/** Evita inyección de fórmulas: un texto que empieza con = + - @ se guarda como texto. */
function texto(valor) {
  var s = valor == null ? '' : String(valor)
  return /^[=+\-@]/.test(s) ? "'" + s : s
}

function responder(cuerpo) {
  return ContentService.createTextOutput(JSON.stringify(cuerpo)).setMimeType(ContentService.MimeType.JSON)
}
