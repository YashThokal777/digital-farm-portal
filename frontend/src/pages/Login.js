import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';
import ThreeScene from '../components/ThreeScene';
import '../styles/GlobalTheme.css';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();
    const formRef = useRef();
    const demoRef = useRef([]);

    useEffect(() => {
        // Entrance animations
        gsap.fromTo(formRef.current,
            { opacity: 0, y: 50, rotationX: -15 },
            { opacity: 1, y: 0, rotationX: 0, duration: 1, ease: "back.out(1.7)" }
        );

        gsap.fromTo(demoRef.current,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, delay: 0.5, ease: "power2.out" }
        );
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(formData.username, formData.password);
            
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const fillDemoCredentials = (role) => {
        const credentials = {
            admin: { username: 'admin_rajesh', password: 'admin123' },
            owner: { username: 'owner_priya', password: 'owner123' },
            manager: { username: 'manager_arjun', password: 'manager123' },
            worker: { username: 'worker_anita', password: 'worker123' }
        };
        
        setFormData(credentials[role]);
    };

    return (
        <div className="page-wrapper auth-page-3d">
            <ThreeScene />
            <div className="container-3d">
                <div ref={formRef} className="glass-card auth-card-3d">
                    <div className="auth-header-3d">
                        <h1 className="auth-title-3d text-gradient">🌾 Digital Farm Portal</h1>
                        <h2 className="auth-subtitle-3d">Login to Your Account</h2>
                        <p className="auth-description-3d">Enter your credentials to access the farm management system</p>
                    </div>

                {error && (
                    <div className="alert-3d alert-error-3d">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form-3d">
                    <div className="form-group-3d">
                        <label htmlFor="username" className="form-label-3d">
                            👤 Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="form-control-3d"
                            required
                            placeholder="Enter your username"
                        />
                    </div>

                    <div className="form-group-3d">
                        <label htmlFor="password" className="form-label-3d">
                            🔒 Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-control-3d"
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-3d btn-primary-3d btn-full-3d"
                        disabled={loading}
                    >
                        {loading ? '🔄 Logging in...' : '🚀 Login'}
                    </button>
                </form>

                <div className="demo-credentials-3d">
                    <h3 className="demo-title-3d">⚡ Quick Demo Access</h3>
                    <div className="demo-buttons-3d">
                        <button 
                            ref={(el) => (demoRef.current[0] = el)}
                            onClick={() => fillDemoCredentials('admin')}
                            className="btn-3d btn-demo-3d admin-3d"
                        >
                            ⚙️ Admin Demo
                        </button>
                        <button 
                            ref={(el) => (demoRef.current[1] = el)}
                            onClick={() => fillDemoCredentials('owner')}
                            className="btn-3d btn-demo-3d owner-3d"
                        >
                            👑 Owner Demo
                        </button>
                        <button 
                            ref={(el) => (demoRef.current[2] = el)}
                            onClick={() => fillDemoCredentials('manager')}
                            className="btn-3d btn-demo-3d manager-3d"
                        >
                            👨‍💼 Manager Demo
                        </button>
                        <button 
                            ref={(el) => (demoRef.current[3] = el)}
                            onClick={() => fillDemoCredentials('worker')}
                            className="btn-3d btn-demo-3d worker-3d"
                        >
                            👷‍♂️ Worker Demo
                        </button>
                    </div>
                </div>

                <div className="auth-footer-3d">
                    <p>
                        Don't have an account? 
                        <Link to="/register" className="auth-link-3d"> ✨ Register here</Link>
                    </p>
                    <p>
                        <Link to="/" className="auth-link-3d">🏠 Back to Home</Link>
                    </p>
                </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
