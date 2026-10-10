import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Share2, FileSpreadsheet, Loader2, Check } from 'lucide-react';
import { sendWhatsAppMessage } from '../lib/whatsappSender';

interface InventarioItem {
  Producto: string;
  Cantidad: number | string;
  Unidad?: string;
  Observaciones?: string;
  Responsable?: string;
  [key: string]: any;
}

interface BotonWhatsAppExcelProps {
  datosInventario: InventarioItem[];
  responsable?: string;
  titulo?: string;
}

export const BotonWhatsAppExcel: React.FC<BotonWhatsAppExcelProps> = ({
  datosInventario,
  responsable = "Operario/a",
  titulo = "RESUMEN DE INVENTARIO Y CONTEO POR VOZ"
}) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleEnviarWhatsApp = async () => {
    if (!datosInventario || datosInventario.length === 0) {
      setStatusMsg("⚠️ No hay ítems para enviar.");
      setTimeout(() => setStatusMsg(null), 3000);
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      // 1. Armar datos limpios para Excel
      const fechaActual = new Date().toLocaleDateString('es-AR');
      const datosExcel = datosInventario.map((item, idx) => ({
        'N°': idx + 1,
        'Producto': item.Producto || item.producto || 'Sin Nombre',
        'Cantidad': item.Cantidad || item.cantidad || 0,
        'Unidad': item.Unidad || item.unidad || 'u',
        'Responsable': item.Responsable || responsable,
        'Fecha': fechaActual,
        'Observaciones': item.Observaciones || item.observaciones || 'Conteo registrado'
      }));

      // 2. Generar Excel en el cliente con SheetJS (xlsx)
      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario_WhatsApp");
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const base64Data = btoa(
        new Uint8Array(excelBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      // 3. Subir al servidor para obtener un enlace público descargable para el grupo
      let downloadUrl = "";
      try {
        const resp = await fetch("/api/share-excel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: `Inventario_${Date.now()}.xlsx`,
            base64: base64Data
          })
        });
        const resData = await resp.json();
        if (resData.url) {
          downloadUrl = resData.url;
        }
      } catch (err) {
        console.warn("Could not generate server URL, fallback to local blob text:", err);
      }

      // 4. Armar el mensaje de texto para WhatsApp
      let mensaje = `📋 *${titulo}*\n`;
      mensaje += `👤 *Responsable:* ${responsable}\n`;
      mensaje += `📅 *Fecha:* ${fechaActual}\n`;
      mensaje += `----------------------------------\n`;

      datosInventario.forEach((item) => {
        const prod = item.Producto || item.producto || 'Producto';
        const cant = item.Cantidad || item.cantidad || 0;
        const und = item.Unidad || item.unidad || 'u';
        mensaje += `• *${prod}:* ${cant} ${und}\n`;
      });

      if (downloadUrl) {
        mensaje += `\n📥 *Descargá la planilla Excel oficial (.xlsx) aquí:*\n${downloadUrl}`;
      } else {
        mensaje += `\n✅ *Planilla Excel enviada desde Smart Commerce*`;
      }

      // 5. Abrir WhatsApp sin abrir pestañas innecesarias
      sendWhatsAppMessage({
        message: mensaje
      });

      setCopied(true);
      setStatusMsg("✅ WhatsApp abierto correctamente.");
      setTimeout(() => setCopied(false), 4000);
    } catch (error) {
      console.error("Error al preparar exportación Excel para WhatsApp:", error);
      setStatusMsg("⚠️ No se pudo generar el enlace. Revisá la conexión.");
      setTimeout(() => setStatusMsg(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarExcelDirecto = () => {
    if (!datosInventario || datosInventario.length === 0) {
      setStatusMsg("⚠️ No hay ítems de inventario para exportar.");
      setTimeout(() => setStatusMsg(null), 3000);
      return;
    }

    try {
      const fechaActual = new Date().toLocaleDateString('es-AR');
      const datosExcel = datosInventario.map((item, idx) => ({
        'N°': idx + 1,
        'Producto': item.Producto || item.producto || 'Sin Nombre',
        'Cantidad': item.Cantidad || item.cantidad || 0,
        'Unidad': item.Unidad || item.unidad || 'u',
        'Responsable': item.Responsable || responsable,
        'Fecha': fechaActual,
        'Observaciones': item.Observaciones || item.observaciones || 'Conteo registrado'
      }));

      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");

      const nombreArch = `Inventario_${fechaActual.replaceAll('/', '-')}_${Date.now().toString().slice(-4)}.xlsx`;
      XLSX.writeFile(workbook, nombreArch);
      setStatusMsg(`📥 Excel descargado: ${nombreArch}`);
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err) {
      console.error("Error al descargar Excel directamente:", err);
      setStatusMsg("❌ Error al generar el archivo Excel.");
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <button 
          onClick={handleDescargarExcelDirecto}
          className="bg-emerald-700 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer text-xs"
          title="Descargar archivo Excel .xlsx directamente a tu dispositivo"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
          <span>📥 Descargar Excel</span>
        </button>

        <button 
          onClick={handleEnviarWhatsApp}
          disabled={loading}
          className="bg-teal-700 hover:bg-teal-600 text-white px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer text-xs"
          title="Generar resumen y enlace público para WhatsApp"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Enviando...</span>
            </>
          ) : copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-teal-200" />
              <span>¡WhatsApp Abierto!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-teal-200" />
              <span>📲 WhatsApp</span>
            </>
          )}
        </button>
      </div>

      {statusMsg && (
        <span className="text-[11px] text-emerald-300 font-medium bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
          {statusMsg}
        </span>
      )}
    </div>
  );
};

export default BotonWhatsAppExcel;
