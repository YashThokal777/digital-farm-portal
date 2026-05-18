import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        first_name: '',
        last_name: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const roles = [
        { value: 'farm_owner', label: 'Farm Owner', description: 'Own and manage farms' },
        { value: 'farm_manager', label: 'Farm Manager', description: 'Manage daily operations' },
        { value: 'farm_worker', label: 'Farm Worker', description: 'Execute field tasks' }
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRoleSelect = (roleValue) => {
        setFormData({
            ...formData,
            role: roleValue
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        if (!formData.role) {
            setError('Please select a role');
            setLoading(false);
            return;
        }

        try {
            const result = await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone
            });
            
            if (result.success) {
                setSuccess('Registration successful! You can now login with your credentials.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>🌾 Digital Farm Portal</h1>
                    <h2>Create Your Account</h2>
                    <p>Join the digital farm management system</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username" className="form-label">
                            Username *
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="form-control"
                            required
                            placeholder="Choose a username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="your.email@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="first_name" className="form-label">
                            First Name
                        </label>
                        <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Your first name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="last_name" className="form-label">
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Your last name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone" className="form-label">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="+91-9876543210"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Role *</label>
                        <div className="role-selection">
                            <div className="role-grid">
                                {roles.map((role) => (
                                    <div
                                        key={role.value}
                                        className={`role-option ${formData.role === role.value ? 'selected' : ''}`}
                                        onClick={() => handleRoleSelect(role.value)}
                                    >
                                        <h4>{role.label}</h4>
                                        <p>{role.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password *
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-control"
                            required
                            placeholder="At least 6 characters"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            Confirm Password *
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="form-control"
                            required
                            placeholder="Repeat your password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary btn-full"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account? 
                        <Link to="/login" className="auth-link"> Login here</Link>
                    </p>
                    <p>
                        <Link to="/" className="auth-link">← Back to Home</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
