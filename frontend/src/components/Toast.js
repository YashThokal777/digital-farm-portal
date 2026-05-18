import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getToastStyle = () => {
        const baseStyle = {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '6px',
            color: 'white',
            fontWeight: '500',
            fontSize: '14px',
            zIndex: 1000,
            minWidth: '250px',
            maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateX(0)' : 'translateX(100%)'
        };

        const typeStyles = {
            success: { backgroundColor: '#27ae60' },
            error: { backgroundColor: '#e74c3c' },
            warning: { backgroundColor: '#f39c12' },
            info: { backgroundColor: '#3498db' }
        };

        return { ...baseStyle, ...typeStyles[type] };
    };

    const getIcon = () => {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type];
    };

    return (
        <div style={getToastStyle()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{getIcon()}</span>
                <span>{message}</span>
                <button
                    onClick={() => {
                        setVisible(false);
                        setTimeout(onClose, 300);
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '16px',
                        cursor: 'pointer',
                        marginLeft: 'auto',
                        padding: '0 4px'
                    }}
                >
                    ×
                </button>
            </div>
        </div>
    );
};

// Toast Manager Hook
export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 3000) => {
        const id = Date.now();
        const toast = { id, message, type, duration };
        setToasts(prev => [...prev, toast]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const ToastContainer = () => (
        <div>
            {toasts.map((toast, index) => (
                <div key={toast.id} style={{ top: `${20 + index * 70}px` }}>
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() => removeToast(toast.id)}
                    />
                </div>
            ))}
        </div>
    );

    return { addToast, ToastContainer };
};

export default Toast;
