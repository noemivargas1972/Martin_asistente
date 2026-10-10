import { StrictMode, useState, useEffect, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

function AppContainer({ children }: { children: ReactNode }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      // Ignore benign background errors like ResizeObserver or WebSocket
      if (
        event.message &&
        (event.message.includes('ResizeObserver') ||
         event.message.includes('Script error') ||
         event.message.includes('WebSocket') ||
         event.message.includes('vite'))
      ) {
        return;
      }
    };

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      if (
        event.reason &&
        (event.reason.toString().includes('WebSocket') ||
         event.reason.toString().includes('vite') ||
         event.reason.toString().includes('ResizeObserver'))
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-3 bg-indigo-600/20 rounded-2xl border border-indigo-500 text-indigo-400 font-bold text-sm">
          📦 Smart Commerce AI
        </div>
        <h2 className="text-xl font-bold">Panel de Aplicación</h2>
        <p className="text-sm text-slate-400 max-w-md">
          Ocurrió una actualización momentánea en el panel. Hacé clic abajo para restablecer la vista previa.
        </p>
        <button
          onClick={() => {
            setHasError(false);
            window.location.reload();
          }}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
        >
          🔄 Recargar Panel
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppContainer>
        <App />
      </AppContainer>
    </ErrorBoundary>
  </StrictMode>
);

