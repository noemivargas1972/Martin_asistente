import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Smartphone,
  Share2,
  Plus,
  CheckCircle2,
  Sparkles,
  Clipboard,
  FileSpreadsheet,
  Upload,
  Search,
  Check,
  X,
  MessageSquare,
  PhoneCall,
  ArrowRight,
  Filter,
  Trash2,
  Layers,
  Building2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  CheckCheck
} from "lucide-react";
import { speakMartin } from "../lib/maleVoicePicker";
import { sendWhatsAppMessage } from "../lib/whatsappSender";
import { WhatsAppModeSelector } from "./WhatsAppModeSelector";
import { CustomSalesSpeechConfig } from "../types";

export interface MappedContact {
  id: string;
  name: string;
  phone: string;
  category: string;
  location?: string;
  websiteOrIg?: string;
  estimatedVolume?: string;
  painPoint?: string;
  notes?: string;
  source: "whatsapp_agenda" | "vcf_file" | "manual_paste" | "csv_import";
  isLinkedToPanel: boolean;
  selected: boolean;
}

interface MartinContactsIntegrationSectionProps {
  prospects: Array<{
    id: string;
    name: string;
    phone: string;
    category: string;
    websiteOrIg: string;
    estimatedVolume: string;
    painPoint: string;
    callPitch: string;
    whatsappMessage: string;
    status: "nuevo" | "llamado" | "whatsapp_enviado" | "cita_agendada";
  }>;
  setProspects: React.Dispatch<React.SetStateAction<Array<{
    id: string;
    name: string;
    phone: string;
    category: string;
    websiteOrIg: string;
    estimatedVolume: string;
    painPoint: string;
    callPitch: string;
    whatsappMessage: string;
    status: "nuevo" | "llamado" | "whatsapp_enviado" | "cita_agendada";
  }>>>;
  flexPricing: {
    motoFlex: string;
    caminante: string;
    puntoRetiro: string;
    furgon: string;
    promoDiscount: string;
  };
  speechConfig: CustomSalesSpeechConfig;
  userDisplayName?: string;
  onNavigateToProspects?: () => void;
}

const SAMPLE_INITIAL_MAPPED: MappedContact[] = [
  {
    id: "map-1",
    name: "Calzados Palermo Express",
    phone: "+54 9 11 4455-8899",
    category: "Indumentaria & Calzado",
    location: "Palermo, CABA",
    websiteOrIg: "@calzadospalermo.ba",
    estimatedVolume: "300 envíos/mes",
    painPoint: "Necesita envíos en el día para ventas por Mercado Libre y Tienda Nube.",
    source: "whatsapp_agenda",
    isLinkedToPanel: false,
    selected: true
  },
  {
    id: "map-2",
    name: "Glow Cosmética Natural",
    phone: "+54 9 11 6789-1234",
    category: "Cosmética & Estética",
    location: "Recoleta / Belgrano",
    websiteOrIg: "@glowcosmetica.ar",
    estimatedVolume: "220 envíos/mes",
    painPoint: "Frágil empaque, requiere retiro en puntos seguros y entrega express.",
    source: "whatsapp_agenda",
    isLinkedToPanel: false,
    selected: true
  },
  {
    id: "map-3",
    name: "TecnoStore Villa Crespo",
    phone: "+54 9 11 3988-6278",
    category: "Tecnología & Gadgets",
    location: "Villa Crespo, CABA",
    websiteOrIg: "@tecnostore_vc",
    estimatedVolume: "450 envíos/mes",
    painPoint: "Altas devoluciones por entregas demoradas del correo tradicional.",
    source: "whatsapp_agenda",
    isLinkedToPanel: false,
    selected: true
  },
  {
    id: "map-4",
    name: "Bazar & Hogar Deco BA",
    phone: "+54 9 11 5566-7788",
    category: "Bazar & Hogar",
    location: "Caballito, CABA",
    websiteOrIg: "@bazardeco.ba",
    estimatedVolume: "180 envíos/mes",
    painPoint: "Busca tarifa plana de entrega en CABA y puntos de retiro para sus clientes.",
    source: "whatsapp_agenda",
    isLinkedToPanel: false,
    selected: false
  }
];

