import { Component } from 'react';

const RetryIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
);

const AlertIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(_error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #08090d 0%, #0f1219 100%)',
                    color: '#fff',
                    padding: '20px',
                    textAlign: 'center',
                    fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
                }}>
                    <div style={{ marginBottom: '24px' }}>
                        <AlertIcon />
                    </div>

                    <h2 style={{
                        margin: '0 0 12px 0',
                        fontSize: '22px',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                    }}>
                        Something went wrong
                    </h2>

                    <p style={{
                        margin: '0 0 28px 0',
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '14px',
                        maxWidth: '320px',
                        lineHeight: 1.5,
                    }}>
                        We encountered an unexpected error. Please try again, or restart the app if the problem persists.
                    </p>

                    {this.state.error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            marginBottom: '24px',
                            maxWidth: '400px',
                            fontSize: '12px',
                            color: 'rgba(255,255,255,0.6)',
                            fontFamily: 'monospace',
                            overflow: 'auto',
                            maxHeight: '100px',
                        }}>
                            {this.state.error.toString()}
                        </div>
                    )}

                    <button
                        onClick={this.handleRetry}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '14px 28px',
                            background: 'linear-gradient(135deg, #4f7dff 0%, #7b6cff 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '16px',
                            fontSize: '15px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 24px rgba(79,125,255,0.35)',
                            transition: 'transform 0.2s, opacity 0.2s',
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        <RetryIcon />
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
