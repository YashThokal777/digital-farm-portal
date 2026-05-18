import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import ThreeScene from '../components/ThreeScene';
import '../styles/GlobalTheme.css';
import './LandingPage.css';

const LandingPage = () => {
    const heroRef = useRef();
    const cardsRef = useRef([]);
    const featuresRef = useRef([]);

    useEffect(() => {
        // Hero animation
        gsap.fromTo(heroRef.current, 
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
        );

        // Stagger animation for role cards
        gsap.fromTo(cardsRef.current,
            { opacity: 0, y: 100, rotationX: -15 },
            { 
                opacity: 1, 
                y: 0, 
                rotationX: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: "back.out(1.7)",
                delay: 0.5
            }
        );

        // Feature cards animation
        gsap.fromTo(featuresRef.current,
            { opacity: 0, scale: 0.8 },
            {
                opacity: 1,
                scale: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out",
                delay: 1
            }
        );
    }, []);

    const roles = [
        {
            id: 'system_admin',
            title: 'System Administrator',
            icon: '⚙️',
            description: 'Complete system control and oversight',
            features: [
                'User management across all farms',
                'System analytics and monitoring',
                'Security and audit controls',
                'Global configuration management'
            ],
            color: '#e74c3c'
        },
        {
            id: 'farm_owner',
            title: 'Farm Owner',
            icon: '👑',
            description: 'Portfolio management and strategic oversight',
            features: [
                'Multi-farm portfolio management',
                'Financial oversight and analytics',
                'Compliance tracking and reporting',
                'Strategic planning and growth'
            ],
            color: '#9b59b6'
        },
        {
            id: 'farm_manager',
            title: 'Farm Manager',
            icon: '👨‍💼',
            description: 'Daily operations and team coordination',
            features: [
                'Operational dashboard and metrics',
                'Team management and task assignment',
                'Animal health monitoring',
                'Biosecurity compliance management'
            ],
            color: '#3498db'
        },
        {
            id: 'farm_worker',
            title: 'Farm Worker',
            icon: '👷‍♂️',
            description: 'Mobile-optimized field operations',
            features: [
                'Task execution and progress tracking',
                'Quick data entry and reporting',
                'Mobile-friendly interface',
                'Emergency alerts and notifications'
            ],
            color: '#27ae60'
        }
    ];

    return (
        <div className="page-wrapper landing-page-3d">
            <ThreeScene />
            <header className="hero-3d">
                <div className="container-3d">
                    <div ref={heroRef} className="hero-content-3d">
                        <h1 className="hero-title-3d">
                            🌾 Digital Farm Portal
                        </h1>
                        <p className="hero-subtitle-3d">
                            Comprehensive farm management system for modern agricultural operations with cutting-edge 3D interface
                        </p>
                        <p className="hero-description-3d">
                            Experience the future of farm management with our immersive role-based system 
                            designed for poultry, pig, and cattle operations.
                        </p>
                        <div className="hero-actions-3d">
                            <Link to="/login" className="btn-3d btn-primary-3d">
                                🚀 Get Started
                            </Link>
                            <Link to="/register" className="btn-3d btn-secondary-3d">
                                📝 Register Now
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <section className="roles-section-3d">
                <div className="container-3d">
                    <h2 className="section-title-3d text-gradient">Choose Your Role</h2>
                    <p className="section-subtitle-3d">
                        Select the role that best describes your position in farm management
                    </p>
                    
                    <div className="grid-3d grid-2-3d">
                        {roles.map((role, index) => (
                            <div 
                                key={role.id} 
                                ref={(el) => (cardsRef.current[index] = el)}
                                className="card-3d role-card-3d perspective"
                                style={{ '--role-color': role.color }}
                            >
                                <div className="role-header-3d">
                                    <div className="role-icon-3d floating-element" style={{ background: `linear-gradient(135deg, ${role.color}, ${role.color}88)` }}>
                                        {role.icon}
                                    </div>
                                    <h3 className="role-title-3d">{role.title}</h3>
                                </div>
                                <p className="role-description-3d">{role.description}</p>
                                <ul className="role-features-3d">
                                    {role.features.map((feature, index) => (
                                        <li key={index}>{feature}</li>
                                    ))}
                                </ul>
                                <Link 
                                    to="/login" 
                                    className="btn-3d btn-role-3d"
                                    style={{ 
                                        background: `linear-gradient(135deg, ${role.color}, ${role.color}88)`,
                                        color: 'white'
                                    }}
                                >
                                    ✨ Login as {role.title}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="features-section-3d">
                <div className="container-3d">
                    <h2 className="section-title-3d text-gradient">Key Features</h2>
                    <div className="grid-3d grid-3-3d">
                        <div ref={(el) => (featuresRef.current[0] = el)} className="glass-card feature-card-3d">
                            <div className="feature-icon-3d">🦠</div>
                            <h3>Biosecurity Management</h3>
                            <p>Complete visitor tracking, environmental monitoring, and cleaning schedules with real-time alerts</p>
                        </div>
                        <div ref={(el) => (featuresRef.current[1] = el)} className="glass-card feature-card-3d">
                            <div className="feature-icon-3d">🐄</div>
                            <h3>Animal Health Tracking</h3>
                            <p>Medical records, vaccination schedules, and treatment history with AI-powered insights</p>
                        </div>
                        <div ref={(el) => (featuresRef.current[2] = el)} className="glass-card feature-card-3d">
                            <div className="feature-icon-3d">📦</div>
                            <h3>Inventory Management</h3>
                            <p>Feed, medicine, and equipment tracking with automated alerts and predictive analytics</p>
                        </div>
                        <div ref={(el) => (featuresRef.current[3] = el)} className="glass-card feature-card-3d">
                            <div className="feature-icon-3d">📊</div>
                            <h3>Real-time Analytics</h3>
                            <p>Performance metrics, compliance dashboards, and trend analysis with 3D visualizations</p>
                        </div>
                        <div ref={(el) => (featuresRef.current[4] = el)} className="glass-card feature-card-3d">
                            <div className="feature-icon-3d">📱</div>
                            <h3>Mobile Optimized</h3>
                            <p>Touch-friendly interface designed for field operations with offline capabilities</p>
                        </div>
                        <div ref={(el) => (featuresRef.current[5] = el)} className="glass-card feature-card-3d">
                            <div className="feature-icon-3d">🔒</div>
                            <h3>Role-based Security</h3>
                            <p>Secure access control with audit logging, session management, and biometric authentication</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="demo-section-3d">
                <div className="container-3d">
                    <h2 className="section-title-3d text-gradient">Demo Credentials</h2>
                    <p className="section-subtitle-3d">Try the system with these demo accounts</p>
                    
                    <div className="grid-3d grid-4-3d">
                        <div className="glass-card demo-card-3d">
                            <div className="demo-icon-3d">⚙️</div>
                            <h4>System Admin</h4>
                            <p><strong>Username:</strong> admin_rajesh</p>
                            <p><strong>Password:</strong> admin123</p>
                        </div>
                        <div className="glass-card demo-card-3d">
                            <div className="demo-icon-3d">👑</div>
                            <h4>Farm Owner</h4>
                            <p><strong>Username:</strong> owner_priya</p>
                            <p><strong>Password:</strong> owner123</p>
                        </div>
                        <div className="glass-card demo-card-3d">
                            <div className="demo-icon-3d">👨‍💼</div>
                            <h4>Farm Manager</h4>
                            <p><strong>Username:</strong> manager_arjun</p>
                            <p><strong>Password:</strong> manager123</p>
                        </div>
                        <div className="glass-card demo-card-3d">
                            <div className="demo-icon-3d">👷‍♂️</div>
                            <h4>Farm Worker</h4>
                            <p><strong>Username:</strong> worker_anita</p>
                            <p><strong>Password:</strong> worker123</p>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="footer-3d">
                <div className="container-3d">
                    <p>&copy; 2026 Digital Farm Portal. Built for modern agricultural operations with next-generation technology.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
