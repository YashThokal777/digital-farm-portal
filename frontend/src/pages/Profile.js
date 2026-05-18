import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, updateProfile, changePassword } = useAuth();
    const [profileData, setProfileData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        phone: ''
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (user) {
            setProfileData({
                email: user.email || '',
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const result = await updateProfile(profileData);
            if (result.success) {
                setMessage('Profile updated successfully!');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (passwordData.new_password !== passwordData.confirm_password) {
            setError('New passwords do not match');
            setLoading(false);
            return;
        }

        if (passwordData.new_password.length < 6) {
            setError('New password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            const result = await changePassword(passwordData.current_password, passwordData.new_password);
            if (result.success) {
                setMessage('Password changed successfully!');
                setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                });
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const getRoleColor = (role) => {
        const colors = {
            system_admin: '#e74c3c',
            farm_owner: '#9b59b6',
            farm_manager: '#3498db',
            farm_worker: '#27ae60'
        };
        return colors[role] || '#6c757d';
    };

    const getRoleDescription = (role) => {
        const descriptions = {
            system_admin: 'Complete system control and user management',
            farm_owner: 'Portfolio management and strategic oversight',
            farm_manager: 'Daily operations and team coordination',
            farm_worker: 'Mobile-optimized field operations'
        };
        return descriptions[role] || 'Farm management system user';
    };

    return (
        <div className="container" style={{ padding: '20px 0' }}>
            <h1>User Profile</h1>

            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            <div className="grid grid-2" style={{ gap: '30px' }}>
                {/* User Info Card */}
                <div className="card">
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: getRoleColor(user?.role),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 15px',
                            color: 'white',
                            fontSize: '2rem'
                        }}>
                            {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                        </div>
                        <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
                            {user?.first_name} {user?.last_name}
                        </h3>
                        <p style={{ 
                            margin: '0 0 10px 0', 
                            color: '#7f8c8d',
                            fontSize: '14px'
                        }}>
                            @{user?.username}
                        </p>
                        <div style={{
                            display: 'inline-block',
                            backgroundColor: getRoleColor(user?.role),
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            {user?.role?.replace('_', ' ')}
                        </div>
                    </div>

                    <div style={{ 
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        marginBottom: '20px'
                    }}>
                        <p style={{ 
                            margin: 0,
                            fontSize: '14px',
                            color: '#555',
                            lineHeight: '1.5'
                        }}>
                            {getRoleDescription(user?.role)}
                        </p>
                    </div>

                    <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <strong>Email:</strong> {user?.email || 'Not provided'}
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            <strong>Phone:</strong> {user?.phone || 'Not provided'}
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            <strong>Last Login:</strong> {
                                user?.last_login 
                                    ? new Date(user.last_login).toLocaleString()
                                    : 'Never'
                            }
                        </div>
                        <div>
                            <strong>Member Since:</strong> {
                                user?.created_at 
                                    ? new Date(user.created_at).toLocaleDateString()
                                    : 'Unknown'
                            }
                        </div>
                    </div>
                </div>

                {/* Forms Card */}
                <div className="card">
                    <div style={{ 
                        display: 'flex', 
                        gap: '10px', 
                        borderBottom: '1px solid #e9ecef', 
                        paddingBottom: '10px',
                        marginBottom: '20px'
                    }}>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Edit Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`btn ${activeTab === 'password' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Change Password
                        </button>
                    </div>

                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileSubmit}>
                            <h4 style={{ marginBottom: '20px', color: '#2c3e50' }}>
                                Update Profile Information
                            </h4>
                            
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleProfileChange}
                                    className="form-control"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div className="grid grid-2">
                                <div className="form-group">
                                    <label className="form-label">First Name</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={profileData.first_name}
                                        onChange={handleProfileChange}
                                        className="form-control"
                                        placeholder="Your first name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Last Name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={profileData.last_name}
                                        onChange={handleProfileChange}
                                        className="form-control"
                                        placeholder="Your last name"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profileData.phone}
                                    onChange={handleProfileChange}
                                    className="form-control"
                                    placeholder="+91-9876543210"
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-success"
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Update Profile'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'password' && (
                        <form onSubmit={handlePasswordSubmit}>
                            <h4 style={{ marginBottom: '20px', color: '#2c3e50' }}>
                                Change Password
                            </h4>

                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input
                                    type="password"
                                    name="current_password"
                                    value={passwordData.current_password}
                                    onChange={handlePasswordChange}
                                    className="form-control"
                                    required
                                    placeholder="Enter your current password"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input
                                    type="password"
                                    name="new_password"
                                    value={passwordData.new_password}
                                    onChange={handlePasswordChange}
                                    className="form-control"
                                    required
                                    placeholder="Enter new password (min 6 characters)"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirm_password"
                                    value={passwordData.confirm_password}
                                    onChange={handlePasswordChange}
                                    className="form-control"
                                    required
                                    placeholder="Confirm your new password"
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-warning"
                                disabled={loading}
                            >
                                {loading ? 'Changing...' : 'Change Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
