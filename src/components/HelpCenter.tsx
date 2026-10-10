import React, { useState } from "react";
import { 
  BookOpen, 
  Download, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Play, 
  ArrowRight, 
  Lock, 
  Mail, 
  CloudLightning,
  Sparkles,
  Info,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileCode,
  Calculator,
  TrendingUp
} from "lucide-react";
import { MASTER_ADMIN_EMAIL } from "../auth";

interface HelpCenterProps {
  userEmail?: string | null;
}

export default function HelpCenter({ userEmail }: HelpCenterProps) {
  const [activeSubTab, setActiveSubTab] = useState<"whitelist" | "collaborator" | "pipeline" | "planificador">("whitelist");
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedManual, setCopiedManual] = useState<string | null>(null);

  // Private Business Planning Calculator states for Noemi
  const [estClients, setEstClients] = useState<number>(10);
  const [estPrice, setEstPrice] = useState<number>(15);
  const [estDomain, setEstDomain] = useState<number>(12);
  const [estWorkspace, setEstWorkspace] = useState<number>(7.20);
  const [estWorkspaceAdmins, setEstWorkspaceAdmins] = useState<number>(1);

  // Ready-to-use Google Apps Script for the pipeline
  const appsScriptCode = `/**
 * Smart Commerce - Tubería Automatizada de Datos
 * Automatiza la extracción de datos desde distintas planillas de la empresa
 * y las consolida en la carpeta de Martín ("Martin Sistema" en Google Drive).
 * 
 * ¡ESTE SCRIPT ES 100% GRATUITO Y SE EJECUTA EN LA NUBE DE GOOGLE!
 */

// CONFIGURACIÓN PRINCIPAL
const NOMBRE_CARPETA_MARTIN = "Martin Sistema";

function automatizarTuberiaDeDatos() {
  Logger.log("Iniciando tubería de datos...");
  
  // 1. Obtener o crear la carpeta "Martin Sistema" en tu Google Drive
  let carpetaMartin = obtenerOCrearCarpeta(NOMBRE_CARPETA_MARTIN);
  
  // ====================================================================
  // SECTOR 1: EJEMPLO DE VENTAS (Extracción automatizada de otra planilla)
  // ====================================================================
  try {
    // Reemplazar con el ID real de la planilla del sector de Ventas
    let idPlanillaVentas = "ID_DE_TU_PLANILLA_DE_VENTAS_AQUI"; 
    let datosVentasCSV = extraerDatosAFormatoCSV(idPlanillaVentas, "Hoja1");
    
    // Guardar el archivo en la carpeta de Martín
    guardarArchivoCSV(carpetaMartin, "ventas.csv", datosVentasCSV);
    Logger.log("Sector Ventas consolidado con éxito.");
  } catch (e) {
    Logger.log("Aviso: Configura tu ID de planilla de Ventas para automatizar este sector. " + e.message);
  }

  // ====================================================================
  // SECTOR 2: EJEMPLO DE STOCK / COMPRAS (Extracción automatizada)
  // ====================================================================
  try {
    // Reemplazar con el ID real de la planilla del sector de Compras
    let idPlanillaStock = "ID_DE_TU_PLANILLA_DE_STOCK_AQUI"; 
    let datosStockCSV = extraerDatosAFormatoCSV(idPlanillaStock, "Hoja1");
    
    // Guardar el archivo en la carpeta de Martín
    guardarArchivoCSV(carpetaMartin, "stock.csv", datosStockCSV);
    Logger.log("Sector Stock consolidado con éxito.");
  } catch (e) {
    Logger.log("Aviso: Configura tu ID de planilla de Stock para automatizar este sector. " + e.message);
  }

  Logger.log("Tubería de datos finalizada correctamente.");
}

// FUNCIONES AUXILIARES DE CONEXIÓN
function obtenerOCrearCarpeta(nombre) {
  let carpetas = DriveApp.getFoldersByName(nombre);
  if (carpetas.hasNext()) {
    return carpetas.next();
  } else {
    return DriveApp.createFolder(nombre);
  }
}

function extraerDatosAFormatoCSV(spreadsheetId, nombreHoja) {
  let ss = SpreadsheetApp.openById(spreadsheetId);
  let hoja = ss.getSheetByName(nombreHoja);
  let rango = hoja.getDataRange();
  let valores = rango.getValues();
  
  let contenidoCSV = "";
  for (let i = 0; i < valores.length; i++) {
    let fila = valores[i].map(function(val) {
      // Reemplazar saltos de línea y escapar comillas dobles
      let strVal = val.toString().replace(/"/g, '""');
      if (strVal.indexOf(",") > -1 || strVal.indexOf("\\n") > -1) {
        strVal = '"' + strVal + '"';
      }
      return strVal;
    });
    contenidoCSV += fila.join(",") + "\\r\\n";
  }
  return contenidoCSV;
}

function guardarArchivoCSV(carpeta, nombreArchivo, contenidoCSV) {
  let archivosExistentes = carpeta.getFilesByName(nombreArchivo);
  while (archivosExistentes.hasNext()) {
    archivosExistentes.next().setTrashed(true); // Reemplazar archivo anterior
  }
  carpeta.createFile(nombreArchivo, contenidoCSV, MimeType.PLAIN_TEXT);
}`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    if (type === "script") {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } else {
      setCopiedManual(type);
      setTimeout(() => setCopiedManual(null), 2000);
    }
  };

  const manualNoemiText = `MANUAL DE GESTIÓN DE ACCESOS - SMART COMMERCE
1. Ingresá a la pestaña de "Usuarios" en tu barra lateral.
2. Asegurate de haber iniciado sesión con tu cuenta de Google (${MASTER_ADMIN_EMAIL}).
3. En el formulario lateral, colocá el correo electrónico de Gmail del usuario que querés autorizar.
4. Hacé clic en "Otorgar Acceso". El usuario aparecerá inmediatamente en tu tabla de "Usuarios Autorizados Activos".
5. URL que debés compartirle a tus colaboradores: ${window.location.origin} (Enlace compartido de Smart Commerce).
6. Al ingresar, el sistema les pedirá loguearse con Google. Si están autorizados por vos, verán toda la interfaz; si no, se les denegará el acceso.`;

  const manualColaboradorText = `MANUAL DE CONFIGURACIÓN DE DATOS PARA COLABORADORES
1. Los colaboradores autorizados deben estructurar su información en archivos con extensión .csv o planillas legibles.
2. Cada sector (Ventas, Caja, Stock, Compras, Clientes) debe actualizar sus archivos periódicamente.
3. Se deben subir dichos archivos directamente en la pestaña "Martin Sistema (Drive)" de la app o en la carpeta compartida en su Google Drive.
4. Los archivos clave que Martín procesa son:
   - ventas.csv: Lista con 'fecha', 'monto', 'medio_pago', 'categoria'
   - stock.csv: Lista con 'producto', 'stock_actual', 'stock_minimo', 'precio_costo', 'precio_venta'
   - compras.csv: Lista de facturas de proveedores con 'proveedor', 'monto', 'estado_pago'
   - caja.csv: Movimientos diarios y arqueos.`;

  return (
    <div className="space-y-6">
      {/* Upper header card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900">Centro de Ayuda y Manuales Prácticos</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-normal">
              Acá encontrás toda la información detallada para configurar los accesos de tus colaboradores, cómo estructurar la información para que Martín trabaje de forma eficiente y cómo implementar la tubería de datos automatizada.
            </p>
          </div>
        </div>

        {/* Local sub-tabs selector */}
        <div className="flex border-b border-slate-100 mt-6 gap-4">
          <button
            onClick={() => setActiveSubTab("whitelist")}
            className={`pb-3 text-xs font-bold transition-all border-b-2 px-1 flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "whitelist"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            1. Guía de Permisos (Noemi)
          </button>
          <button
            onClick={() => setActiveSubTab("collaborator")}
            className={`pb-3 text-xs font-bold transition-all border-b-2 px-1 flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "collaborator"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Lock className="w-4 h-4" />
            2. Configuración Colaboradores
          </button>
          <button
            onClick={() => setActiveSubTab("pipeline")}
            className={`pb-3 text-xs font-bold transition-all border-b-2 px-1 flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "pipeline"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <CloudLightning className="w-4 h-4 text-amber-500 animate-pulse" />
            3. Tubería Automatizada (¡Gratis!)
          </button>

          {userEmail?.toLowerCase().trim() === MASTER_ADMIN_EMAIL.toLowerCase().trim() && (
            <button
              onClick={() => setActiveSubTab("planificador")}
              className={`pb-3 text-xs font-bold transition-all border-b-2 px-1 flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === "planificador"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-amber-500 hover:text-amber-600 font-semibold"
              }`}
            >
              <Calculator className="w-4 h-4 text-emerald-500 animate-bounce" />
              💼 4. Mi Planificador de Negocio (Privado Noemí)
            </button>
          )}
        </div>
      </div>

      {/* Manual 1: Whitelist permissions for Noemi */}
      {activeSubTab === "whitelist" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold px-2.5 py-0.5 rounded-full uppercase font-mono tracking-wider">Paso a Paso</span>
              <h3 className="font-display font-bold text-base text-slate-900 mt-2.5">Cómo autorizar a nuevos usuarios</h3>
              <p className="text-xs text-slate-500 mt-1">Sigue estas directivas sencillas para otorgar acceso de forma 100% segura.</p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 font-mono">1</div>
                <div className="text-xs leading-relaxed">
                  <strong className="text-slate-800 block">Acceder a "Usuarios"</strong>
                  Hacé clic en la pestaña <strong className="text-indigo-600">Usuarios</strong> de tu menú lateral izquierdo. Esta pestaña solo la podés ver y modificar vos como dueña del sistema.
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 font-mono">2</div>
                <div className="text-xs leading-relaxed">
                  <strong className="text-slate-800 block">Cargar el Correo</strong>
                  En el recuadro "Autorizar Nuevo Usuario", ingresá el correo electrónico de Gmail o Google Workspace de la persona que querés autorizar (ej: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">colaborador@gmail.com</code>).
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 font-mono">3</div>
                <div className="text-xs leading-relaxed">
                  <strong className="text-slate-800 block">Confirmar Autorización</strong>
                  Hacé clic en el botón <strong className="text-indigo-600">Otorgar Acceso</strong>. ¡Listo! A partir de ese segundo exacto, ese correo ya tiene luz verde en la base de datos de seguridad (Firebase Firestore).
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 font-mono">4</div>
                <div className="text-xs leading-relaxed">
                  <strong className="text-slate-800 block">Compartir el Enlace</strong>
                  Pasale al usuario tu URL de Smart Commerce:
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center justify-between mt-1.5 gap-2 font-mono text-[11px] text-slate-700">
                    <span className="truncate">{window.location.origin}</span>
                    <button 
                      onClick={() => copyToClipboard(window.location.origin, "url")}
                      className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 transition-all font-sans font-semibold text-indigo-600 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedManual === "url" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar Enlace</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">¿Qué experimentará tu colaborador?</h4>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Al abrir el enlace de Smart Commerce, el colaborador verá una pantalla de bienvenida y el botón para <strong>Iniciar Sesión con Google</strong>. 
                <br /><br />
                - <strong>Si el correo está autorizado:</strong> Accederá fluidamente a los gráficos, bases de datos y podrá conversar con Martín.
                <br /><br />
                - <strong>Si el correo NO está autorizado:</strong> El sistema bloqueará la entrada mostrando un mensaje informativo de "Acceso Restringido", indicándole que debe solicitar tu autorización.
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(manualNoemiText, "noemi")}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/15"
            >
              {copiedManual === "noemi" ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedManual === "noemi" ? "¡Manual Copiado!" : "Copiar Manual Escrito"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Manual 2: How other sectors/users configure data */}
      {activeSubTab === "collaborator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div>
              <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold px-2.5 py-0.5 rounded-full uppercase font-mono tracking-wider font-semibold">Organización de Datos</span>
              <h3 className="font-display font-bold text-base text-slate-900 mt-2.5">Cómo deben estructurar su información los colaboradores</h3>
              <p className="text-xs text-slate-500 mt-1">Para que Martín pueda leer, consolidar y responder con precisión, los datos deben estar ordenados correctamente.</p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="bg-slate-50/70 border border-slate-100 p-4 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Estructura Recomendada de Archivos CSV:
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] leading-relaxed">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                    <strong className="text-slate-800 block text-xs">📈 ventas.csv (Ventas del Comercio)</strong>
                    <p className="text-slate-500">Columnas recomendadas:</p>
                    <code className="block bg-slate-50 p-1.5 rounded font-mono text-[9px] text-indigo-600">fecha, monto, medio_pago, categoria</code>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                    <strong className="text-slate-800 block text-xs">📦 stock.csv (Inventario)</strong>
                    <p className="text-slate-500">Columnas recomendadas:</p>
                    <code className="block bg-slate-50 p-1.5 rounded font-mono text-[9px] text-indigo-600">producto, stock_actual, stock_minimo, precio_costo, precio_venta</code>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                    <strong className="text-slate-800 block text-xs">🧾 compras.csv (Facturas de Proveedores)</strong>
                    <p className="text-slate-500">Columnas recomendadas:</p>
                    <code className="block bg-slate-50 p-1.5 rounded font-mono text-[9px] text-indigo-600">proveedor, monto, estado_pago, fecha_emision</code>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                    <strong className="text-slate-800 block text-xs">💳 caja.csv (Movimientos de Caja)</strong>
                    <p className="text-slate-500">Columnas recomendadas:</p>
                    <code className="block bg-slate-50 p-1.5 rounded font-mono text-[9px] text-indigo-600">fecha, tipo_movimiento, monto, detalle</code>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0 font-mono">1</div>
                <div className="text-xs leading-relaxed">
                  <strong className="text-slate-800 block">Guardar siempre con formato .CSV o .TXT</strong>
                  Las planillas de Excel o Google Sheets se pueden descargar como archivo de texto separado por comas (.csv) en segundos para asegurar la máxima compatibilidad de procesamiento.
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0 font-mono">2</div>
                <div className="text-xs leading-relaxed">
                  <strong className="text-slate-800 block">Subida de archivos a la carpeta</strong>
                  El usuario puede arrastrar y soltar estos archivos actualizados directamente en la sección <strong className="text-emerald-600">Martin Sistema (Drive)</strong> de la aplicación para que impacte en tiempo real.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">¿Cómo se actualiza la información?</h4>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Cada colaborador puede tener acceso compartido a la carpeta <strong>"Martin Sistema"</strong> en Google Drive.
                <br /><br />
                Al actualizar o soltar los archivos allí, Martín de forma inteligente analiza las tablas para responder en el chat, actualizar los balances y automatizar tus alertas comerciales. No se requiere código por su parte, ¡sólo mantener al día las planillas!
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(manualColaboradorText, "colaborador")}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/15"
            >
              {copiedManual === "colaborador" ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedManual === "colaborador" ? "¡Manual Copiado!" : "Copiar Manual Escrito"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Manual 3: The pipeline (Tubería automatizada) 100% Free details */}
      {activeSubTab === "pipeline" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500/5 to-indigo-500/5 p-6 rounded-2xl border border-amber-500/15">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
                  <CloudLightning className="w-5 h-5 text-amber-500 animate-bounce" />
                  La Tubería de Datos Automatizada es 100% GRATUITA
                </h3>
                <p className="text-xs text-slate-600 leading-normal">
                  ¡No es necesario contratar un equipo ni pagar servicios costosos de integración de terceros! Como tu plataforma corre sobre el ecosistema de <strong>Google Cloud y Firebase</strong>, podés automatizar la recolección de archivos utilizando <strong>Google Apps Script</strong> de forma nativa y sin costo.
                </p>
              </div>
              <span className="px-4 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 font-bold rounded-full text-xs font-mono uppercase shrink-0 text-center">
                $0 USD • NATIVO DE GOOGLE
              </span>
            </div>

            {/* Answer to who builds it */}
            <div className="mt-5 p-4 bg-white/75 border border-white rounded-xl text-xs text-slate-600 leading-relaxed space-y-2">
              <strong className="text-slate-900 block">¿Quién la arma? ¿Ustedes o la empresa?</strong>
              <p>
                <strong>¡La podés armar vos en 5 minutos o dársela a cualquier colaborador!</strong> No necesitas conocimientos de programación avanzada. Abajo te dejamos el código exacto ya programado y listo para copiar. Cualquier persona en tu comercio con acceso a las planillas de Google Sheets puede implementarlo siguiendo el instructivo de 4 pasos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step by step implementation */}
            <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Play className="w-4 h-4 text-indigo-600" />
                    Pasos de Instalación en Google Sheets
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Cómo activar la tubería sin costo en 5 minutos</p>
                </div>

                <div className="space-y-3 text-[11px] leading-relaxed text-slate-600">
                  <div className="space-y-1">
                    <strong className="text-slate-800">1. Crear script en tu planilla</strong>
                    <p>Entrá a tu planilla de Google Sheets del sector (ej. Ventas), hacé clic en el menú superior <strong>Extensiones</strong> y luego elegí <strong>Apps Script</strong>.</p>
                  </div>
                  <div className="space-y-1">
                    <strong className="text-slate-800">2. Pegar el código</strong>
                    <p>Borrá cualquier texto que aparezca por defecto en el editor, y pegá completo el código que te proveemos a la derecha.</p>
                  </div>
                  <div className="space-y-1">
                    <strong className="text-slate-800">3. Configurar los IDs de planillas</strong>
                    <p>Reemplazá <code className="bg-slate-100 text-rose-600 px-1 font-mono text-[10px]">ID_DE_TU_PLANILLA_AQUI</code> con el código identificador que aparece en la URL de tu barra de direcciones del navegador.</p>
                  </div>
                  <div className="space-y-1">
                    <strong className="text-slate-800">4. Automatizar con un activador (Trigger)</strong>
                    <p>En el panel izquierdo de Apps Script, entrá al menú de <strong>Activadores (reloj)</strong>. Hacé clic en "Añadir activador", elegí la función <code className="bg-slate-100 text-indigo-600 px-1 font-mono text-[10px]">automatizarTuberiaDeDatos</code>, tipo de fuente de evento: <strong>Según el tiempo</strong>, y poné que se ejecute una vez al día o cada hora.</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[10px] text-indigo-700 leading-normal flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0 text-indigo-500 mt-0.5" />
                <span>¡Con esto, cada vez que tus colaboradores carguen datos en Google Sheets, Apps Script generará el CSV en la nube y Martín los procesará en Smart Commerce de inmediato!</span>
              </div>
            </div>

            {/* Code Box Area */}
            <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between">
              <div className="p-4 bg-slate-950 border-b border-slate-850 flex items-center justify-between">
                <span className="text-[10px] text-indigo-400 font-mono font-bold flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-indigo-400 animate-pulse" />
                  automatizar_tuberia.js • Listo para copiar
                </span>
                <button
                  onClick={() => copyToClipboard(appsScriptCode, "script")}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-[10px] font-bold text-slate-800 rounded transition-all cursor-pointer flex items-center gap-1"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                  <span>{copiedScript ? "¡Código Copiado!" : "Copiar Código"}</span>
                </button>
              </div>

              <pre className="p-5 font-mono text-[10px] text-slate-300 overflow-x-auto leading-relaxed flex-1 max-h-[350px]">
                {appsScriptCode}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Private Business Planner Tab for Noemi */}
      {activeSubTab === "planificador" && userEmail?.toLowerCase().trim() === MASTER_ADMIN_EMAIL.toLowerCase().trim() && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Calculator className="w-6 h-6 text-indigo-600" />
            <div>
              <h3 className="font-display font-bold text-slate-900 text-base">Planificador Comercial Confidencial de Smart Commerce</h3>
              <p className="text-xs text-slate-500">Estimá tus ganancias, definí tu estrategia de precios y controlá tus costos fijos de Google Workspace de forma privada.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Inputs Column */}
            <div className="lg:col-span-1 bg-slate-50/60 p-5 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="font-display font-bold text-xs text-slate-700 uppercase tracking-wider font-mono">1. Variables de tu Negocio</h4>
              
              <div className="space-y-4 pt-1">
                {/* Variable 1: Clients */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Cantidad de Clientes Activos: <span className="text-indigo-600 font-bold">{estClients}</span>
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="150" 
                    value={estClients}
                    onChange={(e) => setEstClients(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>1 cliente</span>
                    <span>150 clientes</span>
                  </div>
                </div>

                {/* Variable 2: Price */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Suscripción Mensual por Cliente: <span className="text-emerald-600 font-bold">${estPrice} USD/mes</span>
                  </label>
                  <input 
                    type="range" 
                    min="5" 
                    max="150" 
                    value={estPrice}
                    onChange={(e) => setEstPrice(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>$5 USD</span>
                    <span>$150 USD</span>
                  </div>
                </div>

                {/* Variable 3: Workspace Cost */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Costo Workspace (mensual/admin): <span className="text-rose-500 font-bold">${estWorkspace} USD</span>
                  </label>
                  <input 
                    type="range" 
                    min="6" 
                    step="0.1"
                    max="25" 
                    value={estWorkspace}
                    onChange={(e) => setEstWorkspace(parseFloat(e.target.value))}
                    className="w-full accent-rose-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>$6.00 USD</span>
                    <span>$25.00 USD</span>
                  </div>
                </div>

                {/* Variable 4: Workspace Admins */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Administradores de Workspace: <span className="text-rose-500 font-bold">{estWorkspaceAdmins}</span>
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={estWorkspaceAdmins}
                    onChange={(e) => setEstWorkspaceAdmins(parseInt(e.target.value))}
                    className="w-full accent-rose-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>1 administrador</span>
                    <span>5 administradores</span>
                  </div>
                </div>

                {/* Variable 5: Domain Cost */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Costo de Dominio Anual: <span className="text-rose-500 font-bold">${estDomain} USD/año</span>
                  </label>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={estDomain}
                    onChange={(e) => setEstDomain(parseInt(e.target.value))}
                    className="w-full accent-rose-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>$10 USD</span>
                    <span>$100 USD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Outputs Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Annual Gross Income Card */}
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest font-mono">Ingreso Bruto Total</span>
                    <h5 className="text-2xl font-bold text-emerald-800 font-mono mt-1">
                      ${(estClients * estPrice * 12).toLocaleString()} USD <span className="text-xs font-normal">/ año</span>
                    </h5>
                    <p className="text-[10px] text-emerald-600 font-medium mt-1">
                      Equivale a +${(estClients * estPrice).toLocaleString()} USD por mes en suscripciones.
                    </p>
                  </div>
                </div>

                {/* Annual Infrastructure Cost Card */}
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-rose-700 uppercase tracking-widest font-mono">Costos Fijos de Google</span>
                    <h5 className="text-2xl font-bold text-rose-800 font-mono mt-1">
                      ${(estDomain + (estWorkspace * estWorkspaceAdmins * 12)).toLocaleString("en-US", { maximumFractionDigits: 1 })} USD <span className="text-xs font-normal">/ año</span>
                    </h5>
                    <p className="text-[10px] text-rose-600 font-medium mt-1">
                      Dominio (${estDomain} USD/año) + Workspace (${(estWorkspace * estWorkspaceAdmins * 12).toLocaleString()} USD/año).
                    </p>
                  </div>
                </div>
              </div>

              {/* Net Profit Summary Panel */}
              <div className="p-6 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Ganancia Neta Anual Estimada</span>
                    <h4 className="text-3xl font-bold text-white font-mono mt-1">
                      ${((estClients * estPrice * 12) - (estDomain + (estWorkspace * estWorkspaceAdmins * 12))).toLocaleString("en-US", { maximumFractionDigits: 0 })} USD
                    </h4>
                  </div>
                  <div className="bg-indigo-950/60 border border-indigo-500/20 px-3.5 py-1.5 rounded-xl">
                    <span className="text-[9px] font-mono block text-indigo-300 uppercase">Ganancia Neta Mensual</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      +${(((estClients * estPrice * 12) - (estDomain + (estWorkspace * estWorkspaceAdmins * 12))) / 12).toLocaleString("en-US", { maximumFractionDigits: 0 })} USD/mes
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs leading-normal">
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-mono text-[10px]">Margen Operativo Neto:</span>
                    <strong className="text-emerald-400 text-sm font-mono">
                      +{((( (estClients * estPrice * 12) - (estDomain + (estWorkspace * estWorkspaceAdmins * 12)) ) / (estClients * estPrice * 12 || 1)) * 100).toFixed(1)}%
                    </strong>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 block font-mono text-[10px]">Punto de Equilibrio:</span>
                    <strong className="text-white text-sm font-semibold">
                      {Math.ceil((estDomain + (estWorkspace * estWorkspaceAdmins * 12)) / (estPrice * 12))} Clientes
                    </strong>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 block font-mono text-[10px]">Carga de Trabajo:</span>
                    <strong className="text-indigo-400 text-sm font-semibold">Automatizada por IA</strong>
                  </div>
                </div>
              </div>

              {/* Strategic Insights */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs shrink-0 font-mono font-bold">Tip Comercial</div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  <strong>Estrategia de Precios:</strong> Una suscripción de <strong>${estPrice} USD/mes</strong> es sumamente económica para un comercio, ya que equivale al precio de un par de cafés, pero para vos genera una ganancia con un margen del <strong>{((( (estClients * estPrice * 12) - (estDomain + (estWorkspace * estWorkspaceAdmins * 12)) ) / (estClients * estPrice * 12 || 1)) * 100).toFixed(0)}%</strong>. El costo de infraestructura es extremadamente bajo gracias a que Google Cloud Console es gratuito.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
