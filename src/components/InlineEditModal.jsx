import { useState, useEffect, useRef } from 'react';

export default function InlineEditModal({ title, initialValue = '', placeholder = '', onSave, onCancel }) {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef(null);

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 50);
    }, []);

    const handleSave = () => {
        if (value.trim()) onSave(value.trim());
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 5000,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}
            onClick={onCancel}
        >
            <div
                style={{
                    background: 'rgba(18, 20, 30, 0.98)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '24px 24px 0 0',
                    padding: '28px 24px 40px',
                    width: '100%',
                    maxWidth: '480px',
                    animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)', margin: '0 auto 24px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'rgba(255,255,255,0.9)' }}>{title}</h3>
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel(); }}
                    placeholder={placeholder}
                    style={{
                        width: '100%', padding: '14px 16px', borderRadius: '14px',
                        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                        color: 'rgba(255,255,255,0.96)', fontSize: '15px', outline: 'none',
                        fontFamily: 'inherit', marginBottom: '20px',
                    }}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1, padding: '14px', borderRadius: '14px',
                            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                            color: 'rgba(255,255,255,0.8)', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!value.trim()}
                        style={{
                            flex: 1, padding: '14px', borderRadius: '14px',
                            background: value.trim() ? 'var(--accent, #4f7dff)' : 'rgba(79,125,255,0.3)',
                            border: 'none', color: '#fff', fontSize: '15px', fontWeight: 600,
                            cursor: value.trim() ? 'pointer' : 'default', fontFamily: 'inherit',
                            transition: 'background 0.2s',
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
