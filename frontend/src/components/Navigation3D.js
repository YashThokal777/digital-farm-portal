import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';
import '../styles/GlobalTheme.css';

const Navigation3D = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef();
  const mobileMenuRef = useRef();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Navigation entrance animation
    gsap.fromTo(navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActiveDropdown(null);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  useEffect(() => {
    if (isMobileMenuOpen && mobileMenuRef.current) {
      gsap.fromTo(mobileMenuRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [isMobileMenuOpen]);

  const menuItems = [
    {
      title: '🏠 Dashboard',
      path: '/dashboard',
      roles: ['system_admin', 'farm_owner', 'farm_manager', 'farm_worker']
    },
    {
      title: '🚜 Farm Management',
      roles: ['system_admin', 'farm_owner', 'farm_manager'],
      submenu: [
        { title: 'Farms Overview', path: '/farms' },
        { title: 'Portfolio', path: '/portfolio' }
      ]
    },
    {
      title: '🐄 Animals',
      roles: ['system_admin', 'farm_owner', 'farm_manager', 'farm_worker'],
      submenu: [
        { title: 'Animal Records', path: '/animals' },
        { title: 'Health Tracking', path: '/health' }
      ]
    },
    {
      title: '🦠 Biosecurity',
      path: '/biosecurity',
      roles: ['system_admin', 'farm_owner', 'farm_manager', 'farm_worker']
    },
    {
      title: '📦 Inventory',
      path: '/inventory',
      roles: ['system_admin', 'farm_owner', 'farm_manager']
    },
    {
      title: '📊 Reports',
      path: '/reports',
      roles: ['system_admin', 'farm_owner', 'farm_manager']
    },
    {
      title: '⚖️ Compliance',
      path: '/compliance',
      roles: ['system_admin', 'farm_owner', 'farm_manager']
    }
  ];

  const quickActions = [
    { title: '⚡ Quick Entry', path: '/quick-entry' },
    { title: '📋 My Tasks', path: '/my-tasks' }
  ];

  const hasAccess = (roles) => {
    return roles.includes(user?.role);
  };

  return (
    <nav ref={navRef} className={`nav-3d ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container-3d">
        <div className="nav-content-3d">
          {/* Logo */}
          <Link to="/dashboard" className="nav-logo-3d">
            <span className="logo-icon-3d">🌾</span>
            <span className="logo-text-3d">Farm Portal</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle-3d"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            <span className={`hamburger-line-3d ${isMobileMenuOpen ? 'active' : ''}`}></span>
            <span className={`hamburger-line-3d ${isMobileMenuOpen ? 'active' : ''}`}></span>
            <span className={`hamburger-line-3d ${isMobileMenuOpen ? 'active' : ''}`}></span>
          </button>

          {/* Desktop Navigation */}
          <div className="nav-menu-3d desktop-only">
            {menuItems.map((item, index) => {
              if (!hasAccess(item.roles)) return null;

              if (item.submenu) {
                return (
                  <div
                    key={index}
                    className="nav-dropdown-3d"
                    onMouseEnter={() => setActiveDropdown(index)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button className="nav-item-3d nav-dropdown-trigger-3d">
                      {item.title}
                      <span className="dropdown-arrow-3d">▼</span>
                    </button>
                    <div className={`nav-dropdown-menu-3d ${activeDropdown === index ? 'active' : ''}`}>
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          className={`nav-dropdown-item-3d ${location.pathname === subItem.path ? 'active' : ''}`}
                          onClick={closeMobileMenu}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`nav-item-3d ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  {item.title}
                </Link>
              );
            })}
          </div>

          {/* Desktop User Menu */}
          <div className="nav-actions-3d desktop-only">
            <div className="user-menu-3d">
              <div className="user-info-3d">
                <div className="user-avatar-3d">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="user-details-3d">
                  <span className="user-name-3d">{user?.username}</span>
                  <span className="user-role-3d">{user?.role?.replace('_', ' ')}</span>
                </div>
              </div>
              
              <div className="user-actions-3d">
                <Link to="/profile" className="btn-3d btn-secondary-3d btn-sm-3d">
                  👤
                </Link>
                <button onClick={handleLogout} className="btn-3d btn-danger-3d btn-sm-3d">
                  🚪
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay-3d" onClick={closeMobileMenu}>
          <div 
            ref={mobileMenuRef}
            className="mobile-menu-3d"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile User Info */}
            <div className="mobile-user-info-3d">
              <div className="user-avatar-3d">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="mobile-user-details-3d">
                <span className="user-name-3d">{user?.username}</span>
                <span className="user-role-3d">{user?.role?.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Mobile Navigation Items */}
            <div className="mobile-nav-items-3d">
              {menuItems.map((item, index) => {
                if (!hasAccess(item.roles)) return null;

                if (item.submenu) {
                  return (
                    <div key={index} className="mobile-nav-group-3d">
                      <div className="mobile-nav-header-3d">{item.title}</div>
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          className={`mobile-nav-item-3d ${location.pathname === subItem.path ? 'active' : ''}`}
                          onClick={closeMobileMenu}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  );
                }

                return (
                  <Link
                    key={index}
                    to={item.path}
                    className={`mobile-nav-item-3d ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={closeMobileMenu}
                  >
                    {item.title}
                  </Link>
                );
              })}

              {/* Quick Actions in Mobile */}
              <div className="mobile-nav-group-3d">
                <div className="mobile-nav-header-3d">⚡ Quick Actions</div>
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.path}
                    className={`mobile-nav-item-3d ${location.pathname === action.path ? 'active' : ''}`}
                    onClick={closeMobileMenu}
                  >
                    {action.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="mobile-actions-3d">
              <Link to="/profile" className="btn-3d btn-secondary-3d" onClick={closeMobileMenu}>
                👤 Profile
              </Link>
              <button onClick={handleLogout} className="btn-3d btn-danger-3d">
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation3D;
