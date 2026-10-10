import React from "react";
import {
  Smartphone,
  PhoneCall,
  MessageSquare,
  Building2,
  Delete,
  Sparkles
} from "lucide-react";

interface MartinDialerSectionProps {
  dialedNumber: string;
  setDialedNumber: (val: string) => void;
  dialedName: string;
  setDialedName: (val: string) => void;
  handleDialDigit: (digit: string) => void;
  handleDialBackspace: () => void;
  handleStartOutgoingCall: (phone?: string, name?: string) => void;
  handleOpenDirectWhatsApp: (phone?: string) => void;
  handleSelectPreset: (preset: { id: string; name: string; phone: string; manager: string }) => void;
  localPresets: Array<{ id: string; name: string; phone: string; manager: string }>;
}

export const MartinDialerSection: React.FC<MartinDialerSectionProps> = ({
  dialedNumber,
  setDialedNumber,
  dialedName,
  setDialedName,
  handleDialDigit,
  handleDialBackspace,
  handleStartOutgoingCall,
  handleOpenDirectWhatsApp,
  handleSelectPreset,
  localPresets
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 5 Cols: Interactive Dialpad for ANY Number */}
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Marcador Telefónico</h3>
                <p className="text-xs text-slate-500">Llamar a cualquier número externo</p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Sin Agendar
            </span>
          </div>

          {/* Display Screen for Dialed Number */}
          <div className="pt-2">
            <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-inner flex flex-col justify-between min-h-[76px]">
              <span className="text-[11px] text-slate-400 font-mono font-bold truncate">
                {dialedName ? `Destino: ${dialedName}` : "Ingresar número con código de país/área"}
              </span>
              <div className="flex items-center justify-between gap-2 pt-1">
                <input
                  type="text"
                  value={dialedNumber}
                  onChange={(e) => {
                    setDialedNumber(e.target.value);
                    setDialedName("");
                  }}
                  placeholder="+54 9 11 ..."
                  className="bg-transparent text-xl md:text-2xl font-mono font-black text-emerald-400 tracking-wider w-full focus:outline-none placeholder:text-slate-600"
                />
                {dialedNumber && (
                  <button
                    onClick={handleDialBackspace}
                    className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Borrar"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Numeric Keypad Grid */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "0", "#"].map((btn) => (
            <button
              key={btn}
              onClick={() => handleDialDigit(btn)}
              className="py-3 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-800 hover:text-indigo-700 font-mono font-black text-lg rounded-2xl border border-slate-200 shadow-sm transition-all cursor-pointer active:scale-95 flex items-center justify-center"
            >
              {btn}
            </button>
          ))}
        </div>

        {/* Call and WhatsApp Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => handleStartOutgoingCall()}
            disabled={!dialedNumber.trim()}
            className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-extrabold text-xs md:text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <PhoneCall className="w-4 h-4" />
            <span>📞 Llamar Ahora</span>
          </button>

          <button
            onClick={() => handleOpenDirectWhatsApp()}
            disabled={!dialedNumber.trim()}
            className="py-3.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-extrabold text-xs md:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>💬 Enviar WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Right 7 Cols: Quick Presets (Locales 1 to 10 + Depósito + Proveedores) */}
      <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Directorio de la Red Comercial</h3>
              <p className="text-xs text-slate-500">Marcación rápida a locales y sucursales</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400">12 Destinos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
          {localPresets.map((preset) => (
            <div
              key={preset.id}
              className="p-3 bg-slate-50 hover:bg-indigo-50/60 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all flex items-center justify-between gap-2"
            >
              <div 
                className="space-y-0.5 cursor-pointer flex-1 min-w-0"
                onClick={() => handleSelectPreset(preset)}
              >
                <p className="text-xs font-extrabold text-slate-800 truncate">{preset.name}</p>
                <p className="text-[11px] font-mono text-indigo-700 font-bold">{preset.phone}</p>
                <p className="text-[10px] text-slate-500 truncate">{preset.manager}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleStartOutgoingCall(preset.phone, preset.name)}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm transition-all cursor-pointer"
                  title={`Llamar a ${preset.name}`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleOpenDirectWhatsApp(preset.phone)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl shadow-sm transition-all cursor-pointer"
                  title={`Enviar WhatsApp a ${preset.name}`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex items-center justify-between text-xs text-indigo-900 font-medium">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            Martín realiza las llamadas usando voz masculina ejecutiva y el motor conversacional Gemini en tiempo real.
          </span>
        </div>
      </div>
    </div>
  );
};
