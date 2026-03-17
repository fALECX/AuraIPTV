import { useState, useEffect, useCallback } from 'react';

// Global toast emitter
let _addToast = null;
export const toast = {
    show: (message, type = 'info', duration = 3000) => {
        if (_addToast) _addToast({ message, type, duration, id: Date.now() + Math.random() });
    },
    success: (message, duration) => toast.show(message, 'success', duration),
    error: (message, duration) => toast.show(message, 'error', duration),
    info: (message, duration) => toast.show(message, 'info', duration),
};

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const ErrorIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);
const InfoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

function ToastItem({ toast: t, onRemove }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        const enterTimer = setTimeout(() => setVisible(true), 10);
        // Schedule removal
        const removeTimer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onRemove(t.id), 300);
        }, t.duration);
        return () => { clearTimeout(enterTimer); clearTimeout(removeTimer); };
    }, [t.id, t.duration, onRemove]);

    const colors = {
        success: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', icon: '#10b981' },
        error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', icon: '#ef4444' },
        info: { bg: 'rgba(79, 125, 255, 0.15)', border: 'rgba(79, 125, 255, 0.3)', icon: '#4f7dff' },
    };
    const c = colors[t.type] || colors.info;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '14px',
            background: c.bg,
            border: `1px solid ${c.border}`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: 'rgba(255,255,255,0.92)',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
            opacity: visible ? 1 : 0,
            transition: 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.28s ease',
            maxWidth: '320px',
            wordBreak: 'break-word',
            cursor: 'pointer',
            userSelect: 'none',
        }} onClick={() => { setVisible(false); setTimeout(() => onRemove(t.id), 300); }}>
            <span style={{ color: c.icon, flexShrink: 0 }}>
                {t.type === 'success' ? <CheckIcon /> : t.type === 'error' ? <ErrorIcon /> : <InfoIcon />}
            </span>
            {t.message}
        </div>
    );
}

export function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((t) => {
        setToasts(prev => [...prev.slice(-4), t]); // max 5 toasts
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Register the global emitter
    useEffect(() => {
        _addToast = addToast;
        return () => { _addToast = null; };
    }, [addToast]);

    if (toasts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '90px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 9999,
            pointerEvents: 'none',
            alignItems: 'center',
        }}>
            {toasts.map(t => (
                <div key={t.id} style={{ pointerEvents: 'auto' }}>
                    <ToastItem toast={t} onRemove={removeToast} />
                </div>
            ))}
        </div>
    );
}
