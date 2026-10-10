import React from "react";
import { 
  Home, 
  BarChart3, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Users, 
  FileText, 
  AlertTriangle, 
  Settings, 
  UserSquare2, 
  HelpCircle,
  Sparkles,
  Database,
  Globe,
  Bot,
  X,
  Layers,
  Truck,
  Sun,
  Mic,
  Search,
  FileSpreadsheet,
  PhoneCall,
  BellRing,
  Headphones,
  MessageSquare,
  ArrowRightLeft,
  Mail
} from "lucide-react";
import SidebarCalendar from "./SidebarCalendar";

import { UserRole } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  userRole?: UserRole;
}


export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  onClose, 
  userRole = "owner"
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

  const allMenuItems = [
    { id: "inicio", label: "Inicio", icon: Home },
    { id: "chat_martin", label: "Martín IA (Director)", icon: MessageSquare },
    { id: "agente_remitos", label: "📦 Agente Comandos & Sobrestock", icon: ArrowRightLeft },
    { id: "alertas_llamadas", label: "📞 Central Telefónica & Call Center", icon: Headphones },
    { id: "inventario_whatsapp", label: "Inventario Voz (WhatsApp Excel)", icon: FileSpreadsheet },
    { id: "venta_privada", label: "Venta Privada & Voz IA", icon: Mic },
    { id: "landing", label: "Web Pública (Landing)", icon: Globe },
    { id: "resumen", label: "Resumen General", icon: BarChart3 },
    { id: "ventas", label: "Ventas", icon: TrendingUp },
    { id: "rentabilidad", label: "Rentabilidad", icon: FileText },
    { id: "stock", label: "Stock", icon: Package },
    { id: "logistica", label: "Planificación Logística", icon: Truck },
    { id: "infraestructura", label: "Prevención Verano", icon: Sun },
    { id: "compras", label: "Compras y Facturas", icon: ShoppingCart },
    { id: "caja", label: "Caja y Arqueo", icon: CreditCard },
    { id: "clientes", label: "Clientes y Proveedores", icon: Users },
    { id: "reportes", label: "Reportes", icon: FileText },
    { id: "alertas", label: "Alertas", icon: AlertTriangle },
    { id: "notificaciones_push", label: "🔔 Notificaciones Push (FCM)", icon: BellRing },
    { id: "gmail", label: "📧 Gestión de Correo (Gmail)", icon: Mail },
    { id: "drive", label: "Martin Sistema (Drive)", icon: Database },
    { id: "config", label: "Configuración", icon: Settings },
    { id: "usuarios", label: "Usuarios", icon: UserSquare2 },
    { id: "ayuda", label: "Ayuda", icon: HelpCircle },
  ];

  const quickActions = [
    { label: "Alertas Push (Facturas & Stock)", tab: "notificaciones_push", desc: "Configurar alertas FCM en segundo plano", keywords: "push, notificaciones, fcm, facturas, stock, fondo" },
    { label: "Emitir Reporte Financiero", tab: "reportes", desc: "Generar PDF y balance consolidado", keywords: "reporte, financiero, balance, emitir, pdf" },
    { label: "Alerta de Stock / Crítico", tab: "alertas", desc: "Productos bajo mínimo y quiebres", keywords: "stock, critico, alerta, faltas, reponer, stock bajo" },
    { label: "Análisis de Rentabilidad", tab: "rentabilidad", desc: "Márgenes netos por sucursal", keywords: "rentabilidad, margen, ganancia, cogs, rendimiento" },
    { label: "Recaudación Diaria / Caja", tab: "caja", desc: "Cierre de caja y arqueo de 12 hs", keywords: "recaudacion, caja, arqueo, dinero, efectivo, digital, cobrar" },
    { label: "Martin Sistema (Drive)", tab: "drive", desc: "Ver y sincronizar archivos en la nube", keywords: "drive, sheets, archivos, sincronizar, base, backup" },
    { label: "Voz IA / Venta Privada", tab: "venta_privada", desc: "Dictado por voz y ventas rápidas", keywords: "voz, voz ia, dictado, audio, microfono" },
    { label: "Chat con Martín (IA)", tab: "chat_martin", desc: "Consulta financiera con nuestro analista", keywords: "martin, chat, ia, gemini, preguntar, analista" },
    { label: "Configurar Usuarios", tab: "usuarios", desc: "Permisos, roles y códigos de acceso", keywords: "usuarios, roles, permisos, whitelist, acceso" },
  ];

  // Filter menu items by authenticated user role
  const isOperarioRole = userRole === "operario" || userRole === "empleado";
  const menuItems = allMenuItems.filter((item) => {
    if (isOperarioRole) {
      return ["inicio", "chat_martin", "inventario_whatsapp", "ayuda", "venta_privada"].includes(item.id);
    }
    if (userRole === "deposito") {
      return ["inicio", "chat_martin", "inventario_whatsapp", "stock", "logistica", "infraestructura", "compras", "ayuda", "venta_privada"].includes(item.id);
    }
    if (userRole.startsWith("supervisor_")) {
      return ["inicio", "chat_martin", "inventario_whatsapp", "stock", "alertas", "reportes", "infraestructura", "ayuda", "venta_privada"].includes(item.id);
    }
    return true; // Full access for owner, admin, gerente
  });


  return (
    <>
      {/* Mobile Sidebar Backdrop overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <div 
        id="app-sidebar" 
        className={`w-60 md:w-64 bg-[#0a1128] text-slate-300 flex flex-col h-full min-h-0 select-none border-r border-[#1e293b]/30 fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-3.5 px-4 border-b border-[#1e293b]/40 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm tracking-tight text-white leading-tight">
                Smart Commerce
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">
                Centro de Control Inteligente
              </p>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white md:hidden cursor-pointer"
              title="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Single Authenticated Role Indicator */}
        <div className="px-4 py-2.5 bg-[#060c1d] border-b border-[#1e293b]/40 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 truncate">
            <span className={`w-2 h-2 rounded-full ${isOperarioRole ? "bg-emerald-400" : "bg-indigo-400"} animate-pulse`} />
            <span className="text-[11px] font-bold text-slate-200 truncate">
              {isOperarioRole ? "👷 Rol: Operario / Empleado" : userRole === "deposito" ? "📦 Rol: Depósito" : userRole.startsWith("supervisor_") ? "🔍 Rol: Supervisor" : "💼 Rol: Gerencia / Administración"}
            </span>
          </div>
        </div>

        {/* Lupa de Acceso Rápido */}
        <div className="p-3 border-b border-[#1e293b]/20 bg-[#070d1e]/50 relative">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar función o reporte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full bg-[#0d1527] border border-[#1e293b]/50 rounded-lg pl-8 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300 text-xs"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick Access Results dropdown */}
          {(searchQuery || isSearchFocused) && (
            <div className="absolute left-3 right-3 mt-1.5 bg-[#0f1b35] border border-[#1e293b] rounded-lg shadow-xl z-50 max-h-52 overflow-y-auto divide-y divide-[#1e293b]/40 scrollbar-thin">
              <div className="p-1.5 text-[9px] font-semibold text-indigo-400 flex justify-between items-center bg-[#0d1527]">
                <span>ACCESOS RÁPIDOS</span>
              </div>
              {(() => {
                const query = searchQuery.toLowerCase();
                const filtered = quickActions.filter(action => {
                  if (userRole !== "owner") {
                    const isAllowed = menuItems.some(m => m.id === action.tab);
                    if (!isAllowed) return false;
                  }
                  return (
                    action.label.toLowerCase().includes(query) ||
                    action.desc.toLowerCase().includes(query) ||
                    action.keywords.toLowerCase().includes(query)
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-2.5 text-[11px] text-slate-500 text-center">
                      No se encontraron funciones.
                    </div>
                  );
                }

                return filtered.map((action) => (
                  <button
                    key={action.tab}
                    onClick={() => {
                      setActiveTab(action.tab);
                      setSearchQuery("");
                      setIsSearchFocused(false);
                      if (onClose) onClose();
                    }}
                    className="w-full text-left p-2 hover:bg-indigo-600/30 flex items-start gap-2 transition-colors cursor-pointer group"
                  >
                    <div className="p-1 bg-slate-800 rounded group-hover:bg-indigo-600/50 text-slate-400 group-hover:text-white mt-0.5 shrink-0">
                      <Search className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold text-slate-200 group-hover:text-white truncate">
                        {action.label}
                      </div>
                      <div className="text-[9px] text-slate-400 group-hover:text-slate-300 truncate">
                        {action.desc}
                      </div>
                    </div>
                  </button>
                ));
              })()}
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 text-left ${
                  isActive
                    ? "bg-indigo-600/90 text-white shadow-lg shadow-indigo-600/20 font-semibold"
                    : "hover:bg-slate-800/50 hover:text-white text-slate-400"
                }`}
              >
                <IconComponent className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <div className="pt-2 border-t border-[#1e293b]/30">
            <SidebarCalendar />
          </div>
        </div>

        {/* Bottom Assistant Feature highlight */}
        <div className="p-4 border-t border-[#1e293b]/40 bg-[#070d1e]">
          <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/20 rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-300">Análisis con IA</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Martín está listo para consolidar y analizar los archivos de la carpeta <strong className="text-indigo-300">Martin Sistema</strong>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
