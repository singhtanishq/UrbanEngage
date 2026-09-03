import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import './ToastContext.css';

const ToastContext = createContext(null);

const ICONS = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
};

let nextId = 1;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const timers = useRef(new Map());

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        const timer = timers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timers.current.delete(id);
        }
    }, []);

    const push = useCallback((type, message, { duration = 4200 } = {}) => {
        const id = nextId++;
        setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
        timers.current.set(id, setTimeout(() => dismiss(id), duration));
    }, [dismiss]);

    const value = useMemo(() => ({
        success: (msg, opts) => push('success', msg, opts),
        error: (msg, opts) => push('error', msg, opts),
        info: (msg, opts) => push('info', msg, opts),
    }), [push]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="toast-stack" role="status" aria-live="polite">
                {toasts.map(({ id, type, message }) => {
                    const Icon = ICONS[type] || Info;
                    return (
                        <div key={id} className={`toast toast--${type}`}>
                            <Icon size={19} className="toast__icon" />
                            <span className="toast__message">{message}</span>
                            <button
                                type="button"
                                className="toast__close"
                                onClick={() => dismiss(id)}
                                aria-label="Dismiss notification"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
    return ctx;
};
