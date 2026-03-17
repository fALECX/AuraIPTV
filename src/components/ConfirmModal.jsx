export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, danger = false }) {
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
                {title && <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: 'rgba(255,255,255,0.96)' }}>{title}</h3>}
                {message && <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: '28px' }}>{message}</p>}
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
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1, padding: '14px', borderRadius: '14px',
                            background: danger ? 'rgba(239,68,68,0.2)' : 'var(--accent, #4f7dff)',
                            border: danger ? '1px solid rgba(239,68,68,0.4)' : 'none',
                            color: danger ? '#ef4444' : '#fff',
                            fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                        }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
