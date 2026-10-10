import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { 
  Camera, 
  QrCode, 
  Mic, 
  MicOff, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Truck, 
  Package, 
  Upload, 
  Send, 
  Sparkles, 
  RefreshCw,
  Copy,
  Layers,
  MapPin,
  User,
  Info,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Search,
  Paperclip,
  HelpCircle,
  FolderPlus,
  X,
  Check
} from 'lucide-react';
import * as XLSX from 'xlsx';

export interface PaqueteLogistico {
  id: string;
  trackingCode: string;
  destinatario: string;
  direccion: string;
  localidad: string;
  codigoPostal: string;
  vendedor: string;
  productoMarca?: string;
  lote?: string;
  fechaVencimiento?: string;
  consigna?: string;
  metodoCaptura: 'QR Vinculado' | 'Cámara OCR' | 'Dictado por Voz' | 'Manual' | 'Archivo / Google Drive';
  observaciones: string;
  horaIngreso: string;
}

export const EscaneoPaquetesLogistica: React.FC = () => {
  const [paquetes, setPaquetes] = useState<PaqueteLogistico[]>([
    {
      id: "PKG-101",
      trackingCode: "MELI-88219412",
      destinatario: "Martín Benítez (Kiosco El Sol)",
      direccion: "Av. Cabildo 2450 4B",
      localidad: "Belgrano, CABA",
      codigoPostal: "C1428",
      vendedor: "Distribuidora Bebidas CABA",
      productoMarca: "Coca-Cola Original 1.75L (Pack x6)",
      lote: "L240725-A",
      fechaVencimiento: "15/10/2026",
      consigna: "Entregar en local comercial antes de las 18 hs. Mantener en lugar fresco.",
      metodoCaptura: "Cámara OCR",
      observaciones: "Verificar lote con remito de entrega",
      horaIngreso: "21:15"
    },
    {
      id: "PKG-102",
      trackingCode: "PKG-774102",
      destinatario: "Gonzalo Ruiz - Almacén Don Juan",
      direccion: "Calle 14 N° 892",
      localidad: "La Plata",
      codigoPostal: "B1900",
      vendedor: "Arcor Distribución",
      productoMarca: "Galletitas Opera 220g",
      lote: "L-99812",
      fechaVencimiento: "20/12/2026",
      consigna: "Factura A requerida al momento de entrega",
      metodoCaptura: "Cámara OCR",
      observaciones: "Leído por cámara en trípode con lote y vencimiento",
      horaIngreso: "21:28"
    }
  ]);

  const [modoEscaneo, setModoEscaneo] = useState<'camara' | 'qr' | 'voz' | 'archivo'>('camara');
  const [cargando, setCargando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState<string>('');
  
  // WebCam state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [modoCamaraActual, setModoCamaraActual] = useState<'environment' | 'user'>('environment');
  const [errorCamara, setErrorCamara] = useState<string | null>(null);
  const [dispositivosCamara, setDispositivosCamara] = useState<MediaDeviceInfo[]>([]);
  const [camaraSeleccionadaId, setCamaraSeleccionadaId] = useState<string>('');

  // Manual & Voice state
  const [inputQR, setInputQR] = useState('');
  const [escuchandoVoz, setEscuchandoVoz] = useState(false);
  const [transcripcionVoz, setTranscripcionVoz] = useState('');
  const recognitionRef = useRef<any>(null);

  // Drive & File Scan states
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputGaleriaRef = useRef<HTMLInputElement | null>(null);
  const fileInputCamaraRef = useRef<HTMLInputElement | null>(null);
  const hojaDeRutaRef = useRef<HTMLDivElement | null>(null);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [cargandoDrive, setCargandoDrive] = useState(false);
  const [busquedaDrive, setBusquedaDrive] = useState('');
  const [busquedaPaquetes, setBusquedaPaquetes] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'con_lote' | 'con_consigna'>('todos');
  const [mostrarAyudaWhatsApp, setMostrarAyudaWhatsApp] = useState(false);
  const [mostrarModalScript, setMostrarModalScript] = useState(false);
  const [copiadoScript, setCopiadoScript] = useState(false);

  const googleAppsScriptCodigo = `function organizarFotosWhatsApp() {
  // 1. Buscamos las carpetas por nombre en Google Drive
  var carpetasInbox = DriveApp.getFoldersByName("Inbox_WhatsApp");
  var carpetasDestino = DriveApp.getFoldersByName("Carpeta_Escaneo_QR");
  
  if (!carpetasInbox.hasNext() || !carpetasDestino.hasNext()) {
    Logger.log("Faltan crear las carpetas 'Inbox_WhatsApp' o 'Carpeta_Escaneo_QR' en el Drive.");
    return;
  }
  
  var inbox = carpetasInbox.next();
  var destino = carpetasDestino.next();
  
  // 2. Listamos todos los archivos en la bandeja de entrada
  var archivos = inbox.getFiles();
  
  while (archivos.hasNext()) {
    var archivo = archivos.next();
    var nombreArchivo = archivo.getName().toLowerCase();
    var mimeType = archivo.getMimeType();
    
    // 3. Verificamos si es una imagen (filtro de fotos de paquetes)
    var esImagen = mimeType.indexOf("image/") !== -1 || 
                   nombreArchivo.endsWith(".jpg") || 
                   nombreArchivo.endsWith(".jpeg") || 
                   nombreArchivo.endsWith(".png") || 
                   nombreArchivo.endsWith(".webp");
    
    if (esImagen) {
      // Si es foto de paquete, la copiamos a la carpeta de escaneo QR (los textos .txt se ignoran)
      archivo.makeCopy(nombreArchivo, destino);
      Logger.log("Imagen de paquete procesada y movida: " + nombreArchivo);
    }
  }
}`;

  const copiarScriptAlPortapapeles = () => {
    navigator.clipboard.writeText(googleAppsScriptCodigo);
    setCopiadoScript(true);
    setTimeout(() => setCopiadoScript(false), 3000);
  };

  const ejecutarFiltroFotosDrive = async () => {
    setCargandoDrive(true);
    setMensajeEstado("⚡ Ejecutando filtro organizarFotosWhatsApp en Google Drive...");
    try {
      const resp = await fetch("/api/whatsapp/organize-drive-photos", {
        method: "POST"
      });
      const data = await resp.json();
      if (data.success) {
        setMensajeEstado(data.message);
        buscarArchivosDrive();
      } else {
        setMensajeEstado(`❌ Error: ${data.error || "No se pudieron organizar las fotos en Drive"}`);
      }
    } catch (err) {
      console.error("Error al ejecutar filtro de fotos:", err);
      setMensajeEstado("❌ Error de comunicación con el servidor.");
    } finally {
      setCargandoDrive(false);
    }
  };

  // Auto-activación de Cámara al elegir modo 'camara'
  useEffect(() => {
    if (modoEscaneo === 'camara') {
      iniciarCamara('environment');
    } else {
      detenerCamara();
    }
    return () => detenerCamara();
  }, [modoEscaneo]);

  const iniciarCamara = async (preferredFacingMode?: 'environment' | 'user', specificDeviceId?: string) => {
    detenerCamara();
    setCamaraActiva(false);
    setErrorCamara(null);

    const targetMode = preferredFacingMode || modoCamaraActual;

    const attempts: MediaStreamConstraints[] = [];

    if (specificDeviceId) {
      attempts.push({ video: { deviceId: { exact: specificDeviceId } } });
    }

    if (targetMode === 'environment') {
      attempts.push(
        { video: { facingMode: { exact: 'environment' } } },
        { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } },
        { video: { facingMode: 'environment' } }
      );
    } else {
      attempts.push(
        { video: { facingMode: 'user' } }
      );
    }

    // Enumerar dispositivos para encontrar cámaras traseras si existen
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setDispositivosCamara(videoDevices);

        if (targetMode === 'environment' && videoDevices.length > 0 && !specificDeviceId) {
          const backCam = videoDevices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('rear') || 
            d.label.toLowerCase().includes('trasera') || 
            d.label.toLowerCase().includes('environment')
          ) || videoDevices[videoDevices.length - 1]; // La última cámara en móviles suele ser la principal trasera

          if (backCam && backCam.deviceId) {
            attempts.push({ video: { deviceId: { exact: backCam.deviceId } } });
          }
        }
      }
    } catch (e) {
      console.warn("Error enumerando cámaras:", e);
    }

    // Intentos genéricos de respaldo
    attempts.push({ video: { facingMode: 'environment' } });
    attempts.push({ video: { facingMode: 'user' } });
    attempts.push({ video: true });

    let streamObtenido: MediaStream | null = null;
    let lastError: any = null;

    for (const constraint of attempts) {
      try {
        streamObtenido = await navigator.mediaDevices.getUserMedia(constraint);
        if (streamObtenido) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (streamObtenido && videoRef.current) {
      videoRef.current.srcObject = streamObtenido;
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.setAttribute('autoplay', 'true');
      videoRef.current.muted = true;
      try {
        await videoRef.current.play();
      } catch (pErr) {
        console.warn("Reproducción diferida:", pErr);
      }
      setCamaraActiva(true);
      setErrorCamara(null);
      setModoCamaraActual(targetMode);
    } else {
      console.error("No se pudo iniciar la cámara trasera:", lastError);
      setCamaraActiva(false);
      setErrorCamara("No se pudo encender la cámara trasera directamente. Asegurate de habilitar los permisos de cámara en tu navegador o usá el botón 'Elegir Foto de Galería / Sacar Foto con Celular'.");
    }
  };

  const detenerCamara = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCamaraActiva(false);
    }
  };

  const alternarCamara = () => {
    const nuevoModo = modoCamaraActual === 'environment' ? 'user' : 'environment';
    setModoCamaraActual(nuevoModo);
    iniciarCamara(nuevoModo);
  };

  // Capturar foto de la cámara en trípode y mandar a procesar con Gemini OCR
  const capturarYProcesarCamara = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!videoRef.current || !canvasRef.current) return;
    
    setCargando(true);
    setMensajeEstado('📸 Capturando foto y analizando dirección con Inteligencia Artificial...');

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.85);

      const resp = await fetch('/api/process-package-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'ocr', imageBase64 })
      });
      const resData = await resp.json();

      if (resData.success && resData.data) {
        const isGenericOrNoAddress = !resData.data.direccion || 
                                     resData.data.direccion.includes('Dirección leída por cámara') ||
                                     resData.data.direccion.toLowerCase().includes('no detectad');

        const nuevoPkg: PaqueteLogistico = {
          id: `PKG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          trackingCode: resData.data.trackingCode || `PKG-${Math.floor(1000 + Math.random()*9000)}`,
          destinatario: resData.data.destinatario || 'Cliente Final',
          direccion: resData.data.direccion || 'Dirección detectada por Cámara',
          localidad: resData.data.localidad || 'Zona de Entrega',
          codigoPostal: resData.data.codigoPostal || 'S/D',
          vendedor: resData.data.vendedor || 'Vendedor Sin Vincular',
          productoMarca: resData.data.productoMarca || 'General / Sin Marca',
          lote: resData.data.lote || 'S/D',
          fechaVencimiento: resData.data.fechaVencimiento || 'S/D',
          consigna: resData.data.consigna || '',
          metodoCaptura: 'Cámara OCR',
          observaciones: resData.data.observaciones || 'Escaneado por Cámara en Trípode',
          horaIngreso: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        };

        setPaquetes(prev => [nuevoPkg, ...prev]);

        const detalleLote = resData.data.lote && resData.data.lote !== 'S/D' ? ` | Lote: ${resData.data.lote}` : '';
        const detalleVenc = resData.data.fechaVencimiento && resData.data.fechaVencimiento !== 'S/D' ? ` | Vence: ${resData.data.fechaVencimiento}` : '';

        if (isGenericOrNoAddress) {
          setMensajeEstado(`✅ Registrado: ${nuevoPkg.productoMarca}${detalleLote}${detalleVenc}. (Si es de envío, enfoca la etiqueta con dirección)`);
        } else {
          setMensajeEstado(`✅ Paquete registrado: ${nuevoPkg.direccion} (${nuevoPkg.productoMarca}${detalleLote}${detalleVenc})`);
        }
      } else {
        setMensajeEstado('⚠️ La etiqueta no fue totalmente clara. Reintenta enfocar la etiqueta o usa dictado por voz.');
      }
    } catch (err) {
      console.error("Error al procesar foto:", err);
      setMensajeEstado('❌ Error al procesar la foto. Intente nuevamente sin recargar.');
    } finally {
      setCargando(false);
    }
  };

  // Dictado por voz para etiquetas borrosas o ilegibles
  const toggleEscucharVoz = () => {
    if (escuchandoVoz) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setEscuchandoVoz(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta Reconocimiento de Voz nativo. Podés escribir los datos manualmente.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-AR';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setEscuchandoVoz(true);
      setMensajeEstado('🎙️ Escuchando... Dictá la dirección (Ej: "Corrientes 1530 Quilmes para Juan Pérez")');
    };

    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setTranscripcionVoz(transcript);
    };

    recognition.onerror = () => {
      setEscuchandoVoz(false);
      setMensajeEstado('⚠️ No se detectó audio claro. Volvé a presionar el micrófono.');
    };

    recognition.onend = () => {
      setEscuchandoVoz(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const enviarDictadoVoz = async () => {
    if (!transcripcionVoz.trim()) return;

    setCargando(true);
    setMensajeEstado('🧠 Estructurando datos dictados por voz...');

    try {
      const resp = await fetch('/api/process-package-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'voice', textInput: transcripcionVoz })
      });
      const resData = await resp.json();

      if (resData.success && resData.data) {
        const nuevoPkg: PaqueteLogistico = {
          id: `PKG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          trackingCode: resData.data.trackingCode || `PKG-VOZ-${Math.floor(100 + Math.random()*900)}`,
          destinatario: resData.data.destinatario || 'Cliente Final',
          direccion: resData.data.direccion || transcripcionVoz,
          localidad: resData.data.localidad || 'General',
          codigoPostal: resData.data.codigoPostal || 'S/D',
          vendedor: 'Dictado por Voz (Etiqueta/Producto)',
          productoMarca: resData.data.productoMarca || 'General / Dictado',
          lote: resData.data.lote || 'S/D',
          fechaVencimiento: resData.data.fechaVencimiento || 'S/D',
          consigna: resData.data.consigna || '',
          metodoCaptura: 'Dictado por Voz',
          observaciones: resData.data.observaciones || 'Ingresado por dictado de voz',
          horaIngreso: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        };

        setPaquetes(prev => [nuevoPkg, ...prev]);
        setTranscripcionVoz('');
        setMensajeEstado(`✅ Registrado por voz: ${nuevoPkg.direccion} (${nuevoPkg.productoMarca})`);
      }
    } catch (err) {
      console.error("Error al procesar voz:", err);
    } finally {
      setCargando(false);
    }
  };

  // Procesar escaneo de QR (con pistola o lector)
  const handleProcesarQR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQR.trim()) return;

    const nuevoPkg: PaqueteLogistico = {
      id: `PKG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      trackingCode: inputQR.slice(0, 20),
      destinatario: 'Cliente Vinculado',
      direccion: `Dirección vinculada a QR: ${inputQR.slice(0, 15)}...`,
      localidad: 'Maza de Distribución',
      codigoPostal: 'C1000',
      vendedor: 'Mercado Libre / Plataforma',
      metodoCaptura: 'QR Vinculado',
      observaciones: 'Paquete escaneado con Pistola QR',
      horaIngreso: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    };

    setPaquetes(prev => [nuevoPkg, ...prev]);
    setInputQR('');
    setMensajeEstado(`⚡ QR Escaneado correctamente: ${nuevoPkg.trackingCode}`);
  };

  // Escanear archivos en Google Drive
  const buscarArchivosDrive = async () => {
    setCargandoDrive(true);
    setMensajeEstado('📂 Escaneando Google Drive en busca de fotos de paquetes y chats de WhatsApp...');
    try {
      const resp = await fetch('/api/whatsapp/scan-drive');
      const data = await resp.json();
      if (data.files && Array.isArray(data.files)) {
        setDriveFiles(data.files);
        setMensajeEstado(`✅ Se encontraron ${data.files.length} archivos en Google Drive para procesar.`);
      } else {
        setMensajeEstado('ℹ️ No se detectaron archivos nuevos en Google Drive.');
      }
    } catch (err) {
      console.error("Error al buscar en Drive:", err);
      setMensajeEstado('❌ Error al conectar con Google Drive.');
    } finally {
      setCargandoDrive(false);
    }
  };

  // Procesar un archivo individual traído desde Google Drive descargando su contenido real
  const procesarArchivoDriveIndiv = async (file: { id: string; name: string; mimeType: string }) => {
    setCargando(true);
    setMensajeEstado(`📥 Descargando "${file.name}" desde Google Drive...`);
    try {
      const resp = await fetch(`/api/drive/get-file-content/${file.id}`);
      const data = await resp.json();
      if (data.success) {
        if (data.base64) {
          setMensajeEstado(`🧠 Escaneando foto "${file.name}" con Inteligencia Artificial OCR...`);
          await procesarFotoOArchivo({
            name: file.name,
            base64: data.base64,
            mimeType: data.mimeType || file.mimeType
          });
        } else if (data.textContent) {
          setMensajeEstado(`🧠 Analizando texto de chat de WhatsApp "${file.name}"...`);
          await procesarFotoOArchivo({
            name: file.name,
            textContent: data.textContent
          });
        } else {
          setMensajeEstado(`⚠️ No se pudo extraer contenido procesable de "${file.name}".`);
        }
      } else {
        setMensajeEstado(`❌ Error descargando "${file.name}" de Drive: ${data.error || 'Desconocido'}`);
      }
    } catch (err) {
      console.error("Error al procesar archivo individual de Drive:", err);
      setMensajeEstado(`❌ Error de conexión al procesar "${file.name}".`);
    } finally {
      setCargando(false);
    }
  };

  // Procesar TODOS los archivos de Google Drive masivamente con 1 solo clic
  const procesarTodosArchivosDrive = async () => {
    const archivosFiltrados = driveFiles.filter(f => f.name.toLowerCase().includes(busquedaDrive.toLowerCase()));
    if (archivosFiltrados.length === 0) return;

    setCargando(true);
    let ingresados = 0;

    for (let i = 0; i < archivosFiltrados.length; i++) {
      const file = archivosFiltrados[i];
      setMensajeEstado(`⏳ [${i + 1}/${archivosFiltrados.length}] Descargando y leyendo "${file.name}" desde Google Drive...`);

      try {
        const resp = await fetch(`/api/drive/get-file-content/${file.id}`);
        const data = await resp.json();

        if (data.success) {
          if (data.base64) {
            await procesarFotoOArchivo({
              name: file.name,
              base64: data.base64,
              mimeType: data.mimeType || file.mimeType
            });
            ingresados++;
          } else if (data.textContent) {
            await procesarFotoOArchivo({
              name: file.name,
              textContent: data.textContent
            });
            ingresados++;
          }
        }
      } catch (err) {
        console.error(`Error procesando archivo ${file.name}:`, err);
      }
    }

    setCargando(false);
    setMensajeEstado(`🎉 ¡Proceso masivo completado! Se analizaron ${archivosFiltrados.length} archivos de Drive y se agregaron a la Hoja de Ruta.`);
    setTimeout(() => {
      hojaDeRutaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
  };

  // Helper para optimizar y comprimir imágenes pesadas de celulares (evita bloqueos en móviles con 16+ fotos)
  const compressImageFile = (file: File, maxWidth = 1280, maxHeight = 1280, quality = 0.82): Promise<{ name: string; base64: string; mimeType: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onerror = () => resolve({ name: file.name, base64: '', mimeType: file.type || 'image/jpeg' });
      reader.onload = (event) => {
        const img = new Image();
        img.onerror = () => {
          resolve({ name: file.name, base64: event.target?.result as string, mimeType: file.type || 'image/jpeg' });
        };
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ name: file.name, base64: event.target?.result as string, mimeType: file.type || 'image/jpeg' });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve({
            name: file.name,
            base64: compressedBase64,
            mimeType: 'image/jpeg'
          });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Procesar archivo proveniente de Google Drive o Subido localmente
  const procesarFotoOArchivo = async (
    fileData: { name: string; base64?: string; textContent?: string; mimeType?: string },
    isBatch = false
  ): Promise<boolean> => {
    if (!isBatch) setCargando(true);
    setMensajeEstado(`🧠 Procesando "${fileData.name}" con Inteligencia Artificial OCR...`);

    let exito = false;

    try {
      if (fileData.base64) {
        const resp = await fetch('/api/process-package-label', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'ocr',
            imageBase64: fileData.base64,
            mimeType: fileData.mimeType || 'image/jpeg'
          })
        });
        const resData = await resp.json();
        if (resData.success && resData.data) {
          const nuevoPkg: PaqueteLogistico = {
            id: `PKG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            trackingCode: resData.data.trackingCode || `PKG-DRIVE-${Math.floor(1000 + Math.random()*9000)}`,
            destinatario: resData.data.destinatario || 'Cliente de Foto/Drive',
            direccion: resData.data.direccion || 'Dirección detectada en la foto de WhatsApp/Drive',
            localidad: resData.data.localidad || 'Zona de Entrega',
            codigoPostal: resData.data.codigoPostal || 'S/D',
            vendedor: `WhatsApp/Drive: ${fileData.name.slice(0, 20)}`,
            productoMarca: resData.data.productoMarca || 'General / Foto',
            lote: resData.data.lote || 'S/D',
            fechaVencimiento: resData.data.fechaVencimiento || 'S/D',
            consigna: resData.data.consigna || '',
            metodoCaptura: 'Archivo / Google Drive',
            observaciones: resData.data.observaciones || `Etiqueta extraída de ${fileData.name}`,
            horaIngreso: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
          };

          setPaquetes(prev => [nuevoPkg, ...prev]);
          if (!isBatch) setMensajeEstado(`✅ ¡Extraído de "${fileData.name}": ${nuevoPkg.direccion} (${nuevoPkg.productoMarca})!`);
          exito = true;
        } else {
          if (!isBatch) setMensajeEstado(`⚠️ No se pudo leer la etiqueta en "${fileData.name}". Intentá con otra foto más clara.`);
        }
      } else if (fileData.textContent) {
        // Chat de WhatsApp exportado o texto
        const resp = await fetch('/api/process-package-label', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'voice',
            textInput: fileData.textContent.slice(0, 3000)
          })
        });
        const resData = await resp.json();
        if (resData.success && resData.data) {
          const nuevoPkg: PaqueteLogistico = {
            id: `PKG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            trackingCode: resData.data.trackingCode || `PKG-WA-${Math.floor(1000 + Math.random()*9000)}`,
            destinatario: resData.data.destinatario || 'Cliente Chat WhatsApp',
            direccion: resData.data.direccion || 'Dirección leída de Chat WhatsApp',
            localidad: resData.data.localidad || 'General',
            codigoPostal: resData.data.codigoPostal || 'S/D',
            vendedor: `Chat WhatsApp (${fileData.name})`,
            productoMarca: resData.data.productoMarca || 'General / Chat',
            lote: resData.data.lote || 'S/D',
            fechaVencimiento: resData.data.fechaVencimiento || 'S/D',
            consigna: resData.data.consigna || '',
            metodoCaptura: 'Archivo / Google Drive',
            observaciones: `Datos extraídos del chat de WhatsApp exportado`,
            horaIngreso: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
          };

          setPaquetes(prev => [nuevoPkg, ...prev]);
          if (!isBatch) setMensajeEstado(`✅ ¡Paquete extraído del chat de WhatsApp "${fileData.name}": ${nuevoPkg.direccion}!`);
          exito = true;
        }
      }
    } catch (err) {
      console.error("Error al procesar archivo/foto:", err);
      if (!isBatch) setMensajeEstado(`❌ Error procesando el archivo "${fileData.name}".`);
    } finally {
      if (!isBatch) setCargando(false);
    }

    return exito;
  };

  // Crear Carpetas Organizadas en Google Drive (Martin Sistema / Inbox / WhatsApp / Fotos_Paquetes)
  const crearEstructuraDrive = async () => {
    setCargandoDrive(true);
    setMensajeEstado("📂 Creando estructura de carpetas en Google Drive (/Inbox/WhatsApp/Fotos_Paquetes)...");
    try {
      const resp = await fetch("/api/whatsapp/setup-drive-structure", {
        method: "POST"
      });
      const data = await resp.json();
      if (data.success) {
        setMensajeEstado(`✅ ${data.message}`);
        // Refrescar lista de archivos
        buscarArchivosDrive();
      } else {
        setMensajeEstado(`❌ ${data.error || "No se pudo crear la estructura en Drive"}`);
      }
    } catch (err) {
      console.error("Error al crear carpetas en Drive:", err);
      setMensajeEstado("❌ Error de comunicación con Google Drive.");
    } finally {
      setCargandoDrive(false);
    }
  };

  const handleFileUploadLocal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);
    setCargando(true);
    let fotosExitosas = 0;
    let fotosConError = 0;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setMensajeEstado(`📦 [${i + 1}/${fileList.length}] Procesando "${file.name}"... (✅ ${fotosExitosas} | ❌ ${fotosConError})`);

      // Si es un archivo ZIP exportado de WhatsApp (con fotos y chat)
      if (file.name.endsWith('.zip') || file.type.includes('zip')) {
        setMensajeEstado(`📦 Desempaquetando ZIP de WhatsApp "${file.name}"... Filtrando solo las FOTOS de paquetes...`);

        try {
          const zip = new JSZip();
          const zipContent = await zip.loadAsync(file);
          let fotosContadas = 0;

          for (const [filename, fileObj] of Object.entries(zipContent.files)) {
            // Descartar carpetas, archivos .txt de chat y buscar únicamente fotos
            if (!fileObj.dir && filename.match(/\.(jpg|jpeg|png|webp|bmp)$/i)) {
              fotosContadas++;
              const base64Data = await fileObj.async('base64');
              const ext = filename.split('.').pop()?.toLowerCase() || 'jpeg';
              const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

              setMensajeEstado(`🧠 Escaneando foto ${fotosContadas} del ZIP: "${filename}"...`);
              const resOk = await procesarFotoOArchivo({
                name: filename,
                base64: `data:${mimeType};base64,${base64Data}`,
                mimeType
              }, true);

              if (resOk) fotosExitosas++; else fotosConError++;
            }
          }

          if (fotosContadas === 0) {
            setMensajeEstado(`⚠️ No se encontraron fotos dentro del ZIP. El texto del chat fue descartado.`);
          }
        } catch (err) {
          console.error("Error al descomprimir ZIP:", err);
          fotosConError++;
          setMensajeEstado(`❌ No se pudo desempaquetar el archivo ZIP "${file.name}".`);
        }
        continue;
      }

      // Si es una foto o imagen individual
      const isImage = file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|webp|bmp)$/i);
      
      if (isImage) {
        try {
          setMensajeEstado(`🧠 [${i + 1}/${fileList.length}] Optimizando y escaneando foto "${file.name}"...`);
          const compressed = await compressImageFile(file);
          if (compressed.base64) {
            const resOk = await procesarFotoOArchivo({
              name: compressed.name,
              base64: compressed.base64,
              mimeType: compressed.mimeType
            }, true);
            if (resOk) fotosExitosas++; else fotosConError++;
          } else {
            fotosConError++;
          }
        } catch (err) {
          console.error("Error al comprimir/procesar imagen:", err);
          await new Promise<void>((resolve) => {
            const reader = new FileReader();
            reader.onload = async (event) => {
              const base64 = event.target?.result as string;
              const resOk = await procesarFotoOArchivo({
                name: file.name,
                base64: base64,
                mimeType: file.type || 'image/jpeg'
              }, true);
              if (resOk) fotosExitosas++; else fotosConError++;
              resolve();
            };
            reader.onerror = () => {
              fotosConError++;
              resolve();
            };
            reader.readAsDataURL(file);
          });
        }
      } else {
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const text = event.target?.result as string;
            const resOk = await procesarFotoOArchivo({
              name: file.name,
              textContent: text
            }, true);
            if (resOk) fotosExitosas++; else fotosConError++;
            resolve();
          };
          reader.onerror = () => {
            fotosConError++;
            resolve();
          };
          reader.readAsText(file);
        });
      }
    }

    setCargando(false);
    e.target.value = '';

    if (fileList.length > 0) {
      if (fotosConError > 0) {
        setMensajeEstado(`⚠️ Proceso finalizado (${fileList.length} archivos): ✅ ${fotosExitosas} ingresados con éxito | ❌ ${fotosConError} con error o ilegibles. Mirá la lista abajo.`);
      } else {
        setMensajeEstado(`🎉 ¡Escaneo completado! Se ingresaron las ${fotosExitosas} fotos a la Hoja de Ruta sin errores.`);
      }
      setTimeout(() => {
        hojaDeRutaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  };

  // State for generated Excel files history folder
  const [archivosGuardados, setArchivosGuardados] = useState<
    Array<{ id: string; nombre: string; fecha: string; totalPaquetes: number; dataBase64?: string; downloadUrl?: string; paquetesList: PaqueteLogistico[] }>
  >([
    {
      id: "ARCH-01",
      nombre: "Hoja_de_Ruta_Deposito_TurnoMañana.xlsx",
      fecha: new Date().toLocaleDateString('es-AR') + " 10:30",
      totalPaquetes: 15,
      paquetesList: []
    }
  ]);
  const [mostrarCarpeta, setMostrarCarpeta] = useState(false);

  // 1. DESCARGA DIRECTA DE EXCEL (Sin pasar por WhatsApp)
  const descargarExcelDirecto = async () => {
    if (paquetes.length === 0) {
      setMensajeEstado("⚠️ No hay paquetes registrados en la planilla actual.");
      return;
    }

    setCargando(true);
    try {
      const fecha = new Date().toLocaleDateString('es-AR');
      const horaStr = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }).replace(':', '');
      const nombreArchivo = `HojaDeRuta_Logistica_${fecha.replaceAll('/', '-')}_${horaStr}.xlsx`;

      const datosExcel = paquetes.map((p, index) => ({
        'N°': index + 1,
        'ID Paquete': p.id,
        'Tracking / QR': p.trackingCode,
        'Producto / Marca': p.productoMarca || 'General',
        'N° de Lote': p.lote || 'S/D',
        'Fecha Vencimiento': p.fechaVencimiento || 'S/D',
        'Consigna de Entrega / Venta': p.consigna || '',
        'Destinatario / Comercio': p.destinatario,
        'Dirección de Entrega': p.direccion,
        'Localidad': p.localidad,
        'Código Postal': p.codigoPostal,
        'Vendedor / Remitente': p.vendedor,
        'Método de Ingreso': p.metodoCaptura,
        'Hora Registrado': p.horaIngreso,
        'Observaciones': p.observaciones
      }));

      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Hoja_de_Ruta");

      // Descarga inmediata al dispositivo del usuario
      XLSX.writeFile(workbook, nombreArchivo);

      // Guardar en la carpeta/historial de planillas del panel
      const nuevoArchivo = {
        id: `ARCH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        nombre: nombreArchivo,
        fecha: `${fecha} ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`,
        totalPaquetes: paquetes.length,
        paquetesList: [...paquetes]
      };
      setArchivosGuardados(prev => [nuevoArchivo, ...prev]);

      setMensajeEstado(`📥 ¡Excel descargado de forma inmediata en tu dispositivo! Archivo: ${nombreArchivo}`);
    } catch (err) {
      console.error("Error al descargar Excel:", err);
      setMensajeEstado("❌ Hubo un error al generar la descarga directa de Excel.");
    } finally {
      setCargando(false);
    }
  };

  // 2. ENVIAR HOJA DE RUTA POR WHATSAPP
  const enviarWhatsAppSolo = async () => {
    if (paquetes.length === 0) {
      setMensajeEstado("⚠️ No hay paquetes registrados para enviar por WhatsApp.");
      return;
    }

    setCargando(true);
    try {
      const fecha = new Date().toLocaleDateString('es-AR');
      const datosExcel = paquetes.map((p, index) => ({
        'N°': index + 1,
        'ID Paquete': p.id,
        'Tracking / QR': p.trackingCode,
        'Destinatario': p.destinatario,
        'Dirección de Entrega': p.direccion,
        'Localidad': p.localidad,
        'Código Postal': p.codigoPostal,
        'Vendedor / Remitente': p.vendedor,
        'Método de Ingreso': p.metodoCaptura,
        'Hora': p.horaIngreso,
        'Observaciones': p.observaciones
      }));

      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Hoja_de_Ruta");

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const base64Data = btoa(
        new Uint8Array(excelBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      let downloadUrl = "";
      try {
        const resp = await fetch("/api/share-excel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: `HojaDeRuta_${Date.now()}.xlsx`,
            base64: base64Data
          })
        });
        const resData = await resp.json();
        if (resData.url) downloadUrl = resData.url;
      } catch (err) {
        console.warn("Could not obtain server download link:", err);
      }

      let text = `📦 *HOJA DE RUTA LOGÍSTICA - DEPO Y DISTRIBUCIÓN*\n`;
      text += `📅 *Fecha:* ${fecha} | 📊 *Total Paquetes:* ${paquetes.length}\n`;
      text += `----------------------------------------------\n`;

      paquetes.forEach((p, idx) => {
        text += `${idx + 1}. *[${p.metodoCaptura}]* ${p.direccion} (${p.destinatario})\n`;
      });

      if (downloadUrl) {
        text += `\n📥 *Descargá el Excel Oficial para el Chofer:*\n${downloadUrl}`;
      } else {
        text += `\n✅ *Lista generada con Smart Logistics AI*`;
      }

      const urlWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(urlWhatsApp, '_blank');
      setMensajeEstado(`📲 Mensaje de WhatsApp preparado correctamente.`);
    } catch (err) {
      console.error("Error al compartir WhatsApp:", err);
      setMensajeEstado("❌ Error al conectar con WhatsApp.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-800 space-y-6">
      {/* Header con Botones Separados */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Truck className="w-4 h-4" />
            Módulo de Recepción Logística Inteligente
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            Ingreso de Paquetes: QR + Cámara OCR + Voz
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Solución integral para vendedores vinculados y no vinculados sin pérdida de tiempo en depósito.
          </p>
        </div>

        {/* GRUPO DE BOTONES SEPARADOS DE EXCEL Y WHATSAPP */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* BOTÓN 1: DESCARGA DIRECTA DE EXCEL */}
          <button
            onClick={descargarExcelDirecto}
            disabled={cargando || paquetes.length === 0}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50 text-xs sm:text-sm border border-emerald-400/30"
            title="Descarga directa inmediata del archivo .xlsx a tu computadora o celular"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>📥 Descargar Excel Directo ({paquetes.length})</span>
          </button>

          {/* BOTÓN 2: ENVIAR POR WHATSAPP */}
          <button
            onClick={enviarWhatsAppSolo}
            disabled={cargando || paquetes.length === 0}
            className="bg-teal-700 hover:bg-teal-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50 text-xs sm:text-sm border border-teal-500/30"
            title="Compartir la hoja de ruta y enlace público por WhatsApp"
          >
            <Send className="w-4 h-4 text-teal-200" />
            <span>📲 Enviar por WhatsApp</span>
          </button>

          {/* BOTÓN 3: CARPETA DE ARCHIVOS GENERADOS */}
          <button
            onClick={() => setMostrarCarpeta(!mostrarCarpeta)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2.5 rounded-xl shadow border border-slate-700 flex items-center gap-2 transition-all cursor-pointer text-xs sm:text-sm"
            title="Ver la carpeta interna con todos los archivos Excel generados"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>📂 Carpeta de Planillas ({archivosGuardados.length})</span>
          </button>
        </div>
      </div>

      {/* PANEL MODAL / VISOR DE LA CARPETA DE ARCHIVOS EXCEL */}
      {mostrarCarpeta && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              📂 Carpeta de Archivos Excel y Hojas de Ruta Generadas en el Panel
            </h4>
            <button
              onClick={() => setMostrarCarpeta(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
            >
              Cerrar carpeta ✕
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {archivosGuardados.map((arch, idx) => (
              <div key={`${arch.id}-${idx}`} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <div className="font-mono font-bold text-indigo-300">{arch.nombre}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Fecha: {arch.fecha} • {arch.totalPaquetes} paquetes contenidos
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (arch.paquetesList && arch.paquetesList.length > 0) {
                        const worksheet = XLSX.utils.json_to_sheet(arch.paquetesList);
                        const workbook = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(workbook, worksheet, "Hoja_de_Ruta");
                        XLSX.writeFile(workbook, arch.nombre);
                      } else {
                        descargarExcelDirecto();
                      }
                    }}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-bold text-[11px] flex items-center gap-1"
                  >
                    <FileSpreadsheet className="w-3 h-3" />
                    Descargar Excel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selector de Modo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setModoEscaneo('camara')}
          className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all text-left cursor-pointer ${
            modoEscaneo === 'camara'
              ? 'bg-indigo-600/20 border-indigo-500 text-white ring-2 ring-indigo-500/50'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <div className={`p-2 rounded-lg shrink-0 ${modoEscaneo === 'camara' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm">1. Cámara Trípode (OCR)</div>
            <div className="text-[11px] text-slate-400">Vendedores No Vinculados</div>
          </div>
        </button>

        <button
          onClick={() => setModoEscaneo('qr')}
          className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all text-left cursor-pointer ${
            modoEscaneo === 'qr'
              ? 'bg-emerald-600/20 border-emerald-500 text-white ring-2 ring-emerald-500/50'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <div className={`p-2 rounded-lg shrink-0 ${modoEscaneo === 'qr' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm">2. Escáner QR / Pistola</div>
            <div className="text-[11px] text-slate-400">Vendedores Vinculados</div>
          </div>
        </button>

        <button
          onClick={() => setModoEscaneo('voz')}
          className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all text-left cursor-pointer ${
            modoEscaneo === 'voz'
              ? 'bg-amber-600/20 border-amber-500 text-white ring-2 ring-amber-500/50'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <div className={`p-2 rounded-lg shrink-0 ${modoEscaneo === 'voz' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm">3. Dictado por Voz</div>
            <div className="text-[11px] text-slate-400">Etiquetas Borrosas</div>
          </div>
        </button>

        <button
          onClick={() => {
            setModoEscaneo('archivo');
            if (driveFiles.length === 0) buscarArchivosDrive();
          }}
          className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all text-left cursor-pointer ${
            modoEscaneo === 'archivo'
              ? 'bg-cyan-600/20 border-cyan-500 text-white ring-2 ring-cyan-500/50'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <div className={`p-2 rounded-lg shrink-0 ${modoEscaneo === 'archivo' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm">4. Foto / Chat de WhatsApp / Drive</div>
            <div className="text-[11px] text-slate-400">Archivos Exportados o Fotos en Drive</div>
          </div>
        </button>
      </div>

      {/* Áreas Interactivas de Captura */}
      <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800 min-h-[220px] flex flex-col justify-center items-center">
        {/* MODO 1: CÁMARA TRÍPODE */}
        {modoEscaneo === 'camara' && (
          <div className="w-full flex flex-col items-center gap-4 text-center">
            {/* Header info & Controles rápidos */}
            <div className="w-full max-w-md flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-400" />
                Cámara {modoCamaraActual === 'environment' ? 'Trasera (Enfoque Paquete)' : 'Frontal'}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${camaraActiva ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                  {camaraActiva ? '🟢 Encendida' : '🔴 Inactiva'}
                </span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={alternarCamara}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-all"
                  title="Cambiar entre cámara trasera y frontal"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400" />
                  <span>{modoCamaraActual === 'environment' ? 'Usar Frontal' : 'Usar Trasera'}</span>
                </button>

                {!camaraActiva && (
                  <button
                    type="button"
                    onClick={() => iniciarCamara('environment')}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    Encender
                  </button>
                )}
              </div>
            </div>

            {/* Selector de Lente si el celular tiene múltiples cámaras traseras (ej. Gran Angular, Telefoto) */}
            {dispositivosCamara.length > 1 && (
              <div className="w-full max-w-md flex items-center gap-2 text-xs bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] shrink-0">Seleccionar Lente:</span>
                <select
                  value={camaraSeleccionadaId}
                  onChange={(e) => {
                    setCamaraSeleccionadaId(e.target.value);
                    iniciarCamara(modoCamaraActual, e.target.value);
                  }}
                  className="bg-slate-950 border border-slate-700 text-white text-[11px] rounded px-2 py-1 w-full outline-none focus:border-indigo-500"
                >
                  <option value="">Auto-Detectar Cámara Principal Trasera</option>
                  {dispositivosCamara.map((dev, idx) => (
                    <option key={dev.deviceId || idx} value={dev.deviceId}>
                      {dev.label || `Cámara ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Banner de error o advertencia */}
            {errorCamara && (
              <div className="w-full max-w-md p-3 bg-amber-950/40 border border-amber-600/50 rounded-xl text-amber-200 text-xs text-left space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{errorCamara}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => iniciarCamara('environment')}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[11px] rounded-lg cursor-pointer"
                  >
                    🔄 Reintentar Cámara Trasera
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputCamaraRef.current?.click()}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded-lg cursor-pointer"
                  >
                    📷 Sacar Foto con Celular
                  </button>
                </div>
              </div>
            )}

            {/* Visor de Video */}
            <div className="relative w-full max-w-md aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover" 
              />
              <canvas ref={canvasRef} className="hidden" />

              {!camaraActiva && (
                <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-4">
                  <Camera className="w-10 h-10 text-slate-500 mb-2 animate-pulse" />
                  <p className="text-xs text-slate-400 max-w-xs">
                    {errorCamara ? 'Cámara bloqueada o sin señal.' : 'Iniciando cámara trasera...'}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    <button 
                      type="button"
                      onClick={() => iniciarCamara('environment')} 
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg font-bold cursor-pointer"
                    >
                      Activar Cámara Trasera
                    </button>
                    <button 
                      type="button"
                      onClick={() => fileInputCamaraRef.current?.click()} 
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs rounded-lg font-bold cursor-pointer"
                    >
                      📷 Sacar Foto
                    </button>
                  </div>
                </div>
              )}

              {camaraActiva && (
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-28 border-2 border-dashed border-indigo-400/70 rounded-lg pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] bg-slate-900/80 px-2 py-1 rounded text-indigo-200">
                    Ubique la etiqueta del paquete dentro del marco
                  </span>
                </div>
              )}
            </div>

            {/* Input oculto para sacar foto con la aplicación nativa del celular si se prefiere */}
            <input
              type="file"
              ref={fileInputCamaraRef}
              onChange={handleFileUploadLocal}
              capture="environment"
              accept="image/*"
              className="hidden"
            />

            {/* Botones principales de Acción OCR */}
            <div className="flex flex-wrap justify-center items-center gap-3 w-full max-w-md">
              <button
                type="button"
                onClick={capturarYProcesarCamara}
                disabled={cargando || !camaraActiva}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-40 text-xs sm:text-sm"
              >
                {cargando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Leyendo Dirección...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>📸 Capturar y Leer (Cámara en Vivo)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => fileInputCamaraRef.current?.click()}
                disabled={cargando}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold px-4 py-3 rounded-xl shadow flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50 text-xs sm:text-sm"
                title="Sacar una foto con la cámara nativa del celular o elegir de la galería"
              >
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>📷 Sacar Foto / Galería</span>
              </button>
            </div>
          </div>
        )}

        {/* MODO 2: ESCÁNER QR */}
        {modoEscaneo === 'qr' && (
          <form onSubmit={handleProcesarQR} className="w-full max-w-lg space-y-4 text-center">
            <div className="p-4 bg-emerald-950/30 border border-emerald-800/50 rounded-xl">
              <QrCode className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <h3 className="font-bold text-white text-base">Escáner de Código QR de Vendedores Vinculados</h3>
              <p className="text-xs text-slate-400 mt-1">
                Apunta con la pistola lectora o pega el código del paquete de MercadoLibre o tu plataforma.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputQR}
                onChange={(e) => setInputQR(e.target.value)}
                placeholder="Escaneá o pegá el código QR aquí..."
                autoFocus
                className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 text-sm"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-xl text-sm"
              >
                Registrar QR
              </button>
            </div>
          </form>
        )}

        {/* MODO 3: DICTADO POR VOZ (RESPALDO PARA BORROSOS) */}
        {modoEscaneo === 'voz' && (
          <div className="w-full max-w-lg space-y-4 text-center">
            <div className="p-4 bg-amber-950/30 border border-amber-800/50 rounded-xl">
              <Mic className="w-12 h-12 text-amber-400 mx-auto mb-2" />
              <h3 className="font-bold text-white text-base">Dictado de Respaldo por Voz (Etiquetas Borrosas / Dañadas)</h3>
              <p className="text-xs text-slate-400 mt-1">
                Si la etiqueta está rota, mojada o ilegible para la cámara, mantené presionado el micrófono y dictá la dirección.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={toggleEscucharVoz}
                className={`p-5 rounded-full transition-all shadow-xl ${
                  escuchandoVoz 
                    ? 'bg-rose-600 text-white animate-bounce' 
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {escuchandoVoz ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>

              <span className="text-xs font-medium text-slate-300">
                {escuchandoVoz ? "🎙️ Escuchando... Hablá ahora" : "Hacé clic en el micrófono para dictar"}
              </span>

              {transcripcionVoz && (
                <div className="w-full bg-slate-900 p-3 rounded-xl border border-slate-700 text-left text-sm text-slate-200">
                  <span className="text-xs text-amber-400 font-bold block mb-1">Transcripción de voz:</span>
                  "{transcripcionVoz}"
                  
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={enviarDictadoVoz}
                      disabled={cargando}
                      className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5"
                    >
                      {cargando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Procesar Paquete con IA
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODO 4: FOTO O CHAT DE WHATSAPP / GOOGLE DRIVE */}
        {modoEscaneo === 'archivo' && (
          <div className="w-full space-y-4">
            <div className="p-4 bg-cyan-950/40 border border-cyan-800/60 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-cyan-400" />
                  Escanear Fotos de Paquetes o Chats Exportados de WhatsApp
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Si exportaste el chat de WhatsApp a tu <strong>Google Drive</strong> o guardaste fotos de paquetes en tu celular/computadora, podés cargarlas o seleccionarlas aquí para pasar las etiquetas por la Cámara OCR.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                {/* Inputs ocultos específicos para Celular (Galería Múltiple vs Cámara Directa vs Archivo ZIP) */}
                <input
                  type="file"
                  ref={fileInputGaleriaRef}
                  onChange={handleFileUploadLocal}
                  multiple
                  accept="image/*, .zip, .pdf"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={fileInputCamaraRef}
                  onChange={handleFileUploadLocal}
                  capture="environment"
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUploadLocal}
                  accept=".zip, .txt, .pdf, .xlsx, .csv"
                  className="hidden"
                />

                <button
                  onClick={() => fileInputGaleriaRef.current?.click()}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  title="Seleccionar múltiples fotos desde la galería de fotos (ej. 16 fotos de WhatsApp)"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>🖼️ Galería de Fotos (Múltiples)</span>
                </button>

                <button
                  onClick={() => fileInputCamaraRef.current?.click()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  title="Tomar foto instantánea con la cámara del celular"
                >
                  <Camera className="w-4 h-4" />
                  <span>📷 Sacar Foto con Cámara</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  title="Cargar archivo ZIP exportado de WhatsApp o documento PDF/Excel"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Subir ZIP o Archivo</span>
                </button>

                <button
                  onClick={ejecutarFiltroFotosDrive}
                  disabled={cargandoDrive}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  title="Ejecutar el script organizarFotosWhatsApp() directamente en Google Drive"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                  <span>Ejecutar Filtro Drive</span>
                </button>

                <button
                  onClick={() => setMostrarModalScript(true)}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  title="Ver script de Google Apps Script y guía para activador por minutos"
                >
                  <FileText className="w-4 h-4" />
                  <span>Script Google Apps Script</span>
                </button>

                <button
                  onClick={crearEstructuraDrive}
                  disabled={cargandoDrive}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  title="Crear la estructura /Inbox/WhatsApp/Fotos_Paquetes en Google Drive"
                >
                  <FolderPlus className="w-4 h-4 text-amber-300" />
                  <span>Crear Carpetas Inbox</span>
                </button>

                <button
                  onClick={buscarArchivosDrive}
                  disabled={cargandoDrive}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 text-cyan-400 ${cargandoDrive ? 'animate-spin' : ''}`} />
                  <span>Refrescar Drive</span>
                </button>

                <button
                  onClick={() => setMostrarAyudaWhatsApp(!mostrarAyudaWhatsApp)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  title="Instrucciones para exportar de WhatsApp a Drive"
                >
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>Ayuda WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Modal de Script Google Apps Script y Activador Automático */}
            {mostrarModalScript && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-slate-100 space-y-4 shadow-2xl my-8">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-white">Google Apps Script: organizarFotosWhatsApp</h3>
                        <p className="text-xs text-slate-400">Automatización en Google Drive para filtrar únicamente fotos de paquetes</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setMostrarModalScript(false)}
                      className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Code Container */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Código JS para Google Apps Script (script.google.com):</span>
                      <button
                        onClick={copiarScriptAlPortapapeles}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiadoScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiadoScript ? "¡Copiado!" : "Copiar Script"}</span>
                      </button>
                    </div>

                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-amber-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-56">
                      {googleAppsScriptCodigo}
                    </pre>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-2.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <h4 className="font-bold text-white flex items-center gap-1.5 text-amber-400">
                      <Sparkles className="w-4 h-4" />
                      Instrucciones de Configuración del Activador Automático (Trigger por Minutos):
                    </h4>

                    <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-normal pl-1">
                      <li>Entrá a <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold">script.google.com</a> y tocá <strong>"Nuevo proyecto"</strong>.</li>
                      <li>Pegá el código copiado arriba y guardá haciendo clic en el ícono de <strong>Disquete (Guardar)</strong> con el nombre <code>FiltroQR_Ward</code>.</li>
                      <li>En la barra lateral izquierda, tocá el icono de <strong>Reloj ⏰ (Activadores / Triggers)</strong>.</li>
                      <li>Abajo a la derecha tocá <strong>"+ Agregar activador"</strong>.</li>
                      <li>Configuralo exactamente así:
                        <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5 text-slate-400">
                          <li><strong>Función a ejecutar:</strong> <code>organizarFotosWhatsApp</code></li>
                          <li><strong>Origen del evento:</strong> <code>Basado en tiempo</code></li>
                          <li><strong>Tipo de temporizador:</strong> <code>Temporizador por minutos (ej: Cada 5 o 10 minutos)</code></li>
                        </ul>
                      </li>
                      <li>Guardá los cambios y listo: Google Drive filtrará las fotos de paquetes automáticamente cada 5 minutos sin que tengas que abrir la computadora.</li>
                    </ol>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-800 pt-3 text-xs">
                    <button
                      onClick={ejecutarFiltroFotosDrive}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Ejecutar Ahora desde el Sistema</span>
                    </button>

                    <button
                      onClick={() => setMostrarModalScript(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Banner de Organización Automática de Fotos sin Mezclar Textos */}
            <div className="p-3 bg-indigo-950/60 border border-indigo-700/60 rounded-xl text-xs text-indigo-200 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="font-bold text-white block mb-0.5">📂 Separación Automática de Fotos de WhatsApp:</span>
                Al exportar un chat de WhatsApp con archivos multimedia, se genera un archivo <strong>.zip</strong>.
                Podés subir ese <strong>.zip</strong> directamente aquí: Martín <strong>descartará automáticamente las conversaciones de texto</strong> y extraerá <strong>únicamente las imágenes de paquetes</strong> para pasarlas por la Cámara OCR.
                También podés presionar "Crear Carpetas Inbox/WhatsApp en Drive" para organizar la subcarpeta <code className="bg-indigo-900/80 px-1.5 py-0.5 rounded text-amber-300">/Inbox/WhatsApp/Fotos_Paquetes</code> en tu Google Drive.
              </div>
            </div>

            {mostrarAyudaWhatsApp && (
              <div className="p-3.5 bg-amber-950/30 border border-amber-800/50 rounded-xl text-xs text-amber-200 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <Info className="w-4 h-4" />
                  ¿Cómo exportar las fotos o chat de WhatsApp a Google Drive?
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] pl-1">
                  <li>En WhatsApp: Abrí el chat del cliente o vendedor del paquete.</li>
                  <li>Tocá el menú superior (3 puntos) ➔ <strong>Más</strong> ➔ <strong>Exportar chat</strong>.</li>
                  <li>Elegí <strong>"Incluir archivos de medios"</strong> (si querés las fotos) o "Sin archivos".</li>
                  <li>Seleccioná la opción <strong>"Guardar en Drive"</strong>.</li>
                  <li>¡Listo! En esta pantalla tocá <strong>"Refrescar Google Drive"</strong> y seleccioná el archivo o la foto exportada para escanear las etiquetas con OCR automáticamente.</li>
                </ol>
              </div>
            )}

            {/* Google Drive Files List */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-indigo-400" />
                  Archivos y Fotos en Google Drive ({driveFiles.length})
                </span>

                <div className="flex items-center gap-2">
                  {driveFiles.length > 0 && (
                    <button
                      onClick={procesarTodosArchivosDrive}
                      disabled={cargando}
                      className="px-3 py-1 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-50"
                      title="Descargar y procesar todas las fotos y archivos de Drive con OCR e ingresarlos a la Hoja de Ruta"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      <span>Escanear los {driveFiles.length} Archivos (Proceso Masivo)</span>
                    </button>
                  )}

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      value={busquedaDrive}
                      onChange={(e) => setBusquedaDrive(e.target.value)}
                      placeholder="Buscar archivo en Drive..."
                      className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1 focus:outline-none focus:border-cyan-500 w-40 sm:w-52"
                    />
                  </div>
                </div>
              </div>

              {cargandoDrive ? (
                <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Escaneando carpetas de Google Drive...</span>
                </div>
              ) : driveFiles.length === 0 ? (
                <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-xl text-center text-xs text-slate-400 space-y-2">
                  <p>No se encontraron automáticamente archivos nuevos o no procesados en Google Drive.</p>
                  <p className="text-[11px] text-slate-500">
                    Podés usar el botón arriba <strong>"Subir Foto o ZIP de WhatsApp"</strong> para cargar directamente las fotos o el chat exportado descargado en tu dispositivo.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {driveFiles
                    .filter(f => f.name.toLowerCase().includes(busquedaDrive.toLowerCase()))
                    .map((file, idx) => (
                      <div 
                        key={file.id || idx}
                        className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between gap-3 text-xs transition-all"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 shrink-0">
                            {file.mimeType?.includes('image') ? (
                              <ImageIcon className="w-4 h-4" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                          </div>
                          <div className="truncate">
                            <div className="font-semibold text-slate-200 truncate">{file.name}</div>
                            <div className="text-[10px] text-slate-400">
                              Drive ID: {file.id?.slice(0, 10)}...
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => procesarArchivoDriveIndiv(file)}
                          disabled={cargando}
                          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 shrink-0 transition-all cursor-pointer disabled:opacity-50"
                          title="Descargar la foto o archivo desde Google Drive y extraer etiqueta con OCR de Inteligencia Artificial"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>Escanear OCR</span>
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mensajes de Feedback */}
        {mensajeEstado && (
          <div className="mt-4 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-indigo-300 font-medium">
            {mensajeEstado}
          </div>
        )}

        {paquetes.length > 0 && (
          <div className="mt-3 p-3 bg-gradient-to-r from-emerald-950/80 to-indigo-950/80 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2 text-xs text-emerald-200 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{paquetes.length} paquetes leídos y listos en la Hoja de Ruta.</span>
            </div>
            <button
              onClick={() => hojaDeRutaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow transition-all cursor-pointer whitespace-nowrap"
            >
              👇 Ver Tabla / Descargar Excel
            </button>
          </div>
        )}
      </div>

      {/* Tabla de Paquetes Ingresados (Hoja de Ruta) */}
      <div ref={hojaDeRutaRef} className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-400" />
              Paquetes y Productos en Hoja de Ruta ({paquetes.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Búsqueda por N° de Lote, Fecha Vencimiento, Coca-Cola/Marca, Dirección o Consigna.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={descargarExcelDirecto}
              disabled={cargando || paquetes.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5 text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Descargar archivo .xlsx directamente a tu computadora o celular"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>📥 Descargar Excel</span>
            </button>

            <button
              onClick={() => setMostrarCarpeta(!mostrarCarpeta)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5 text-xs transition-all cursor-pointer border border-slate-700"
              title="Ver carpeta de planillas guardadas"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>📂 Carpeta ({archivosGuardados.length})</span>
            </button>

            <button
              onClick={enviarWhatsAppSolo}
              disabled={cargando || paquetes.length === 0}
              className="bg-teal-700 hover:bg-teal-600 text-white font-bold px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5 text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Enviar por WhatsApp"
            >
              <Send className="w-3.5 h-3.5" />
              <span>📲 WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Buscador y Filtros por N° de Lote, Vencimiento, Marca y Consigna */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={busquedaPaquetes}
              onChange={(e) => setBusquedaPaquetes(e.target.value)}
              placeholder="Buscar por N° de Lote (ej: L240725), Vencimiento, Marca (ej: Coca-Cola), Dirección o Consigna..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
            />
            {busquedaPaquetes && (
              <button 
                onClick={() => setBusquedaPaquetes('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFiltroTipo('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filtroTipo === 'todos' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Todos ({paquetes.length})
            </button>

            <button
              onClick={() => setFiltroTipo('con_lote')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                filtroTipo === 'con_lote' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>🏷️</span>
              <span>Con Lote / Vencimiento</span>
            </button>

            <button
              onClick={() => setFiltroTipo('con_consigna')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                filtroTipo === 'con_consigna' 
                  ? 'bg-amber-600 text-white shadow' 
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>📌</span>
              <span>Con Consignas</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">ID / Tracking</th>
                <th className="p-3">Producto / Marca</th>
                <th className="p-3">Lote & Fecha Vencimiento</th>
                <th className="p-3">Destinatario / Dirección</th>
                <th className="p-3">Consigna / Notas</th>
                <th className="p-3">Método</th>
                <th className="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(() => {
                const paquetesFiltrados = paquetes.filter(p => {
                  if (filtroTipo === 'con_lote' && (!p.lote || p.lote === 'S/D' || p.lote === 'N/A')) return false;
                  if (filtroTipo === 'con_consigna' && (!p.consigna || !p.consigna.trim())) return false;

                  if (!busquedaPaquetes.trim()) return true;
                  const term = busquedaPaquetes.toLowerCase();
                  return (
                    p.trackingCode.toLowerCase().includes(term) ||
                    p.destinatario.toLowerCase().includes(term) ||
                    p.direccion.toLowerCase().includes(term) ||
                    p.localidad.toLowerCase().includes(term) ||
                    p.vendedor.toLowerCase().includes(term) ||
                    (p.productoMarca && p.productoMarca.toLowerCase().includes(term)) ||
                    (p.lote && p.lote.toLowerCase().includes(term)) ||
                    (p.fechaVencimiento && p.fechaVencimiento.toLowerCase().includes(term)) ||
                    (p.consigna && p.consigna.toLowerCase().includes(term)) ||
                    p.observaciones.toLowerCase().includes(term)
                  );
                });

                if (paquetesFiltrados.length === 0) {
                  return (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                        {busquedaPaquetes || filtroTipo !== 'todos'
                          ? `No se encontraron paquetes o productos con la búsqueda o filtro seleccionado.`
                          : `No hay paquetes en esta planilla. Escaneá o capturá el primer paquete arriba.`
                        }
                      </td>
                    </tr>
                  );
                }

                return paquetesFiltrados.map((p, idx) => (
                  <tr key={`${p.id}-${idx}`} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-300 shrink-0">
                      <div>{p.trackingCode}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{p.horaIngreso} hs</div>
                    </td>

                    <td className="p-3 font-medium text-white">
                      <div className="font-semibold text-purple-200">{p.productoMarca || 'General'}</div>
                      <div className="text-[11px] text-slate-400">Remitente: {p.vendedor}</div>
                    </td>

                    <td className="p-3 space-y-1">
                      <div className="flex flex-wrap items-center gap-1">
                        {p.lote && p.lote !== 'S/D' && p.lote !== 'N/A' ? (
                          <span className="bg-blue-950 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded text-[11px] font-mono font-bold">
                            🏷️ Lote: {p.lote}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">Lote: S/D</span>
                        )}

                        {p.fechaVencimiento && p.fechaVencimiento !== 'S/D' && p.fechaVencimiento !== 'N/A' ? (
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded text-[11px] font-mono font-bold">
                            📅 Vence: {p.fechaVencimiento}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">Venc: S/D</span>
                        )}
                      </div>
                    </td>

                    <td className="p-3 text-slate-200">
                      <div className="font-semibold text-slate-100">{p.destinatario}</div>
                      <div className="text-[11px] text-slate-300">{p.direccion}</div>
                      <div className="text-[10px] text-slate-400">{p.localidad} {p.codigoPostal !== 'S/D' && `(${p.codigoPostal})`}</div>
                    </td>

                    <td className="p-3 max-w-xs">
                      {p.consigna ? (
                        <div className="bg-amber-950/40 border border-amber-800/50 text-amber-200 text-[11px] px-2.5 py-1 rounded-lg">
                          <span className="font-bold block text-amber-400 text-[10px] uppercase">📌 Consigna:</span>
                          {p.consigna}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">{p.observaciones || 'Sin consigna especial'}</span>
                      )}
                    </td>

                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        p.metodoCaptura === 'QR Vinculado'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                          : p.metodoCaptura === 'Cámara OCR'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/50'
                          : 'bg-amber-950 text-amber-300 border border-amber-800/50'
                      }`}>
                        {p.metodoCaptura}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => setPaquetes(prev => prev.filter(item => item.id !== p.id))}
                        className="text-slate-500 hover:text-rose-400 text-xs transition-colors cursor-pointer"
                        title="Quitar paquete"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EscaneoPaquetesLogistica;
