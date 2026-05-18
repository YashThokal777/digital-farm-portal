import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading">
                <div>Loading...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        return (
            <div className="container mt-20">
                <div className="alert alert-error">
                    <h3>Access Denied</h3>
                    <p>You don't have permission to access this page.</p>
                    <p>Required roles: {requiredRoles.join(', ')}</p>
                    <p>Your role: {user.role}</p>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
