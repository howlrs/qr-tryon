'use client';

import { createContext, useCallback, useState, type ReactNode } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
}

export interface ToastContextValue {
    toast: (message: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 4000;

const iconMap = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const styleMap = {
    success: 'border-green-400 bg-green-50 text-green-800',
    error: 'border-red-400 bg-red-50 text-red-800',
    warning: 'border-yellow-400 bg-yellow-50 text-yellow-800',
    info: 'border-blue-400 bg-blue-50 text-blue-800',
};

const iconColorMap = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = useCallback((message: string, type: ToastType = 'info') => {
        const id = crypto.randomUUID();
        setToasts(prev => {
            const next = [...prev, { id, type, message }];
            // Keep only the latest MAX_TOASTS
            return next.slice(-MAX_TOASTS);
        });

        setTimeout(() => {
            removeToast(id);
        }, AUTO_DISMISS_MS);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            {/* Toast container */}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => {
                    const Icon = iconMap[t.type];
                    return (
                        <div
                            key={t.id}
                            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-sm min-w-[300px] max-w-[420px] animate-slide-in-right ${styleMap[t.type]}`}
                        >
                            <Icon size={20} className={`mt-0.5 shrink-0 ${iconColorMap[t.type]}`} />
                            <p className="flex-1 text-sm font-medium">{t.message}</p>
                            <button
                                onClick={() => removeToast(t.id)}
                                className="shrink-0 p-0.5 rounded hover:bg-black/10 transition-colors"
                                aria-label="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}
