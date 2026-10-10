import React from "react";
import { X } from "lucide-react";
import { motion } from "motion/react";
import MartinStockRedistributionAgent from "./MartinStockRedistributionAgent";

interface RedistribucionStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToMartinChat: (promptText: string) => void;
}

export default function RedistribucionStockModal({
  isOpen,
  onClose,
  onSendToMartinChat
}: RedistribucionStockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-slate-900 border border-indigo-500/40 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden text-white"
      >
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              Módulo Especializado: Análisis Rico & Redistribución de Stock
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Full Agent */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 custom-scrollbar">
          <MartinStockRedistributionAgent onSendToMartinChat={onSendToMartinChat} />
        </div>
      </motion.div>
    </div>
  );
}
