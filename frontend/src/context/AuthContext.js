import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Configure axios defaults
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Verify token on app load
    useEffect(() => {
        const verifyToken = async () => {
            if (token) {
                try {
                    const response = await axios.get('/auth/verify');
                    setUser(response.data.user);
                } catch (error) {
                    console.error('Token verification failed:', error);
                    // Clear local session without server call to avoid infinite loop
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                    delete axios.defaults.headers.common['Authorization'];
                }
            }
            setLoading(false);
        };

        verifyToken();
    }, [token]); // logout dependency removed to prevent infinite loop

    const login = async (username, password) => {
        try {
            const response = await axios.post('/auth/login', {
                username,
                password
            });

            const { token: newToken, user: userData } = response.data;
            
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(userData);
            
            return { success: true, user: userData };
        } catch (error) {
            const message = error.response?.data?.error || 'Login failed';
            return { success: false, error: message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('/auth/register', userData);
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.error || 'Registration failed';
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        try {
            // Only attempt server logout if we have a token and server is reachable
            if (token) {
                await axios.post('/auth/logout');
            }
        } catch (error) {
            // Silently handle logout errors - server might be down
            // We still want to clear local session
            console.warn('Server logout failed, clearing local session:', error.message);
        } finally {
            // Always clear local session regardless of server response
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await axios.put('/auth/profile', profileData);
            // Refresh user data
            const userResponse = await axios.get('/auth/profile');
            setUser(userResponse.data.user);
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.error || 'Profile update failed';
            return { success: false, error: message };
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            const response = await axios.put('/auth/change-password', {
                current_password: currentPassword,
                new_password: newPassword
            });
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.error || 'Password change failed';
            return { success: false, error: message };
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'system_admin',
        isOwner: user?.role === 'farm_owner',
        isManager: user?.role === 'farm_manager',
        isWorker: user?.role === 'farm_worker'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
