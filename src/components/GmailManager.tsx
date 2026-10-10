import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Send, 
  Trash2, 
  RefreshCw, 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Inbox, 
  Clock, 
  ArrowLeft, 
  X, 
  Lock, 
  Bot, 
  Sparkles, 
  Play, 
  Sliders, 
  History, 
  CheckCheck,
  ShieldCheck,
  Truck,
  Building2,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { getAccessToken, googleSignIn } from "../auth";

interface EmailHeader {
  name: string;
  value: string;
}

interface EmailMessageDetail {
  id: string;
  threadId: string;
  snippet: string;
  internalDate: string;
  labelIds?: string[];
  payload?: {
    headers?: EmailHeader[];
    body?: { data?: string };
    parts?: any[];
  };
}

interface EmailSummary {
  id: string;
  threadId: string;
}

// User Consignas definition
export interface MartinGmailConsignas {
  keywordsBorrar: string[];
  keywordsConservar: string[];
  protegerEnviados: boolean;
  protegerBancosYTransferencias: boolean;
  conservarConsultasAutomatizacion: boolean;
  conservarLogisticaFlorDelSur: boolean;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  subject: string;
  sender: string;
  action: "borrado" | "conservado";
  reason: string;
  category: "propaganda" | "logistica" | "automatizaciones" | "banco" | "otro";
}

const LOCAL_STORAGE_CONSIGNAS_KEY = "martin_gmail_consignas_noemi_v1";
const LOCAL_STORAGE_AUDIT_KEY = "martin_gmail_audit_history_v1";

const DEFAULT_CONSIGNAS: MartinGmailConsignas = {
  keywordsBorrar: [
    "propaganda", "promocion", "promoción", "oferta", "ofertas", "descuento", "descuentos", "rebajas",
    "supermercado", "coto", "carrefour", "dia%", "disco", "jumbo", "vea", "chango mas", "vital",
    "prestamo", "préstamo", "tarjeta de credito", "credito preaprobado", "credito pre-aprobado",
    "newsletter", "publicidad", "sale", "cyber monday", "black friday", "hot sale",
    "seguro de auto", "seguro de vida", "ahorra hoy", "cupon", "cupón", "sorteo", "spam"
  ],
  keywordsConservar: [
    "automatizacion", "automatización", "automatizar", "bot", "crm", "sistema", "desarrollo",
    "logistica flor del sur", "logística flor del sur", "flor del sur", "flete", "fletes", "transporte", "envio", "envíos",
    "comprobante", "transferencia", "transferido", "pago realizado", "pago recibido", "constancia de pago",
    "cbu", "alias", "banco galicia", "banco nacion", "banco nación", "banco provincia", "santander", "bbva", "mercado pago",
    "factura", "facturación", "recibo", "orden de compra", "presupuesto"
  ],
  protegerEnviados: true,
  protegerBancosYTransferencias: true,
  conservarConsultasAutomatizacion: true,
  conservarLogisticaFlorDelSur: true
};

