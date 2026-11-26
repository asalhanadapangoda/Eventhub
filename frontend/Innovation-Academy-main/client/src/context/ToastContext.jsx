import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

// Imperative handler for external calls: import { toast } from './ToastContext';
let globalToastHandler = {
  success: (msg) => console.log(msg),
  error: (msg) => console.error(msg),
  info: (msg) => console.log(msg),
  warning: (msg) => console.warn(msg),
};

export const toast = {
  success: (msg, duration) => globalToastHandler.success(msg, duration),
  error: (msg, duration) => globalToastHandler.error(msg, duration),
  info: (msg, duration) => globalToastHandler.info(msg, duration),
  warning: (msg, duration) => globalToastHandler.warning(msg, duration),
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    if (!message) return;
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, message, type, duration };

    setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep up to 5 toasts

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toastMethods = {
    success: (msg, duration = 4000) => addToast(msg, 'success', duration),
    error: (msg, duration = 4500) => addToast(msg, 'error', duration),
    info: (msg, duration = 4000) => addToast(msg, 'info', duration),
    warning: (msg, duration = 4000) => addToast(msg, 'warning', duration),
    remove: removeToast,
  };

  useEffect(() => {
    globalToastHandler = toastMethods;
  }, [addToast, removeToast]);

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}

      {/* Floating Toast Notification Container (Top Right) */}
      <div
        aria-live="polite"
        className="fixed top-5 right-5 sm:right-6 z-[99999] flex flex-col gap-2.5 pointer-events-none max-w-sm sm:max-w-md w-[calc(100%-2.5rem)]"
      >
        {toasts.map((t) => {
          let icon = <Info className="w-5 h-5 text-blue-600 shrink-0" />;
          let bgClass = 'bg-white border-blue-200 text-slate-800';
          let accentBarClass = 'bg-blue-600';
          let badgeText = 'Notice';

          if (t.type === 'success') {
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
            bgClass = 'bg-white border-emerald-200 text-slate-800';
            accentBarClass = 'bg-emerald-600';
            badgeText = 'Success';
          } else if (t.type === 'error') {
            icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
            bgClass = 'bg-white border-rose-200 text-slate-800';
            accentBarClass = 'bg-rose-600';
            badgeText = 'Error';
          } else if (t.type === 'warning') {
            icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
            bgClass = 'bg-white border-amber-200 text-slate-800';
            accentBarClass = 'bg-amber-500';
            badgeText = 'Attention';
          }

          return (
            <div
              key={t.id}
              role="alert"
              className={`pointer-events-auto w-full rounded-2xl border shadow-xl p-4 flex items-start justify-between gap-3 transition-all duration-300 transform translate-y-0 opacity-100 relative overflow-hidden backdrop-blur-md ${bgClass}`}
              style={{
                animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="mt-0.5">{icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                      {badgeText}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug break-words mt-0.5">
                    {t.message}
                  </p>
                </div>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Progress Bar Animation */}
              {t.duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
                  <div
                    className={`h-full ${accentBarClass}`}
                    style={{
                      animation: `shrinkWidth ${t.duration}ms linear forwards`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return toast; // Fallback to imperative toast if outside provider
  }
  return context;
}

