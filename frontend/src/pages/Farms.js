import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Farms = () => {
    const { user } = useAuth();
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        farm_type: 'poultry',
        area_hectares: '',
        established_date: '',
        license_number: ''
    });

    useEffect(() => {
        fetchFarms();
    }, []);

    const fetchFarms = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            
            const response = await axios.get('/api/farms', { headers });
            setFarms(response.data.farms || []);
        } catch (error) {
            console.error('Error fetching farms:', error);
            if (error.response?.status === 401) {
                setError('Authentication required. Please log in again.');
            } else if (error.response?.status === 403) {
                setError('You do not have permission to access farm data.');
            } else {
                setError('Failed to fetch farms');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            
            await axios.post('/api/farms', formData, { headers });
            setShowAddForm(false);
            setFormData({
                name: '',
                location: '',
                farm_type: 'poultry',
                area_hectares: '',
                established_date: '',
                license_number: ''
            });
            fetchFarms();
        } catch (error) {
            console.error('Error creating farm:', error);
            if (error.response?.status === 401) {
                setError('Authentication required. Please log in again.');
            } else if (error.response?.status === 403) {
                setError('You do not have permission to create farms.');
            } else {
                setError('Failed to create farm');
            }
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const canCreateFarm = ['system_admin', 'farm_owner', 'farm_manager'].includes(user?.role);

    if (loading) return <div className="container"><div className="loading">Loading farms...</div></div>;

    return (
        <div className="container" style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>Farm Management</h1>
                {canCreateFarm && (
                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="btn btn-primary"
                    >
                        Add New Farm
                    </button>
                )}
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {showAddForm && (
                <div className="card mb-20">
                    <h3>Add New Farm</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">Farm Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Farm Type *</label>
                                <select
                                    name="farm_type"
                                    value={formData.farm_type}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                >
                                    <option value="poultry">Poultry</option>
                                    <option value="pig">Pig</option>
                                    <option value="cattle">Cattle</option>
                                    <option value="mixed">Mixed</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Area (Hectares)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="area_hectares"
                                    value={formData.area_hectares}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Established Date</label>
                                <input
                                    type="date"
                                    name="established_date"
                                    value={formData.established_date}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">License Number</label>
                                <input
                                    type="text"
                                    name="license_number"
                                    value={formData.license_number}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn btn-success">Create Farm</button>
                            <button 
                                type="button" 
                                onClick={() => setShowAddForm(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-2">
                {farms.map((farm) => (
                    <div key={farm.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, color: '#2c3e50' }}>{farm.name}</h3>
                            <span className={`badge badge-${farm.farm_type === 'poultry' ? 'warning' : farm.farm_type === 'pig' ? 'danger' : farm.farm_type === 'cattle' ? 'success' : 'info'}`}>
                                {farm.farm_type}
                            </span>
                        </div>
                        
                        <p style={{ color: '#7f8c8d', marginBottom: '15px' }}>
                            📍 {farm.location}
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                            <div>
                                <strong>Area:</strong> {farm.area_hectares} ha
                            </div>
                            <div>
                                <strong>Animals:</strong> {farm.animal_count || 0}
                            </div>
                            <div>
                                <strong>Staff:</strong> {farm.staff_count || 0}
                            </div>
                            <div>
                                <strong>Established:</strong> {farm.established_date ? new Date(farm.established_date).getFullYear() : 'N/A'}
                            </div>
                        </div>
                        
                        {farm.license_number && (
                            <p style={{ fontSize: '12px', color: '#95a5a6' }}>
                                License: {farm.license_number}
                            </p>
                        )}
                        
                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ecf0f1' }}>
                            <small style={{ color: '#95a5a6' }}>
                                Owner: {farm.first_name} {farm.last_name} ({farm.owner_username})
                            </small>
                        </div>
                    </div>
                ))}
            </div>

            {farms.length === 0 && !loading && (
                <div className="text-center" style={{ padding: '40px' }}>
                    <h3>No farms found</h3>
                    <p>
                        {canCreateFarm 
                            ? "Click 'Add New Farm' to create your first farm."
                            : "No farms are assigned to you yet."
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default Farms;
