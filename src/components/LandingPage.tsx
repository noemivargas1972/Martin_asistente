import React, { useState } from "react";
import { 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  Database, 
  UserCheck, 
  Clock, 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  Lock, 
  Globe, 
  HelpCircle,
  TrendingUp,
  BrainCircuit,
  Users2
} from "lucide-react";
import { motion } from "motion/react";

const businessBg = "/src/assets/images/business_bg_1783883130218.jpg";

interface LandingPageProps {
  onBackToDashboard: () => void;
  userEmail?: string | null;
  onSignIn: () => void;
}

export default function LandingPage({ onBackToDashboard, userEmail, onSignIn }: LandingPageProps) {
  const [activeLegalTab, setActiveLegalTab] = useState<"privacy" | "terms" | "history">("history");
  
  // Custom interactive cost estimator for Noemi's business
  const [estimatedClients, setEstimatedClients] = useState<number>(10);
  const [clientPlanPrice, setClientPlanPrice] = useState<number>(15); // USD per month per client
  
  // Cost breakdown
  const domainCostAnnual = 12; // USD per year
  const workspaceCostMonthly = 7.20; // USD per month per admin
  
  const estimatedAnnualRevenue = estimatedClients * clientPlanPrice * 12;
  const estimatedAnnualCosts = domainCostAnnual + (workspaceCostMonthly * 12);
  const netAnnualProfit = estimatedAnnualRevenue - estimatedAnnualCosts;

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-y-auto relative bg-[#060a17]">
      {/* Premium Glassmorphic Abstract Corporate Background */}
      <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
        <img 
          src={businessBg} 
          alt="Corporate Assistance Network" 
          className="w-full h-full object-cover opacity-25 scale-105 filter blur-[1.5px]" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060a17]/95 via-[#060a17]/80 to-[#03050c]/98" />
      </div>

      {/* Top Banner indicating Google OAuth compliance */}
      <div className="bg-indigo-950/60 backdrop-blur-md border-b border-indigo-900/40 px-4 py-2 text-center text-xs text-indigo-300 font-mono flex items-center justify-center gap-2">
        <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Plataforma Certificada de Inteligencia Operativa y Control Empresarial de Alta Seguridad.</span>
      </div>

      {/* Navigation */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sm tracking-tight text-white leading-tight">
              Smart Commerce
            </h1>
            <p className="text-[10px] text-indigo-400 font-mono">
              Business Intelligence Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a href="#estimador" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            Calculadora Comercial
          </a>
          <a href="#legal" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            Legal & Verificación
          </a>
          
          {userEmail ? (
            <button 
              onClick={onBackToDashboard}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center gap-1.5"
            >
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={onBackToDashboard}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Ingresar al Sistema
              </button>
              <button 
                onClick={onSignIn}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all border border-slate-700 cursor-pointer"
              >
                Conectar Google
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center space-y-8 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-400 font-semibold">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>La sinergia perfecta entre el ser humano y la tecnología</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto">
          Gestioná la Inteligencia de tu Negocio con <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Martín IA</span>
        </h1>

        <p className="text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Un ecosistema diseñado para potenciar el desarrollo integral de la persona en su ámbito laboral, cognitivo y comunitario. Martín se conecta de forma segura a tu Google Drive para organizar tus finanzas de manera automatizada.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
            onClick={onBackToDashboard}
            className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Acceder al Panel de Gestión</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          {!userEmail && (
            <button 
              onClick={onSignIn}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-all text-center cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Conectar mi Cuenta Google</span>
            </button>
          )}
        </div>

        {/* Decorative Grid Mesh */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      </section>

      {/* Triple Impact Framework (Human-Technology Ecosystem) */}
      <section className="bg-slate-950/60 py-16 border-y border-slate-800/40">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Filosofía de Desarrollo</span>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">El Ecosistema Google como puente humano</h2>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              Creemos en una tecnología que no reemplaza al ser humano, sino que lo complementa para potenciar sus capacidades innatas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-900/60 border border-slate-800/50 rounded-2xl space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">Impacto Laboral</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatizá tareas monótonas de cálculo, conciliación de caja y lectura de planillas. Dejá el trabajo pesado a la IA y enfocá tu energía en las decisiones estratégicas de crecimiento.
              </p>
            </div>

            <div className="p-6 bg-slate-900/60 border border-slate-800/50 rounded-2xl space-y-4">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">Desarrollo Cognitivo</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                El acceso a informes en tiempo real, análisis predictivos de ventas y recomendaciones personalizadas por Martín estimula una comprensión más profunda e inteligente de los mercados.
              </p>
            </div>

            <div className="p-6 bg-slate-900/60 border border-slate-800/50 rounded-2xl space-y-4">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
                <Users2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">Efecto Comunitario y Familiar</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Menos tiempo atado al negocio significa más tiempo de calidad para la familia y la comunidad. Una persona libre de estrés laboral genera un impacto positivo directo en su entorno social.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Google Integration Ecosystem (Logos & Accompanying Description) */}
      <section className="py-16 max-w-6xl mx-auto px-6 space-y-10 border-t border-slate-800/40">
        <div className="text-center space-y-3">
          <div className="flex justify-center items-center gap-2 mb-1">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono font-bold">Ecosistema Oficial</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">Sincronización Nativa Cifrada</h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            Smart Commerce se integra de forma fluida y privada con tu ecosistema corporativo de Google. Cifrado de extremo a extremo: la información de tu negocio pertenece a tu empresa y se resguarda bajo los más altos estándares de seguridad.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Google Drive */}
          <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl flex flex-col items-center text-center space-y-3.5">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path fill="#FFC107" d="M8.12 4.14h7.76l6.12 10.6H14.24z"/>
                <path fill="#1976D2" d="M15.88 14.74l-3.88 6.72L5.88 10.86l3.88-6.72z"/>
                <path fill="#4CAF50" d="M12 14.74H4.24L2.12 11.2 9.88 11.2z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">Google Drive</h3>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                Almacenamiento seguro de reportes y archivos operativos en tu carpeta privada.
              </p>
            </div>
          </div>

          {/* Google Sheets */}
          <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl flex flex-col items-center text-center space-y-3.5">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <rect fill="#21A366" x="4" y="2" width="16" height="20" rx="2" />
                <path fill="#FFF" d="M8 7h8v2H8zm0 4h8v2H8zm0 4h8v2H8z" />
                <circle fill="#107C41" cx="6" cy="6" r="1.5" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">Google Sheets</h3>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                Consolidación automatizada de cifras de caja, saldos y métricas operativas en tiempo real.
              </p>
            </div>
          </div>

          {/* Google Identity (OAuth) */}
          <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl flex flex-col items-center text-center space-y-3.5">
            <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">Google Identity</h3>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                Acceso restringido y autenticación corporativa protegida bajo protocolos bancarios.
              </p>
            </div>
          </div>

          {/* Business Intelligence Engine */}
          <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl flex flex-col items-center text-center space-y-3.5">
            <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path fill="#8b5cf6" d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">Motor IA Empresarial</h3>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                Inteligencia propietaria que procesa y estructura automáticamente la información comercial.
              </p>
            </div>
          </div>
        </div>
      </section>

        {/* Interactive Customer-Centric ROI Calculator (Estimador de ahorro para el comercio) */}
      <section id="estimador" className="max-w-4xl mx-auto px-6 py-16 space-y-8">
        <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h3 className="font-display font-bold text-lg text-white">Calculadora de Retorno de Inversión (ROI): ¿Cuánto ahorrás?</h3>
            </div>
            <p className="text-xs text-slate-400">
              Hacé las cuentas: ¿Cuánto tiempo y dinero estás perdiendo cada mes en tareas administrativas manuales, lectura de planillas de caja y cálculos repetitivos?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Control Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                  Horas semanales en tareas administrativas: <span className="text-indigo-400 font-bold">{estimatedClients} horas</span>
                </label>
                <input 
                  type="range" 
                  min="2" 
                  max="40" 
                  value={estimatedClients} // Reusing estimatedClients state variable safely as "hours"
                  onChange={(e) => setEstimatedClients(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>2 horas/sem</span>
                  <span>40 horas/sem</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                  Valor estimado de tu hora de trabajo (o empleado): <span className="text-emerald-400 font-bold">${clientPlanPrice} USD/hr</span>
                </label>
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  value={clientPlanPrice} // Reusing clientPlanPrice state variable safely as "hourly wage"
                  onChange={(e) => setClientPlanPrice(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>$5 USD</span>
                  <span>$50 USD</span>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800/60 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Tiempo mensual dedicado hoy:</span>
                  <span className="font-mono font-semibold text-rose-400">{(estimatedClients * 4.3).toFixed(0)} horas / mes</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Tiempo con Smart Commerce (Martín IA):</span>
                  <span className="font-mono font-semibold text-emerald-400">~{((estimatedClients * 4.3) * 0.15).toFixed(0)} horas / mes</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Horas recuperadas para tu vida/familia:</span>
                  <span className="font-mono font-semibold text-indigo-400">+{((estimatedClients * 4.3) * 0.85).toFixed(0)} horas / mes</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-indigo-300 font-mono block uppercase">Dinero optimizado (Valor tiempo)</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">+${(((estimatedClients * 4.3) * 0.85) * clientPlanPrice).toLocaleString("en-US", { maximumFractionDigits: 0 })} USD/mes</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-indigo-300 font-mono block uppercase">Eficiencia</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">+85%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verification & Legal Documentation Center REQUIRED by Google */}
      <section id="legal" className="max-w-4xl mx-auto px-6 py-12 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-2xl font-display font-bold text-white">Centro de Verificación & Transparencia Legal</h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Google exige que expliques transparentemente el uso de sus APIs. Esta sección contiene los textos formales que podés presentar.
          </p>
        </div>

        {/* Legal navigation bar */}
        <div className="flex border-b border-slate-800">
          <button 
            onClick={() => setActiveLegalTab("history")}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 uppercase ${activeLegalTab === "history" ? "border-indigo-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}
          >
            Historia de Google
          </button>
          <button 
            onClick={() => setActiveLegalTab("privacy")}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 uppercase ${activeLegalTab === "privacy" ? "border-indigo-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}
          >
            Política de Privacidad
          </button>
          <button 
            onClick={() => setActiveLegalTab("terms")}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 uppercase ${activeLegalTab === "terms" ? "border-indigo-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}
          >
            Términos del Servicio
          </button>
        </div>

        {/* Legal content panels */}
        <div className="bg-slate-950/40 border border-slate-800/80 p-6 rounded-2xl text-xs text-slate-300 leading-relaxed space-y-4 max-h-96 overflow-y-auto">
          
          {activeLegalTab === "history" && (
            <div className="space-y-6 font-sans p-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded uppercase font-mono">Fragmento de la Semana</span>
                  <span className="text-slate-500 text-[10px] font-mono">Julio 2026</span>
                </div>
                <h4 className="text-sm font-bold text-white">Larry, Sergey y el Garaje de Stanford (1998)</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Google se originó en enero de 1996 como un proyecto de investigación de Larry Page y Sergey Brin, estudiantes de posgrado en Ciencias de la Computación en la Universidad de Stanford. Su idea era revolucionaria: en lugar de contar palabras clave como otros buscadores, diseñaron un algoritmo llamado <strong className="text-indigo-400">PageRank</strong> que analizaba la relación y relevancia de las páginas web midiendo la cantidad y calidad de los enlaces que apuntaban a ellas.
                </p>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Oficialmente constituida el 4 de septiembre de 1998, la primera oficina de la compañía fue el garaje de una amiga común (Susan Wojcicki, quien más tarde sería CEO de YouTube) en Menlo Park, California. Su misión fundacional sigue vigente hoy: <strong className="text-emerald-400">"Organizar la información del mundo para que sea universalmente accesible y útil"</strong>.
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-800/60 pt-4">
                <h4 className="text-sm font-bold text-white">El Impacto Social de la Nube Comunitaria</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Lo que comenzó como una caja de búsqueda minimalista evolucionó hasta convertirse en un ecosistema cognitivo y operativo global. Google Workspace (incluyendo Google Drive y Sheets) revolucionó la productividad al permitir que cualquier persona, sin importar sus recursos o conocimientos técnicos de servidores, acceda de forma totalmente gratuita a herramientas de almacenamiento, procesamiento y colaboración en tiempo real con estándares de seguridad militares.
                </p>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Esta democratización tecnológica permite que pequeños comerciantes locales colaboren, automaticen y sincronicen su negocio a escala mundial, fomentando el desarrollo de la economía local y reforzando los lazos comunitarios gracias al tiempo libre recuperado.
                </p>
              </div>
            </div>
          )}

          {activeLegalTab === "privacy" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">POLÍTICA DE PRIVACIDAD DE SMART COMMERCE</h3>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Última actualización: Julio de 2026</p>
              
              <p>
                En Smart Commerce, accesible desde este dominio, una de nuestras principales prioridades es la privacidad de nuestros visitantes y usuarios. Este documento de Política de Privacidad contiene tipos de información que son recopilados y registrados por Smart Commerce y cómo los utilizamos.
              </p>

              <h4 className="font-bold text-white mt-4">1. Uso de Datos de Google (Google User Data)</h4>
              <p>
                Smart Commerce utiliza las APIs de Google Drive únicamente con el consentimiento expreso del usuario para leer y organizar archivos dentro de la carpeta designada del sistema (<code className="bg-slate-900 px-1 py-0.5 text-indigo-400 rounded">"Martin Sistema"</code>). 
              </p>
              <p>
                <strong>No vendemos, comercializamos ni transferimos</strong> sus datos de usuario de Google a terceros. Toda la información extraída es procesada localmente y enviada a los modelos integrados de inteligencia artificial (Gemini API) únicamente con propósitos analíticos internos que el usuario solicita de manera explícita.
              </p>

              <h4 className="font-bold text-white mt-4">2. Retención de Datos</h4>
              <p>
                Los tokens de acceso y credenciales se almacenan de manera local y encriptada en la base de datos de autenticación del sistema (Firebase Authentication). El usuario puede desconectar su cuenta de Google en cualquier momento haciendo clic en el botón "Cerrar Sesión".
              </p>

              <h4 className="font-bold text-white mt-4">3. Seguridad de la Información</h4>
              <p>
                Implementamos medidas de seguridad estándar de la industria, incluyendo protocolos de encriptación HTTPS/SSL, para salvaguardar la transferencia y almacenamiento de la información.
              </p>
            </div>
          )}

          {activeLegalTab === "terms" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">TÉRMINOS Y CONDICIONES DE USO</h3>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Última actualización: Julio de 2026</p>

              <p>
                Bienvenido a Smart Commerce. Al acceder y utilizar este servicio, usted acepta cumplir con los siguientes términos y condiciones:
              </p>

              <h4 className="font-bold text-white mt-4">1. Propósito de la Plataforma</h4>
              <p>
                Smart Commerce proporciona servicios analíticos basados en Inteligencia Artificial ("Martín") mediante la lectura automatizada de archivos que el usuario deposita voluntariamente en su cuenta de Google Drive sincronizada.
              </p>

              <h4 className="font-bold text-white mt-4">2. Responsabilidad del Usuario</h4>
              <p>
                Usted es responsable de mantener la seguridad de sus credenciales de Google y su sesión activa. No asumimos responsabilidad por pérdidas financieras u operativas ocasionadas por accesos no autorizados a su cuenta local.
              </p>

              <h4 className="font-bold text-white mt-4">3. Limitación de Responsabilidad</h4>
              <p>
                Los reportes generados por Martín IA son estimaciones analíticas inteligentes basadas en los datos suministrados por el usuario. No constituyen asesoría financiera formal ni garantías de rentabilidad. El usuario es el tomador final de las decisiones operacionales de su comercio.
              </p>
            </div>
          )}

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-slate-800/60 text-center space-y-4">
        <p className="text-xs text-slate-500">
          Smart Commerce © 2026. Todos los derechos reservados.
        </p>
        <p className="text-[10px] text-slate-600 flex items-center justify-center gap-1">
          <span>Creado con</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
          <span>para potenciar el desarrollo humano y la tecnología integrada.</span>
        </p>
      </footer>
    </div>
  );
}
