import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
    const sizes = {
        small: '20px',
        medium: '40px',
        large: '60px'
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                width: sizes[size],
                height: sizes[size],
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '10px'
            }}></div>
            <p style={{ 
                color: '#666', 
                fontSize: '14px',
                margin: 0 
            }}>
                {message}
            </p>
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default LoadingSpinner;
