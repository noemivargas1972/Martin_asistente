import React, { Component, ErrorInfo, ReactNode } from "react";
import { ShieldCheck, RefreshCw, FileSpreadsheet } from "lucide-react";
import { loadFromLocalMemory, STORAGE_KEYS } from "../lib/localMemory";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  // Declare inherited Component members for TS with useDefineForClassFields: false
  declare props: Readonly<Props>;
  declare state: Readonly<State>;
  declare setState: Component<Props, State>["setState"];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Se capturó un error imprevisto:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const lastSafeState = loadFromLocalMemory<any>(STORAGE_KEYS.LAST_SAFE_STATE, null);

      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="max-w-xl w-full bg-slate-800/90 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center backdrop-blur-md">
            <div className="mx-auto w-16 h-16 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl flex items-center justify-center text-emerald-400 animate-pulse">
              <ShieldCheck className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold rounded-full uppercase tracking-wider">
                🛡️ Sistema de Protección de Memoria Local Activo
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Tu trabajo y edición están 100% a salvo
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Smart Commerce detectó una interrupción imprevista en la pantalla. Gracias a la memoria local automática de Martín, tus dictados, textos y planillas no se han perdido.
              </p>
            </div>

            {lastSafeState && (
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-indigo-800/60 text-left text-xs space-y-1">
                <div className="flex items-center gap-2 text-indigo-300 font-bold">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Último estado resguardado:</span>
                </div>
                <p className="text-slate-300">
                  Pantalla: <strong className="text-white">{lastSafeState.activeTab || "General"}</strong>
                </p>
                {lastSafeState.snapshotTime && (
                  <p className="text-slate-400 text-[11px]">
                    Guardado: {new Date(lastSafeState.snapshotTime).toLocaleTimeString("es-AR")} hs
                  </p>
                )}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Restaurar Pantalla y Continuar Editando</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Martín IA y Smart Commerce mantienen sincronizada la memoria en segundo plano.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
