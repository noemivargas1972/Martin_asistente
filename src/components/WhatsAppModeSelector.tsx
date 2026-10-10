import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Globe,
  Layers,
  Copy,
  Check,
  Sparkles,
  Info
} from 'lucide-react';
import {
  WhatsAppLaunchMode,
  getSavedWhatsAppMode,
  saveWhatsAppMode,
  getSavedAutoCopy,
  saveAutoCopy
} from '../lib/whatsappSender';

interface WhatsAppModeSelectorProps {
  compact?: boolean;
  onModeChange?: (mode: WhatsAppLaunchMode) => void;
}

export const WhatsAppModeSelector: React.FC<WhatsAppModeSelectorProps> = ({
  compact = false,
  onModeChange
}) => {
  const [currentMode, setCurrentMode] = useState<WhatsAppLaunchMode>('app');
  const [autoCopy, setAutoCopy] = useState<boolean>(true);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    setCurrentMode(getSavedWhatsAppMode());
    setAutoCopy(getSavedAutoCopy());
  }, []);

  const handleSelectMode = (mode: WhatsAppLaunchMode) => {
    setCurrentMode(mode);
    saveWhatsAppMode(mode);
    if (onModeChange) onModeChange(mode);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleToggleAutoCopy = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAutoCopy(checked);
    saveAutoCopy(checked);
  };

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-900/90 text-white rounded-2xl border border-indigo-500/30 text-xs">
        <div className="flex items-center gap-1.5 px-2 text-emerald-400 font-bold">
          <Smartphone className="w-3.5 h-3.5" />
          <span>WhatsApp:</span>
        </div>

        <div className="flex bg-slate-800 rounded-xl p-0.5 border border-slate-700">
          <button
            type="button"
            onClick={() => handleSelectMode('app')}
            className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
              currentMode === 'app'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Abre directo en tu aplicación de WhatsApp ya abierta sin generar pestañas nuevas"
          >
            <span>📱 En mi App (Directo)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode('web')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
              currentMode === 'web'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Usa una única pestaña compartida en WhatsApp Web"
          >
            <span>🌐 Web (1 sola pestaña)</span>
          </button>
        </div>

        {savedFeedback && (
          <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1 animate-pulse px-1">
            <Check className="w-3 h-3" /> Configurado
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white rounded-3xl border border-indigo-500/40 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase font-mono tracking-wider">
              Control de Conexión WhatsApp
            </span>
            {savedFeedback && (
              <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 rounded-full text-[10px] font-extrabold flex items-center gap-1 animate-bounce">
                <Check className="w-3 h-3" /> Guardado
              </span>
            )}
          </div>
          <h4 className="text-base font-extrabold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            ¿Cómo querés enviar los mensajes de WhatsApp?
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Solución definitiva para evitar que se abran pestañas infinitas en tu navegador al contactar clientes o sucursales:
          </p>
        </div>
      </div>

      {/* Mode Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Option 1: App Native */}
        <div
          onClick={() => handleSelectMode('app')}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
            currentMode === 'app'
              ? 'bg-emerald-950/70 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-500/20'
              : 'bg-slate-850/60 border-slate-700/80 text-slate-300 hover:border-slate-500'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${currentMode === 'app' ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-700 text-slate-300'}`}>
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-extrabold text-sm text-white">Directo en mi App de WhatsApp</h5>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">✨ Recomendado para WhatsApp Escritorio o Celular</span>
              </div>
            </div>
            {currentMode === 'app' && (
              <span className="p-1 bg-emerald-400 text-slate-950 rounded-full">
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-normal">
            Envía directamente a tu <strong>aplicación de WhatsApp ya abierta</strong> (WhatsApp Desktop o app móvil). <strong className="text-emerald-300 font-bold">No abre ninguna pestaña nueva en el navegador</strong>.
          </p>
        </div>

        {/* Option 2: WhatsApp Web Single Tab */}
        <div
          onClick={() => handleSelectMode('web')}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
            currentMode === 'web'
              ? 'bg-emerald-950/70 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-500/20'
              : 'bg-slate-850/60 border-slate-700/80 text-slate-300 hover:border-slate-500'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${currentMode === 'web' ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-700 text-slate-300'}`}>
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-extrabold text-sm text-white">WhatsApp Web (Pestaña Única)</h5>
                <span className="text-[10px] text-indigo-300 font-mono font-bold">🌐 Reutiliza la misma pestaña</span>
              </div>
            </div>
            {currentMode === 'web' && (
              <span className="p-1 bg-emerald-400 text-slate-950 rounded-full">
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-normal">
            Abre WhatsApp Web pero <strong className="text-emerald-300 font-bold">reutiliza siempre la misma pestaña</strong>. Si enviás 10 mensajes, no se acumulan 10 pestañas: se usa la misma ventana.
          </p>
        </div>
      </div>

      {/* Auto Copy checkbox */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
        <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoCopy}
            onChange={handleToggleAutoCopy}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-800 border-slate-700"
          />
          <span>
            📋 <strong>Copiar texto al portapapeles automáticamente</strong> al presionar enviar (para pegar si hiciera falta).
          </span>
        </label>
      </div>
    </div>
  );
};