export const GmailManager: React.FC = () => {
  const [activeView, setActiveView] = useState<"principal" | "registro" | "bandeja">("principal");
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [, setLoadingToken] = useState<boolean>(true);
  const [messages, setMessages] = useState<EmailMessageDetail[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMessage, setSelectedMessage] = useState<EmailMessageDetail | null>(null);

  // Consignas State
  const [consignas, setConsignas] = useState<MartinGmailConsignas>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_CONSIGNAS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_CONSIGNAS;
    } catch {
      return DEFAULT_CONSIGNAS;
    }
  });

  const [showConsignasModal, setShowConsignasModal] = useState<boolean>(false);
  const [editBorrarText, setEditBorrarText] = useState<string>("");
  const [editConservarText, setEditConservarText] = useState<string>("");

  // Audit History State (Lo que borró y lo que conservó)
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_AUDIT_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [auditFilter, setAuditFilter] = useState<"todos" | "borrado" | "conservado">("todos");

  // Execution & Scan State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{
    aBorrar: Array<{ msg: EmailMessageDetail; subject: string; sender: string; reason: string }>;
    aConservar: Array<{ msg: EmailMessageDetail; subject: string; sender: string; reason: string }>;
  } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Compose / Reply State
  const [showCompose, setShowCompose] = useState<boolean>(false);
  const [composeTo, setComposeTo] = useState<string>("");
  const [composeSubject, setComposeSubject] = useState<string>("");
  const [composeBody, setComposeBody] = useState<string>("");
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);

  // Generic Alerts
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Quick accordion in consignas
  const [showAdvancedKeywords, setShowAdvancedKeywords] = useState<boolean>(false);

  useEffect(() => {
    checkToken();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CONSIGNAS_KEY, JSON.stringify(consignas));
    } catch (e) {
      console.error(e);
    }
  }, [consignas]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_AUDIT_KEY, JSON.stringify(auditLogs));
    } catch (e) {
      console.error(e);
    }
  }, [auditLogs]);

  const checkToken = async () => {
    setLoadingToken(true);
    const token = await getAccessToken();
    setGoogleToken(token);
    setLoadingToken(false);
    if (token) {
      fetchMessages(token);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await googleSignIn();
      if (res?.accessToken) {
        setGoogleToken(res.accessToken);
        showToast("success", "Conexión con Google iniciada correctamente.");
        fetchMessages(res.accessToken);
      }
    } catch (err: any) {
      showToast("error", "Error al conectar con Google: " + (err.message || err));
    }
  };

  const showToast = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4500);
  };

  const fetchMessages = async (tokenOverride?: string, queryOverride?: string) => {
    const token = tokenOverride || googleToken;
    if (!token) return;

    setLoadingMessages(true);
    try {
      const q = queryOverride !== undefined ? queryOverride : searchQuery;
      const params = new URLSearchParams({ maxResults: "25" });
      if (q) params.append("q", q);

      const res = await fetch(`/api/gmail/messages?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al listar correos");
      }

      const data = await res.json();
      const messageList: EmailSummary[] = data.messages || [];

      const detailPromises = messageList.slice(0, 20).map(async (item) => {
        const detailRes = await fetch(`/api/gmail/message/${item.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return detailRes.ok ? await detailRes.json() : null;
      });

      const details = (await Promise.all(detailPromises)).filter(Boolean) as EmailMessageDetail[];
      setMessages(details);
    } catch (err: any) {
      showToast("error", "Error al leer Gmail: " + (err.message || err));
    } finally {
      setLoadingMessages(false);
    }
  };

  const getHeaderValue = (headers: EmailHeader[] | undefined, name: string) => {
    if (!headers) return "";
    const found = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
    return found ? found.value : "";
  };

  const parseBody = (payload: any): string => {
    if (!payload) return "";
    if (payload.body && payload.body.data) {
      try {
        return decodeURIComponent(escape(atob(payload.body.data.replace(/-/g, "+").replace(/_/g, "/"))));
      } catch {
        return payload.body.data;
      }
    }
    if (payload.parts && payload.parts.length > 0) {
      for (const part of payload.parts) {
        if (part.mimeType === "text/html" && part.body && part.body.data) {
          try {
            return decodeURIComponent(escape(atob(part.body.data.replace(/-/g, "+").replace(/_/g, "/"))));
          } catch {
            return part.body.data;
          }
        }
      }
      for (const part of payload.parts) {
        if (part.mimeType === "text/plain" && part.body && part.body.data) {
          try {
            return decodeURIComponent(escape(atob(part.body.data.replace(/-/g, "+").replace(/_/g, "/"))));
          } catch {
            return part.body.data;
          }
        }
      }
    }
    return "";
  };

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const extractCleanEmail = (fromHeader: string): string => {
    const match = fromHeader.match(/<([^>]+)>/);
    return (match && match[1]) ? match[1].trim() : fromHeader.trim();
  };

  // Open Consignas Modal
  const handleOpenConsignasModal = () => {
    setEditBorrarText(consignas.keywordsBorrar.join(", "));
    setEditConservarText(consignas.keywordsConservar.join(", "));
    setShowConsignasModal(true);
  };

  const handleSaveConsignas = () => {
    const arrBorrar = editBorrarText.split(",").map(s => s.trim()).filter(Boolean);
    const arrConservar = editConservarText.split(",").map(s => s.trim()).filter(Boolean);

    setConsignas(prev => ({
      ...prev,
      keywordsBorrar: arrBorrar.length > 0 ? arrBorrar : prev.keywordsBorrar,
      keywordsConservar: arrConservar.length > 0 ? arrConservar : prev.keywordsConservar
    }));

    setShowConsignasModal(false);
    showToast("success", "Consignas de Martín actualizadas con éxito.");
  };

  // ==================== SCAN & EXECUTE MARTIN'S RULES ====================
  const handleScanAndExecuteMartin = async () => {
    if (!googleToken) {
      showToast("error", "Conectá tu cuenta de Google para iniciar el proceso.");
      return;
    }

    setIsScanning(true);
    try {
      // 1. Fetch unread or recent messages in INBOX
      const res = await fetch("/api/gmail/messages?q=is:inbox&maxResults=30", {
        headers: { Authorization: `Bearer ${googleToken}` }
      });

      if (!res.ok) throw new Error("No se pudo leer la bandeja de entrada");
      const data = await res.json();
      const messageList: EmailSummary[] = data.messages || [];

      if (messageList.length === 0) {
        showToast("success", "Tu bandeja de entrada está limpia y al día. No hay correos pendientes.");
        setIsScanning(false);
        return;
      }

      // Fetch details
      const detailPromises = messageList.slice(0, 25).map(async (item) => {
        const dRes = await fetch(`/api/gmail/message/${item.id}`, {
          headers: { Authorization: `Bearer ${googleToken}` }
        });
        return dRes.ok ? await dRes.json() : null;
      });

      const validMessages: EmailMessageDetail[] = (await Promise.all(detailPromises)).filter(Boolean);

      const aBorrar: Array<{ msg: EmailMessageDetail; subject: string; sender: string; reason: string }> = [];
      const aConservar: Array<{ msg: EmailMessageDetail; subject: string; sender: string; reason: string }> = [];

      for (const msg of validMessages) {
        const subject = getHeaderValue(msg.payload?.headers, "Subject") || "(Sin Asunto)";
        const sender = getHeaderValue(msg.payload?.headers, "From") || "Remitente Desconocido";
        const body = parseBody(msg.payload) || msg.snippet || "";

        const fullText = normalizeText(`${subject} ${sender} ${body}`);
        const subjectNorm = normalizeText(subject);

        // RULE 1: Never delete sent emails (if labeled SENT)
        if (msg.labelIds?.includes("SENT") && consignas.protegerEnviados) {
          aConservar.push({ msg, subject, sender, reason: "Bandeja de enviados (Protección estricta)" });
          continue;
        }

        // RULE 2: Protect Bank Transfers & Official receipts
        const isBankReceipt = (
          fullText.includes("transferencia") || 
          fullText.includes("comprobante") || 
          fullText.includes("constancia de pago") || 
          fullText.includes("pago recibido") ||
          fullText.includes("extracto") ||
          fullText.includes("acreditacion") ||
          fullText.includes("acreditación") ||
          fullText.includes("deposito") ||
          fullText.includes("depósito")
        );
        if (consignas.protegerBancosYTransferencias && isBankReceipt) {
          aConservar.push({ msg, subject, sender, reason: "Comprobante / Detalle bancario protegido" });
          continue;
        }

        // RULE 3: Protect inquiries about Automations (Business)
        const isAutomatizacion = (
          fullText.includes("automatizacion") || 
          fullText.includes("automatización") || 
          fullText.includes("automatizar") || 
          fullText.includes("bot") || 
          fullText.includes("crm") || 
          fullText.includes("software")
        );
        if (consignas.conservarConsultasAutomatizacion && isAutomatizacion) {
          aConservar.push({ msg, subject, sender, reason: "Consulta comercial sobre Automatizaciones" });
          continue;
        }

        // RULE 4: Protect inquiries about Logística Flor del Sur
        const isLogistica = (
          fullText.includes("flor del sur") || 
          fullText.includes("logistica") || 
          fullText.includes("logística") || 
          fullText.includes("flete") || 
          fullText.includes("fletes") || 
          fullText.includes("transporte") || 
          fullText.includes("camion") || 
          fullText.includes("reparto")
        );
        if (consignas.conservarLogisticaFlorDelSur && isLogistica) {
          aConservar.push({ msg, subject, sender, reason: "Consulta sobre servicio Logística Flor del Sur" });
          continue;
        }

        // RULE 5: Check explicit preserved keywords
        let matchedPreservedKw: string | null = null;
        for (const kw of consignas.keywordsConservar) {
          if (fullText.includes(normalizeText(kw.trim()))) {
            matchedPreservedKw = kw;
            break;
          }
        }
        if (matchedPreservedKw) {
          aConservar.push({ msg, subject, sender, reason: `Coincide con consigna protegida: "${matchedPreservedKw}"` });
          continue;
        }

        // RULE 6: Check for Supermarkets, Bank offers, Promotional newsletters & Spam
        let matchedDeleteKw: string | null = null;
        for (const kw of consignas.keywordsBorrar) {
          if (subjectNorm.includes(normalizeText(kw.trim())) || fullText.includes(normalizeText(kw.trim()))) {
            matchedDeleteKw = kw;
            break;
          }
        }

        // Check if Gmail already categorized it as PROMOTIONS or SPAM
        const isGmailPromoOrSpam = msg.labelIds?.includes("CATEGORY_PROMOTIONS") || msg.labelIds?.includes("SPAM");

        if (matchedDeleteKw) {
          aBorrar.push({ 
            msg, 
            subject, 
            sender, 
            reason: `Propaganda / Promoción detectada ("${matchedDeleteKw}")` 
          });
        } else if (isGmailPromoOrSpam) {
          aBorrar.push({ 
            msg, 
            subject, 
            sender, 
            reason: "Promoción publicitaria / Spam detectado" 
          });
        } else {
          // If unsure or personal email, keep safe!
          aConservar.push({ msg, subject, sender, reason: "Correo legítimo / Sin propaganda" });
        }
      }

      setScanResult({ aBorrar, aConservar });
      setShowConfirmModal(true);
    } catch (err: any) {
      showToast("error", "Error durante el análisis: " + (err.message || err));
    } finally {
      setIsScanning(false);
    }
  };

  // Execution after User Confirmation (Workspace Integration Safety Standard)
  const executeConfirmedCleanup = async () => {
    if (!googleToken || !scanResult) return;
    setIsExecuting(true);

    const newLogs: AuditRecord[] = [];
    let deletedCount = 0;

    try {
      // 1. Move to Trash all propaganda/supermarket/bank-offer emails
      for (const item of scanResult.aBorrar) {
        const trashRes = await fetch(`/api/gmail/trash/${item.msg.id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${googleToken}` }
        });

        if (trashRes.ok) {
          deletedCount++;
          newLogs.unshift({
            id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toISOString(),
            subject: item.subject,
            sender: item.sender,
            action: "borrado",
            reason: item.reason,
            category: "propaganda"
          });
        }
      }

      // 2. Log conserved emails for full audit trail
      for (const item of scanResult.aConservar) {
        let cat: AuditRecord["category"] = "otro";
        if (item.reason.includes("Automatizaciones")) cat = "automatizaciones";
        else if (item.reason.includes("Flor del Sur")) cat = "logistica";
        else if (item.reason.includes("bancario")) cat = "banco";

        newLogs.unshift({
          id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          subject: item.subject,
          sender: item.sender,
          action: "conservado",
          reason: item.reason,
          category: cat
        });
      }

      // Save audit history (keep last 100)
      setAuditLogs(prev => [...newLogs, ...prev].slice(0, 100));

      showToast("success", `¡Listo! Martín envió ${deletedCount} correos de propaganda a la papelera y protegió tus consultas importantes.`);
      setShowConfirmModal(false);
      setScanResult(null);
      fetchMessages();
      setActiveView("registro");
    } catch (err: any) {
      showToast("error", "Error ejecutando la limpieza: " + (err.message || err));
    } finally {
      setIsExecuting(false);
    }
  };

  // Send Email Handler
  const handleExecuteSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleToken) {
      showToast("error", "Conectá tu cuenta de Google para enviar correos.");
      return;
    }
    if (!composeTo || !composeSubject || !composeBody) {
      showToast("error", "Por favor completá destinatario, asunto y mensaje.");
      return;
    }

    setSendingEmail(true);
    try {
      const res = await fetch("/api/gmail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${googleToken}`
        },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject,
          body: composeBody
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al enviar correo");
      }

      showToast("success", `Correo enviado con éxito a ${composeTo}`);
      setShowCompose(false);
      setComposeTo("");
      setComposeSubject("");
      setComposeBody("");
      fetchMessages();
    } catch (err: any) {
      showToast("error", "Error al enviar: " + (err.message || err));
    } finally {
      setSendingEmail(false);
    }
  };

  const handleReplyFromAudit = (item: AuditRecord) => {
    setComposeTo(extractCleanEmail(item.sender));
    setComposeSubject(item.subject.toLowerCase().startsWith("re:") ? item.subject : `Re: ${item.subject}`);
    setComposeBody(`Hola, gracias por contactarte con nosotros.\n\nEn respuesta a tu consulta sobre "${item.subject}":\n\nQuedamos a tu entera disposición.\n— Distribuidora & Logística Flor del Sur`);
    setShowCompose(true);
  };

  const filteredAuditLogs = auditLogs.filter(log => {
    if (auditFilter === "borrado") return log.action === "borrado";
    if (auditFilter === "conservado") return log.action === "conservado";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">Martín Gestor Inteligente de Gmail</h1>
                <span className="bg-amber-400 text-amber-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                  Filtro Anti-Propaganda
                </span>
              </div>
              <p className="text-red-100 text-sm mt-0.5 max-w-2xl">
                Martín limpia tu bandeja eliminando propagandas y supermercados, y protegiendo estrictamente tus consultas de Automatizaciones, Logística Flor del Sur y bancos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCompose(true)}
              className="bg-white text-slate-800 hover:bg-slate-100 font-bold px-4 py-2.5 rounded-xl shadow text-xs flex items-center gap-2 transition-all"
            >
              <Send className="w-4 h-4 text-red-600" />
              <span>Redactar / Enviar Correo</span>
            </button>

            {googleToken ? (
              <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-md px-3.5 py-2 rounded-xl text-emerald-100 text-xs font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-300" />
                <span>Gmail Conectado</span>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="bg-white text-slate-800 font-bold px-4 py-2.5 rounded-xl shadow hover:bg-slate-50 text-xs flex items-center gap-2 transition-all"
              >
                <Mail className="w-4 h-4 text-red-600" />
                <span>Conectar con Google</span>
              </button>
            )}
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="relative z-10 flex items-center gap-2 mt-6 pt-4 border-t border-white/10">
          <button
            onClick={() => setActiveView("principal")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === "principal"
                ? "bg-white text-red-600 shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Panel de Limpieza y Consignas</span>
          </button>

          <button
            onClick={() => setActiveView("registro")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === "registro"
                ? "bg-white text-red-600 shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Ver qué Borró y qué Conservó Martín</span>
            {auditLogs.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeView === "registro" ? "bg-red-100 text-red-700" : "bg-black/20 text-white"}`}>
                {auditLogs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView("bandeja")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === "bandeja"
                ? "bg-white text-red-600 shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Bandeja de Entrada en Vivo</span>
          </button>
        </div>
      </div>

      {/* Notifications Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl border shadow-lg flex items-center justify-between ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            )}
            <span className="text-sm font-medium">{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Login Notice */}
      {!googleToken ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Conectá tu cuenta de Gmail</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Para que Martín pueda limpiar la propaganda, responder consultas de Logística Flor del Sur y cuidar tus comprobantes bancarios, hacé clic a continuación para autorizar la conexión.
            </p>
            <button
              onClick={handleGoogleLogin}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <Mail className="w-5 h-5" />
              <span>Conectar mi Gmail Ahora</span>
            </button>
          </div>
        </div>
      ) : activeView === "principal" ? (
        /* ==================== VISTA PRINCIPAL (LOS 2 BOTONES CLAVE) ==================== */
        <div className="space-y-6">
          {/* Main Action Banner with the 2 Requested Buttons */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="max-w-3xl">
              <span className="bg-red-100 text-red-700 text-xs font-black uppercase px-2.5 py-1 rounded-lg">
                Panel Simplificado de Control
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-3 leading-tight">
                Instrucciones directas para que Martín procese tu Gmail
              </h2>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Sin configuraciones complicadas: cargás las consignas con un clic y luego presionás <strong>Ejecutar</strong>. Martín filtrará la propaganda y dejará intactos tus correos valiosos.
              </p>
            </div>

            {/* The 2 Core Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {/* Button 1: Cargar Consignas */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-all">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center font-black">
                    1
                  </div>
                  <h3 className="font-bold text-base text-slate-900">Cargar / Ver Consignas de Martín</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Revisá o cambiá las palabras que Martín debe borrar (propaganda, promociones, supermercados) y lo que debe proteger (Automatizaciones, Logística Flor del Sur, comprobantes bancarios).
                  </p>
                </div>

                <button
                  onClick={handleOpenConsignasModal}
                  className="mt-6 w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Sliders className="w-4 h-4 text-slate-300" />
                  <span>⚙️ Cargar / Editar Consignas de Martín</span>
                </button>
              </div>

              {/* Button 2: Ejecutar */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 flex flex-col justify-between shadow-sm">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center font-black">
                    2
                  </div>
                  <h3 className="font-bold text-base text-red-950">Ejecutar Limpieza y Gestión</h3>
                  <p className="text-xs text-red-700 leading-relaxed">
                    Martín analiza la bandeja de entrada, separa la propaganda de tus correos importantes y te muestra un resumen claro antes de enviar la basura a la papelera de Gmail.
                  </p>
                </div>

                <button
                  onClick={handleScanAndExecuteMartin}
                  disabled={isScanning}
                  className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Analizando bandeja...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>⚡ Ejecutar Limpieza de Martín Ahora</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Summary of Active Consignas (What Martin will do) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box: Lo que BORRA */}
            <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-red-700">
                <div className="p-2.5 bg-red-100 rounded-xl">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Lo que Martín BORRA (A la Papelera)</h3>
                  <p className="text-xs text-slate-500">Mueve a la papelera de Gmail sin tocar lo importante</p>
                </div>
              </div>

              <ul className="text-xs text-slate-700 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span><strong>Propagandas y Publicidades:</strong> Newsletters, promociones masivas, cyber monday, ofertas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span><strong>Supermercados:</strong> Folletos y descuentos de Coto, Carrefour, Día, Disco, Jumbo, etc.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span><strong>Ofertas bancarias no solicitadas:</strong> Préstamos preaprobados, seguros, tarjetas de crédito.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span><strong>Spam:</strong> Correos sospechosos o basura promocional.</span>
                </li>
              </ul>
            </div>

            {/* Box: Lo que CONSERVA Y PROTEGE */}
            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-emerald-700">
                <div className="p-2.5 bg-emerald-100 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Lo que Martín CONSERVA Y PROTEGE</h3>
                  <p className="text-xs text-slate-500">Intacto en tu bandeja para lectura o respuesta</p>
                </div>
              </div>

              <ul className="text-xs text-slate-700 space-y-2.5">
                <li className="flex items-start gap-2">
                  <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Consultas de Automatizaciones:</strong> Clientes que consultan por automatizar procesos o tu negocio.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Logística Flor del Sur:</strong> Toda persona o comercio que solicite fletes, transporte o envíos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Detalles y Comprobantes de Banco:</strong> Transferencias recibidas, constancias de pago, facturas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Bandeja de Enviados:</strong> ¡Protección total, Martín jamás borra nada de lo enviado!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : activeView === "registro" ? (
        /* ==================== VISTA: VER QUÉ BORRÓ Y QUÉ CONSERVÓ MARTÍN ==================== */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-red-600" />
                Registro de lo que Martín Borró y Conservó
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Comprobá de forma transparente cada acción que Martín realizó en tu cuenta de Gmail.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setAuditFilter("todos")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  auditFilter === "todos" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                }`}
              >
                Todos ({auditLogs.length})
              </button>
              <button
                onClick={() => setAuditFilter("borrado")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  auditFilter === "borrado" ? "bg-red-600 text-white shadow-sm" : "text-slate-600"
                }`}
              >
                Borrado ({auditLogs.filter(l => l.action === "borrado").length})
              </button>
              <button
                onClick={() => setAuditFilter("conservado")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  auditFilter === "conservado" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600"
                }`}
              >
                Conservado ({auditLogs.filter(l => l.action === "conservado").length})
              </button>
            </div>
          </div>

          {/* Audit Table */}
          {filteredAuditLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl space-y-2">
              <Bot className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">Aún no hay acciones registradas</p>
              <p className="text-xs">
                Andá al panel principal y presioná <strong>&quot;⚡ Ejecutar Limpieza de Martín&quot;</strong> para procesar la bandeja.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-3 rounded-l-lg">Estado / Acción</th>
                    <th className="py-3 px-3">Asunto</th>
                    <th className="py-3 px-3">Remitente</th>
                    <th className="py-3 px-3">Motivo de Martín</th>
                    <th className="py-3 px-3">Fecha</th>
                    <th className="py-3 px-3 rounded-r-lg text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 whitespace-nowrap">
                        {log.action === "borrado" ? (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
                            <Trash2 className="w-3 h-3" />
                            A la Papelera
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
                            <ShieldCheck className="w-3 h-3" />
                            Conservado
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 max-w-xs truncate">
                        {log.subject}
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-[150px] truncate">
                        {log.sender}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-medium">
                        {log.reason}
                      </td>
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {log.action === "conservado" ? (
                          <button
                            onClick={() => handleReplyFromAudit(log)}
                            className="bg-slate-800 hover:bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 ml-auto transition-all"
                            title="Responder a esta consulta"
                          >
                            <Send className="w-3 h-3" />
                            <span>Responder</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">En Papelera Gmail</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span>
                <strong>Nota:</strong> Los correos borrados se encuentran en la carpeta <strong>Papelera</strong> de tu Gmail. Podés restaurarlos en cualquier momento si lo deseás.
              </span>
            </div>
            {auditLogs.length > 0 && (
              <button
                onClick={() => setAuditLogs([])}
                className="text-slate-400 hover:text-red-600 font-semibold"
              >
                Limpiar Historial
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ==================== VISTA: BANDEJA DE ENTRADA EN VIVO ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List Column */}
          <div className={`lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[700px] overflow-hidden ${selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => setShowCompose(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Redactar Correo</span>
                </button>

                <button
                  onClick={() => fetchMessages()}
                  disabled={loadingMessages}
                  className="p-2 text-slate-600 hover:bg-slate-200 rounded-xl"
                  title="Actualizar correos"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingMessages ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchMessages();
                }}
                className="relative"
              >
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar en Gmail..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
                />
              </form>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loadingMessages ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-red-500" />
                  <p className="text-xs font-medium">Cargando correos de Gmail...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Inbox className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-600">No se encontraron correos</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const from = getHeaderValue(msg.payload?.headers, "From") || "Remitente";
                  const subject = getHeaderValue(msg.payload?.headers, "Subject") || "(Sin asunto)";
                  const dateStr = msg.internalDate ? new Date(Number(msg.internalDate)).toLocaleDateString() : "";
                  const isSelected = selectedMessage?.id === msg.id;

                  return (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`p-4 cursor-pointer hover:bg-slate-50 transition-all ${
                        isSelected ? "bg-red-50/60 border-l-4 border-red-600" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                        <span className="truncate max-w-[200px] text-slate-900">{from}</span>
                        <span className="text-slate-400 font-normal">{dateStr}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-800 truncate mb-1">{subject}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{msg.snippet}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Detail Column */}
          <div className={`lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[700px] overflow-hidden ${!selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
            {!selectedMessage ? (
              <div className="m-auto text-center p-12 text-slate-400 space-y-2">
                <Mail className="w-10 h-10 mx-auto text-slate-300" />
                <h3 className="text-sm font-bold text-slate-700">Seleccioná un correo para leer</h3>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <button onClick={() => setSelectedMessage(null)} className="lg:hidden p-2 text-slate-600">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const from = getHeaderValue(selectedMessage.payload?.headers, "From");
                      const subj = getHeaderValue(selectedMessage.payload?.headers, "Subject");
                      setComposeTo(extractCleanEmail(from));
                      setComposeSubject(subj.toLowerCase().startsWith("re:") ? subj : `Re: ${subj}`);
                      setComposeBody(`\n\n-------------------\nEl ${new Date(Number(selectedMessage.internalDate)).toLocaleString()} ${from} escribió:\n> ${selectedMessage.snippet}`);
                      setShowCompose(true);
                    }}
                    className="ml-auto bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Responder con Martín</span>
                  </button>
                </div>

                <div className="p-6 border-b border-slate-100 space-y-2">
                  <h2 className="text-base font-bold text-slate-900">
                    {getHeaderValue(selectedMessage.payload?.headers, "Subject") || "(Sin asunto)"}
                  </h2>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <p>De: <strong>{getHeaderValue(selectedMessage.payload?.headers, "From")}</strong></p>
                    <p className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{selectedMessage.internalDate ? new Date(Number(selectedMessage.internalDate)).toLocaleString() : ""}</span>
                    </p>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto bg-slate-50/40">
                  <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm min-h-[300px]">
                    {parseBody(selectedMessage.payload) ? (
                      <div
                        className="text-xs text-slate-800 leading-relaxed space-y-2"
                        dangerouslySetInnerHTML={{ __html: parseBody(selectedMessage.payload) }}
                      />
                    ) : (
                      <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {selectedMessage.snippet}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== MODAL: CARGAR / EDITAR CONSIGNAS DE MARTÍN ==================== */}
      {showConsignasModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-red-500" />
                <div>
                  <h3 className="text-base font-bold">Consignas de Limpieza y Protección de Martín</h3>
                  <p className="text-xs text-slate-400">Definí las reglas según las necesidades de Noemí</p>
                </div>
              </div>
              <button onClick={() => setShowConsignasModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* Core Checkbox Consignas */}
              <div className="space-y-3">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Reglas de Protección Estricta:
                </p>

                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-950">
                    <input
                      type="checkbox"
                      checked={consignas.conservarConsultasAutomatizacion}
                      onChange={(e) => setConsignas(p => ({ ...p, conservarConsultasAutomatizacion: e.target.checked }))}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Conservar Consultas de Automatizaciones y CRM</span>
                  </label>
                  <p className="text-emerald-800 text-[11px] pl-5">
                    Permite que Martín reciba, lea y pueda responder correos de clientes que soliciten automatizaciones o servicios para el negocio.
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-950">
                    <input
                      type="checkbox"
                      checked={consignas.conservarLogisticaFlorDelSur}
                      onChange={(e) => setConsignas(p => ({ ...p, conservarLogisticaFlorDelSur: e.target.checked }))}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Conservar Consultas de Logística Flor del Sur</span>
                  </label>
                  <p className="text-emerald-800 text-[11px] pl-5">
                    Protege cualquier correo sobre pedidos de flete, logística, transporte de cargas o distribución.
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-950">
                    <input
                      type="checkbox"
                      checked={consignas.protegerBancosYTransferencias}
                      onChange={(e) => setConsignas(p => ({ ...p, protegerBancosYTransferencias: e.target.checked }))}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Proteger Detalles de Banco y Comprobantes de Transferencia</span>
                  </label>
                  <p className="text-emerald-800 text-[11px] pl-5">
                    Nunca borra avisos de acreditación, comprobantes de pago o constancias bancarias.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={consignas.protegerEnviados}
                      onChange={(e) => setConsignas(p => ({ ...p, protegerEnviados: e.target.checked }))}
                      className="rounded text-slate-600 focus:ring-slate-500"
                    />
                    <span>Bandeja de Enviados: Proteger 100% (No borrar nada de lo enviado)</span>
                  </label>
                  <p className="text-slate-600 text-[11px] pl-5">
                    Garantiza que ningún correo enviado por vos o por Martín sea tocado.
                  </p>
                </div>
              </div>

              {/* Accordion for Keywords */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdvancedKeywords(!showAdvancedKeywords)}
                  className="w-full flex items-center justify-between text-slate-700 font-bold py-2 hover:text-slate-900"
                >
                  <span>Ver / Personalizar Palabras Clave de Propaganda y Supermercados</span>
                  {showAdvancedKeywords ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvancedKeywords && (
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                        Palabras clave a BORRAR (Propaganda, supermercados, préstamos, spam):
                      </label>
                      <textarea
                        rows={3}
                        value={editBorrarText}
                        onChange={(e) => setEditBorrarText(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                        Palabras clave a CONSERVAR (Protegidas adicionales):
                      </label>
                      <textarea
                        rows={2}
                        value={editConservarText}
                        onChange={(e) => setEditConservarText(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setConsignas(DEFAULT_CONSIGNAS);
                  setEditBorrarText(DEFAULT_CONSIGNAS.keywordsBorrar.join(", "));
                  setEditConservarText(DEFAULT_CONSIGNAS.keywordsConservar.join(", "));
                  showToast("success", "Consignas restauradas a los valores sugeridos por Noemí.");
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Restaurar Consignas Predeterminadas
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowConsignasModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveConsignas}
                  className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition-all"
                >
                  Guardar Consignas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CONFIRMATION DIALOG (Mandatory Workspace Safety Rule) ==================== */}
      {showConfirmModal && scanResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="text-base font-bold">Resultado del Análisis de Martín</h3>
                  <p className="text-xs text-red-100">Confirmá la acción antes de mover a la papelera</p>
                </div>
              </div>
              <button onClick={() => setShowConfirmModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-[10px] font-bold text-red-500 uppercase">A la Papelera de Gmail</p>
                  <p className="text-lg font-black text-red-700 mt-0.5">{scanResult.aBorrar.length} Correos</p>
                  <p className="text-[11px] text-red-600">Propaganda, súper y ofertas</p>
                </div>
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase">Conservados Intactos</p>
                  <p className="text-lg font-black text-emerald-700 mt-0.5">{scanResult.aConservar.length} Correos</p>
                  <p className="text-[11px] text-emerald-600">Consultas, Flor del Sur y Bancos</p>
                </div>
              </div>

              {/* Items to delete list */}
              {scanResult.aBorrar.length > 0 ? (
                <div className="space-y-2">
                  <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    Correos de Propaganda que se enviarán a la Papelera:
                  </p>
                  <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-48 overflow-y-auto bg-slate-50">
                    {scanResult.aBorrar.map((item, idx) => (
                      <div key={idx} className="p-3 bg-white flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800 line-clamp-1">{item.subject}</p>
                          <p className="text-[11px] text-slate-500">{item.sender}</p>
                        </div>
                        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap">
                          {item.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 font-semibold">
                  ✨ No se detectó ninguna propaganda en tu bandeja de entrada.
                </div>
              )}

              {/* Items preserved */}
              {scanResult.aConservar.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Correos Protegidos que quedan en tu Bandeja:
                  </p>
                  <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-36 overflow-y-auto bg-slate-50">
                    {scanResult.aConservar.map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-white flex items-center justify-between gap-3">
                        <div className="truncate max-w-[340px]">
                          <span className="font-bold text-slate-800 mr-2">{item.subject}</span>
                          <span className="text-slate-400 text-[11px]">({item.sender})</span>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap">
                          {item.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={executeConfirmedCleanup}
                disabled={isExecuting || scanResult.aBorrar.length === 0}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Moviendo a papelera...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirmar y Mover {scanResult.aBorrar.length} a la Papelera</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== COMPOSE / SEND EMAIL MODAL ==================== */}
      {showCompose && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleExecuteSend}
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="bg-red-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                <h3 className="text-base font-bold">Enviar Correo con Martín</h3>
              </div>
              <button type="button" onClick={() => setShowCompose(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Destinatario (Email): *</label>
                <input
                  type="email"
                  required
                  placeholder="cliente@ejemplo.com"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Asunto: *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Presupuesto Automatización / Logística Flor del Sur"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mensaje: *</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Escribí el contenido del correo acá..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCompose(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={sendingEmail}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {sendingEmail ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Correo Ahora</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
