import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const getRoleBasedMenuItems = () => {
        if (!user) return [];

        const commonItems = [
            { path: '/dashboard', label: 'Dashboard', icon: '📊' }
        ];

        const roleSpecificItems = {
            system_admin: [
                { path: '/users', label: 'User Management', icon: '👥' },
                { path: '/farms', label: 'All Farms', icon: '🏢' },
                { path: '/analytics', label: 'System Analytics', icon: '📈' },
                { path: '/audit', label: 'Audit Logs', icon: '📋' }
            ],
            farm_owner: [
                { path: '/farms', label: 'My Farms', icon: '🏢' },
                { path: '/portfolio', label: 'Portfolio', icon: '💼' },
                { path: '/compliance', label: 'Compliance', icon: '✅' },
                { path: '/reports', label: 'Reports', icon: '📊' }
            ],
            farm_manager: [
                { path: '/farms', label: 'Assigned Farms', icon: '🏢' },
                { path: '/animals', label: 'Animals', icon: '🐄' },
                { path: '/health', label: 'Health Records', icon: '🏥' },
                { path: '/biosecurity', label: 'Biosecurity', icon: '🛡️' },
                { path: '/inventory', label: 'Inventory', icon: '📦' },
                { path: '/tasks', label: 'Tasks', icon: '✓' }
            ],
            farm_worker: [
                { path: '/my-tasks', label: 'My Tasks', icon: '✓' },
                { path: '/animals', label: 'Animals', icon: '🐄' },
                { path: '/biosecurity', label: 'Biosecurity', icon: '🛡️' },
                { path: '/quick-entry', label: 'Quick Entry', icon: '⚡' }
            ]
        };

        return [...commonItems, ...(roleSpecificItems[user.role] || [])];
    };

    const menuItems = getRoleBasedMenuItems();

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/dashboard" className="nav-logo">
                    🌾 Digital Farm Portal
                </Link>

                <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className="nav-link"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </div>

                <div className="nav-user">
                    <div className="user-info">
                        <span className="user-name">
                            {user?.first_name} {user?.last_name}
                        </span>
                        <span className="user-role">
                            {user?.role?.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                    <div className="user-actions">
                        <Link to="/profile" className="nav-link">
                            Profile
                        </Link>
                        <button onClick={handleLogout} className="logout-btn">
                            Logout
                        </button>
                    </div>
                </div>

                <div className="nav-toggle" onClick={toggleMenu}>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