export const MartinContactsIntegrationSection: React.FC<MartinContactsIntegrationSectionProps> = ({
  prospects,
  setProspects,
  flexPricing,
  speechConfig,
  userDisplayName = "Noemí Carvallo",
  onNavigateToProspects
}) => {
  // Input method tab
  const [inputTab, setInputTab] = useState<"paste" | "file" | "quick">("paste");

  // Mapped Contacts list state
  const [mappedContacts, setMappedContacts] = useState<MappedContact[]>(() => {
    try {
      const saved = localStorage.getItem("martin_mapped_whatsapp_contacts");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SAMPLE_INITIAL_MAPPED;
  });

  // Text inputs
  const [pasteText, setPasteText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [successToast, setSuccessToast] = useState<{ message: string; count: number } | null>(null);

  // Quick form state
  const [quickName, setQuickName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const [quickCategory, setQuickCategory] = useState("Indumentaria & Calzado");
  const [quickLocation, setQuickLocation] = useState("CABA");
  const [quickVolume, setQuickVolume] = useState("200 envíos/mes");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to persist mapped contacts
  const saveMappedContacts = (updated: MappedContact[]) => {
    setMappedContacts(updated);
    try {
      localStorage.setItem("martin_mapped_whatsapp_contacts", JSON.stringify(updated));
    } catch (e) {}
  };

  // Helper to clean and normalize Argentine WhatsApp numbers
  const normalizePhone = (raw: string): string => {
    let clean = raw.replace(/[^\d+]/g, "").trim();
    if (!clean) return "+54 9 11 0000-0000";
    if (clean.startsWith("15")) {
      clean = "11" + clean.substring(2);
    }
    if (clean.startsWith("11") && clean.length === 10) {
      return `+54 9 ${clean.substring(0, 2)} ${clean.substring(2, 6)}-${clean.substring(6)}`;
    }
    if (clean.startsWith("54") && !clean.startsWith("+54")) {
      clean = "+" + clean;
    }
    if (clean.startsWith("+54") && !clean.includes("9") && clean.length >= 12) {
      clean = clean.replace("+54", "+54 9 ");
    }
    return clean;
  };

  // Format Speech Pitch for Prospect
  const buildProspectPitch = (name: string, category: string) => {
    if (speechConfig?.callOpeningSpeechTemplate) {
      return speechConfig.callOpeningSpeechTemplate
        .replace(/\{nombre_comercio\}/g, name)
        .replace(/\{rubro\}/g, category)
        .replace(/\{tarifa_moto\}/g, flexPricing.motoFlex)
        .replace(/\{tarifa_caminante\}/g, flexPricing.caminante)
        .replace(/\{tarifa_puntos\}/g, flexPricing.puntoRetiro)
        .replace(/\{tarifa_furgon\}/g, flexPricing.furgon)
        .replace(/\{descuento_promo\}/g, flexPricing.promoDiscount);
    }
    return `Hola, ¿cómo estás? Te habla Martín, Director de Operaciones de Logística X (Buenos Aires Flex). Vimos su tienda ${name} y sabemos que la clave es entregar en el día en CABA y AMBA. Ofrecemos moto express desde ${flexPricing.motoFlex} y 10 puntos de retiro desde ${flexPricing.puntoRetiro} con ${flexPricing.promoDiscount} de bienvenida. ¿Coordinamos 10 minutos para contarte más?`;
  };

  // Format WhatsApp Proposal for Prospect
  const buildProspectWhatsAppMessage = (name: string, category: string) => {
    if (speechConfig?.whatsappSpeechTemplate) {
      return speechConfig.whatsappSpeechTemplate
        .replace(/\{nombre_comercio\}/g, name)
        .replace(/\{rubro\}/g, category)
        .replace(/\{tarifa_moto\}/g, flexPricing.motoFlex)
        .replace(/\{tarifa_caminante\}/g, flexPricing.caminante)
        .replace(/\{tarifa_puntos\}/g, flexPricing.puntoRetiro)
        .replace(/\{tarifa_furgon\}/g, flexPricing.furgon)
        .replace(/\{descuento_promo\}/g, flexPricing.promoDiscount);
    }
    return `¡Hola equipo de ${name}! 📦 Les escribe Martín, Director de Logística X (Buenos Aires Flex).\n\nQueremos acercarles nuestra propuesta de Logística Express & Puntos de Retiro en CABA y GBA para ${category}:\n\n🚀 *Tarifas Especiales E-commerce:*\n• Moto Flex Same-Day (En el Día): ${flexPricing.motoFlex}\n• Caminantes Radio Corto: ${flexPricing.caminante}\n• 10 Puntos de Retiro CABA: ${flexPricing.puntoRetiro}\n• Furgón / Bultos Grandes: ${flexPricing.furgon}\n• Beneficio Exclusivo: ${flexPricing.promoDiscount} en tus primeros 15 días.\n\n¿Les gustaría coordinar una breve llamada de 10 minutos o recibir el tarifario en PDF?`;
  };

  // 1. Process and Map pasted text from WhatsApp
  const handleProcessPastedText = () => {
    if (!pasteText.trim()) return;
    setIsProcessingAI(true);

    setTimeout(() => {
      const lines = pasteText.split("\n").filter(l => l.trim().length > 0);
      const newItems: MappedContact[] = [];

      lines.forEach((line, idx) => {
        // Regex to search for phone numbers in various formats
        const phoneMatch = line.match(/(?:\+?54\s?9?\s?)?(?:11|15|[23]\d{2,3})[\s.-]?\d{3,4}[\s.-]?\d{4}/);
        const extractedPhone = phoneMatch ? phoneMatch[0] : "";
        let extractedName = line.replace(extractedPhone, "").replace(/[-:|,•;]/g, " ").trim();

        if (!extractedName || extractedName.length < 2) {
          extractedName = `Contacto WhatsApp #${mappedContacts.length + newItems.length + 1}`;
        }

        // Guess category by keyword
        let detectedCategory = "E-Commerce General";
        const lower = line.toLowerCase();
        if (lower.includes("calzado") || lower.includes("zapato") || lower.includes("ropa") || lower.includes("moda") || lower.includes("indumentaria")) {
          detectedCategory = "Indumentaria & Calzado";
        } else if (lower.includes("tecno") || lower.includes("celu") || lower.includes("gadget") || lower.includes("audio") || lower.includes("funda")) {
          detectedCategory = "Tecnología & Gadgets";
        } else if (lower.includes("cosmetic") || lower.includes("glow") || lower.includes("beauty") || lower.includes("perfum") || lower.includes("estetic")) {
          detectedCategory = "Cosmética & Estética";
        } else if (lower.includes("suplement") || lower.includes("alimento") || lower.includes("snack") || lower.includes("proteina")) {
          detectedCategory = "Alimentos & Suplementos";
        } else if (lower.includes("bazar") || lower.includes("deco") || lower.includes("hogar") || lower.includes("vela")) {
          detectedCategory = "Bazar & Hogar";
        }

        const normalizedPhone = extractedPhone ? normalizePhone(extractedPhone) : `+54 9 11 ${Math.floor(4000 + Math.random() * 5000)}-${Math.floor(1000 + Math.random() * 9000)}`;

        newItems.push({
          id: `map-${Date.now()}-${idx}`,
          name: extractedName,
          phone: normalizedPhone,
          category: detectedCategory,
          location: "CABA / Gran Buenos Aires",
          websiteOrIg: `@${extractedName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
          estimatedVolume: "250 envíos/mes",
          painPoint: "Optimizar costos de entrega same-day y ofrecer puntos de retiro.",
          source: "manual_paste",
          isLinkedToPanel: false,
          selected: true
        });
      });

      const merged = [...newItems, ...mappedContacts];
      saveMappedContacts(merged);
      setPasteText("");
      setIsProcessingAI(false);

      if (speechConfig?.autoVoiceEnabled !== false) {
        speakMartin(
          `¡Listo Noemí! He mapeado ${newItems.length} contactos desde el texto de WhatsApp. Ya podés revisarlos y vincularlos directamente al panel de seguimiento de clientes encontrados.`
        );
      }
    }, 600);
  };

  // 2. Paste from system clipboard
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setPasteText(text);
    } catch (e) {
      alert("Por favor pegá el texto manualmente en el cuadro.");
    }
  };

  // 3. Handle File Upload (.vcf, .csv, .txt)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const newMapped: MappedContact[] = [];

      // If .vcf (vCard format)
      if (file.name.endsWith(".vcf") || content.includes("BEGIN:VCARD")) {
        const vcards = content.split("BEGIN:VCARD");
        vcards.forEach((card, i) => {
          if (!card.trim()) return;
          const fnMatch = card.match(/FN:(.+)/i);
          const telMatch = card.match(/TEL.*:(.+)/i);
          if (fnMatch || telMatch) {
            const name = fnMatch ? fnMatch[1].trim() : `Contacto vCard ${i}`;
            const rawPhone = telMatch ? telMatch[1].trim() : "";
            newMapped.push({
              id: `vcf-${Date.now()}-${i}`,
              name: name,
              phone: normalizePhone(rawPhone),
              category: "E-Commerce / Cliente Agendado",
              location: "CABA y GBA",
              websiteOrIg: `@${name.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
              estimatedVolume: "200 envíos/mes",
              painPoint: "Solución de envíos en el día y tarifas corporativas Flex.",
              source: "vcf_file",
              isLinkedToPanel: false,
              selected: true
            });
          }
        });
      } else {
        // CSV or TXT line by line
        const lines = content.split("\n");
        lines.forEach((line, i) => {
          const parts = line.split(/[,;\t]/);
          if (parts.length >= 1 && parts[0].trim()) {
            const name = parts[0].trim();
            const rawPhone = parts.length > 1 ? parts[1].trim() : "";
            const category = parts.length > 2 ? parts[2].trim() : "E-Commerce";
            newMapped.push({
              id: `csv-${Date.now()}-${i}`,
              name: name,
              phone: normalizePhone(rawPhone),
              category: category,
              location: "CABA",
              websiteOrIg: `@${name.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
              estimatedVolume: "250 envíos/mes",
              painPoint: "Envíos en el día y puntos de retiro.",
              source: "csv_import",
              isLinkedToPanel: false,
              selected: true
            });
          }
        });
      }

      if (newMapped.length > 0) {
        const updated = [...newMapped, ...mappedContacts];
        saveMappedContacts(updated);
        if (speechConfig?.autoVoiceEnabled !== false) {
          speakMartin(
            `¡Excelente! Importé y mapeé ${newMapped.length} contactos desde el archivo ${file.name}.`
          );
        }
      }
    };
    reader.readAsText(file);
  };

  // 4. Quick Add Single Contact
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    const newContact: MappedContact = {
      id: `map-${Date.now()}`,
      name: quickName.trim(),
      phone: normalizePhone(quickPhone || "11 4455 8899"),
      category: quickCategory,
      location: quickLocation,
      websiteOrIg: `@${quickName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      estimatedVolume: quickVolume,
      painPoint: "Entregas en el día y cobertura de puntos de retiro en CABA.",
      source: "whatsapp_agenda",
      isLinkedToPanel: false,
      selected: true
    };

    saveMappedContacts([newContact, ...mappedContacts]);
    setQuickName("");
    setQuickPhone("");

    if (speechConfig?.autoVoiceEnabled !== false) {
      speakMartin(
        `Contacto ${newContact.name} mapeado correctamente con número ${newContact.phone}.`
      );
    }
  };

  // 5. Toggle Single Selection
  const toggleSelect = (id: string) => {
    const updated = mappedContacts.map(c => c.id === id ? { ...c, selected: !c.selected } : c);
    saveMappedContacts(updated);
  };

  // 6. Select All / Deselect All
  const handleSelectAll = (select: boolean) => {
    const updated = mappedContacts.map(c => ({ ...c, selected: select }));
    saveMappedContacts(updated);
  };

  // 7. Delete mapped contact
  const handleDeleteMapped = (id: string) => {
    const updated = mappedContacts.filter(c => c.id !== id);
    saveMappedContacts(updated);
  };

  // 8. Clear all mapped contacts
  const handleClearAll = () => {
    if (window.confirm("¿Seguro que querés limpiar la mesa de contactos mapeados?")) {
      saveMappedContacts([]);
    }
  };

  // 🚀 9. CRITICAL ACTION: LINK SELECTED CONTACTS DIRECTLY TO MARTIN'S MAIN PROSPECTS PANEL
  const handleLinkSelectedToMainPanel = (targetStatus: "nuevo" | "whatsapp_enviado" = "nuevo") => {
    const selectedList = mappedContacts.filter(c => c.selected && !c.isLinkedToPanel);
    if (selectedList.length === 0) {
      alert("Por favor seleccioná al menos un contacto que no haya sido vinculado todavía.");
      return;
    }

    // Convert selected mapped contacts into full ProspectLead objects for the main panel
    const newProspects = selectedList.map((contact, idx) => ({
      id: `pros-linked-${Date.now()}-${idx}`,
      name: contact.name,
      phone: contact.phone,
      category: contact.category || "E-Commerce",
      websiteOrIg: contact.websiteOrIg || `@${contact.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      estimatedVolume: contact.estimatedVolume || "300 envíos/mes",
      painPoint: contact.painPoint || "Reducción de costos en entregas en el día y solución de retiro en sucursales.",
      callPitch: buildProspectPitch(contact.name, contact.category),
      whatsappMessage: buildProspectWhatsAppMessage(contact.name, contact.category),
      status: targetStatus
    }));

    // Update main prospects list
    setProspects(prev => [...newProspects, ...prev]);

    // Mark as linked in the mapped contacts table
    const updatedMapped = mappedContacts.map(c => {
      if (selectedList.some(s => s.id === c.id)) {
        return { ...c, isLinkedToPanel: true, selected: false };
      }
      return c;
    });
    saveMappedContacts(updatedMapped);

    // Spoken confirmation by Martin
    if (speechConfig?.autoVoiceEnabled !== false) {
      speakMartin(
        `¡Excelente ${userDisplayName}! He vinculado con éxito ${selectedList.length} contactos de WhatsApp directamente a tu panel de seguimiento de clientes encontrados. Ya tienen preparado el speech comercial con las tarifas de Buenos Aires Flex y están listos para salir a vender.`
      );
    }

    // Show visual confirmation toast
    setSuccessToast({
      message: `¡${selectedList.length} contactos de WhatsApp vinculados exitosamente al panel de clientes encontrados!`,
      count: selectedList.length
    });

    setTimeout(() => {
      setSuccessToast(null);
    }, 6000);
  };

  // 10. Link Single Contact
  const handleLinkSingleContact = (contact: MappedContact) => {
    const newProspect = {
      id: `pros-single-${Date.now()}`,
      name: contact.name,
      phone: contact.phone,
      category: contact.category || "E-Commerce",
      websiteOrIg: contact.websiteOrIg || `@${contact.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      estimatedVolume: contact.estimatedVolume || "250 envíos/mes",
      painPoint: contact.painPoint || "Solución logística express en el día.",
      callPitch: buildProspectPitch(contact.name, contact.category),
      whatsappMessage: buildProspectWhatsAppMessage(contact.name, contact.category),
      status: "nuevo" as const
    };

    setProspects(prev => [newProspect, ...prev]);

    const updated = mappedContacts.map(c => c.id === contact.id ? { ...c, isLinkedToPanel: true, selected: false } : c);
    saveMappedContacts(updated);

    if (speechConfig?.autoVoiceEnabled !== false) {
      speakMartin(
        `Contacto ${contact.name} vinculado al panel principal de clientes encontrados.`
      );
    }

    setSuccessToast({
      message: `"${contact.name}" vinculado a la lista principal de clientes de Martín.`,
      count: 1
    });

    setTimeout(() => setSuccessToast(null), 5000);
  };

  // Direct WhatsApp test message
  const handleSendDirectWhatsApp = (contact: MappedContact) => {
    const msg = buildProspectWhatsAppMessage(contact.name, contact.category);
    sendWhatsAppMessage({
      phone: contact.phone,
      message: msg
    });
  };

  // Filtered contacts
  const filteredContacts = mappedContacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
    const matchesCat = categoryFilter === "all" || c.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const selectedCount = mappedContacts.filter(c => c.selected && !c.isLinkedToPanel).length;
  const linkedCount = mappedContacts.filter(c => c.isLinkedToPanel).length;

  return (
    <div className="space-y-6">
      {/* 🚀 1. HERO & STATS BANNER */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-500/30 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-500/30">
              <Users className="w-3.5 h-3.5" />
              <span>Integración de Contactos WhatsApp</span>
            </div>
            <h3 className="font-black text-xl md:text-2xl tracking-tight text-white">
              Mapeo y Vinculación de Contactos de WhatsApp
            </h3>
            <p className="text-xs md:text-sm text-indigo-200 leading-relaxed">
              Mapeá números de teléfono de tu WhatsApp o agenda, extraé automáticamente los datos de cada comercio y 
              <strong className="text-emerald-400"> vinculalos directamente al panel de seguimiento de Martín</strong> para que aparezcan en la lista principal de clientes encontrados con propuestas comerciales listas para vender.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-col sm:flex-row items-end gap-3 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/15 text-center min-w-[80px]">
                <span className="block text-xl font-black text-emerald-400 font-mono">{mappedContacts.length}</span>
                <span className="text-[10px] text-slate-300 font-bold uppercase">Mapeados</span>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl border border-white/15 text-center min-w-[80px]">
                <span className="block text-xl font-black text-indigo-400 font-mono">{selectedCount}</span>
                <span className="text-[10px] text-slate-300 font-bold uppercase">Seleccionados</span>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl border border-white/15 text-center min-w-[80px]">
                <span className="block text-xl font-black text-amber-400 font-mono">{linkedCount}</span>
                <span className="text-[10px] text-slate-300 font-bold uppercase">En Panel</span>
              </div>
            </div>
            <WhatsAppModeSelector compact />
          </div>
        </div>

        {/* Success Toast Banner */}
        <AnimatePresence>
          {successToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-emerald-500 text-slate-950 font-extrabold text-xs md:text-sm rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 border border-emerald-300"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-slate-950" />
                <span>{successToast.message}</span>
              </div>
              {onNavigateToProspects && (
                <button
                  type="button"
                  onClick={onNavigateToProspects}
                  className="px-4 py-1.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <span>Ver en Lista Principal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🚀 2. HERRAMIENTAS DE ENTRADA Y MAPEO */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        {/* Sub tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setInputTab("paste")}
            className={`pb-3 px-4 text-xs md:text-sm font-extrabold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              inputTab === "paste"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Clipboard className="w-4 h-4" />
            <span>📋 Pegar Texto / Chats de WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setInputTab("file")}
            className={`pb-3 px-4 text-xs md:text-sm font-extrabold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              inputTab === "file"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>📲 Importar Archivo (.vcf / .csv / .txt)</span>
          </button>

          <button
            type="button"
            onClick={() => setInputTab("quick")}
            className={`pb-3 px-4 text-xs md:text-sm font-extrabold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              inputTab === "quick"
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>➕ Carga Rápida Individual</span>
          </button>
        </div>

        {/* Tab Content 1: Paste Text */}
        {inputTab === "paste" && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  Pegá una lista o fragmento de chat de WhatsApp con números de teléfono
                </h4>
                <p className="text-xs text-slate-500">
                  Martín detectará los teléfonos (+54 9 11...), extraerá nombres de comercios y los mapeará automáticamente a la mesa.
                </p>
              </div>
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Pegar Portapapeles</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={"Ejemplo de texto pegado de WhatsApp:\nTienda Calzados Palermo - 11 4455-8899\nJuan de TechStore: +54 9 11 6789-1234 (venden accesorios de celulares)\nModa Express 11 5566-7788 Palermo indumentaria\nBazar Deco 11 3988-6278"}
              className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-xs md:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400 font-medium">
                Tip: Podés pegar renglones con o sin formato, Martín normaliza los números automáticamente.
              </span>
              <button
                type="button"
                onClick={handleProcessPastedText}
                disabled={!pasteText.trim() || isProcessingAI}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-extrabold text-xs md:text-sm rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isProcessingAI ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mapeando con IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>🪄 Mapear y Extraer Contactos</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab Content 2: File Upload */}
        {inputTab === "file" && (
          <div className="p-8 text-center space-y-4">
            <div className="max-w-md mx-auto p-8 border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm md:text-base">
                Subir contactos de WhatsApp (.vcf, .csv, .txt)
              </h4>
              <p className="text-xs text-slate-500">
                Podés exportar contactos de WhatsApp o de tu celular en formato .vcf (vCard) o .csv para mapearlos en segundos.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".vcf,.csv,.txt"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs md:text-sm rounded-2xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Seleccionar Archivo de Contactos</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Content 3: Quick Add */}
        {inputTab === "quick" && (
          <form onSubmit={handleQuickAdd} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Nombre de la Tienda / Contacto *
                </label>
                <input
                  type="text"
                  required
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="Ej: Calzados Roma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={quickPhone}
                  onChange={(e) => setQuickPhone(e.target.value)}
                  placeholder="Ej: +54 9 11 4455-8899"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Rubro / Categoría
                </label>
                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="Indumentaria & Calzado">👗 Indumentaria & Calzado</option>
                  <option value="Tecnología & Gadgets">📱 Tecnología & Gadgets</option>
                  <option value="Cosmética & Estética">💄 Cosmética & Estética</option>
                  <option value="Alimentos & Suplementos">🏋️ Alimentos & Suplementos</option>
                  <option value="Bazar & Hogar">🏠 Bazar & Hogar</option>
                  <option value="Ferretería & Repuestos">🔧 Ferretería & Repuestos</option>
                  <option value="E-Commerce General">📦 E-Commerce General</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Ubicación / Zona
                </label>
                <input
                  type="text"
                  value={quickLocation}
                  onChange={(e) => setQuickLocation(e.target.value)}
                  placeholder="Ej: Palermo, CABA"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs md:text-sm rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Mapear y Agregar a la Mesa</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 🚀 3. MESA DE MAPEO Y ACCIÓN DE VINCULACIÓN AL PANEL PRINCIPAL */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-4">
        {/* Header of Table */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-600" />
              <span>Contactos Mapeados desde WhatsApp ({filteredContacts.length})</span>
            </h4>
            <p className="text-xs text-slate-500">
              Seleccioná los números que querés vincular al panel de clientes de Martín.
            </p>
          </div>

          {/* Master Linking Action */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectAll(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              ☑️ Todos
            </button>
            <button
              type="button"
              onClick={() => handleSelectAll(false)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              ⬜ Ninguno
            </button>

            {mappedContacts.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                title="Limpiar contactos mapeados"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* CRITICAL VINCULAR BUTTON */}
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={() => handleLinkSelectedToMainPanel("nuevo")}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-300 disabled:to-slate-400 text-white font-black text-xs md:text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>🔗 Vincular {selectedCount > 0 ? `(${selectedCount})` : ""} al Panel de Clientes</span>
            </button>
          </div>
        </div>

        {/* Filters and search */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre de comercio o teléfono..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer w-full sm:w-auto"
            >
              <option value="all">Todos los Rubros</option>
              <option value="Indumentaria & Calzado">Indumentaria & Calzado</option>
              <option value="Tecnología & Gadgets">Tecnología & Gadgets</option>
              <option value="Cosmética & Estética">Cosmética & Estética</option>
              <option value="Alimentos & Suplementos">Alimentos & Suplementos</option>
              <option value="Bazar & Hogar">Bazar & Hogar</option>
            </select>
          </div>
        </div>

        {/* Table / List */}
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <p className="text-xs text-slate-500 font-medium">
              No hay contactos en la mesa que coincidan con la búsqueda.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  contact.isLinkedToPanel
                    ? "bg-emerald-50/50 border-emerald-200"
                    : contact.selected
                    ? "bg-indigo-50/40 border-indigo-300 shadow-sm"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Left: Checkbox + Contact Info */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={contact.selected}
                    disabled={contact.isLinkedToPanel}
                    onChange={() => toggleSelect(contact.id)}
                    className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer disabled:opacity-40"
                  />

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className="font-extrabold text-sm text-slate-900">{contact.name}</h5>
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-md">
                        {contact.category}
                      </span>
                      {contact.isLinkedToPanel ? (
                        <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>En Panel de Martín</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-extrabold rounded-md">
                          Listo para Vincular
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="font-mono font-bold text-slate-700 flex items-center gap-1">
                        🇦🇷 {contact.phone}
                      </span>
                      {contact.location && (
                        <span>• 📍 {contact.location}</span>
                      )}
                      {contact.estimatedVolume && (
                        <span>• 📦 {contact.estimatedVolume}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleSendDirectWhatsApp(contact)}
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="Probar WhatsApp con Propuesta Flex"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  {!contact.isLinkedToPanel ? (
                    <button
                      type="button"
                      onClick={() => handleLinkSingleContact(contact)}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      title="Vincular solo este contacto al panel principal"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Vincular al Panel</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="px-3 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-black flex items-center gap-1.5 opacity-80 cursor-default"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Vinculado</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteMapped(contact.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                    title="Eliminar de la mesa"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Banner to jump to Call Center */}
        {onNavigateToProspects && (
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-extrabold text-white">
                  ¿Querés ver todos los clientes vinculados en el panel principal?
                </p>
                <p className="text-[11px] text-slate-300">
                  Total de clientes encontrados y vinculados en el Call Center: {prospects.length}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateToProspects}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Ver Lista de Clientes Encontrados</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
