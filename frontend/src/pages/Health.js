import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Health = () => {
    const [healthRecords, setHealthRecords] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedAnimal, setSelectedAnimal] = useState('');
    const [formData, setFormData] = useState({
        animal_id: '',
        record_type: 'checkup',
        description: '',
        treatment: '',
        medication: '',
        dosage: '',
        veterinarian: '',
        cost: '',
        next_checkup_date: ''
    });

    useEffect(() => {
        fetchHealthRecords();
        fetchAnimals();
    }, []);

    const fetchHealthRecords = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await axios.get('/api/health', { headers });
            setHealthRecords(response.data.records || []);
        } catch (error) {
            setError('Failed to fetch health records');
        } finally {
            setLoading(false);
        }
    };

    const fetchAnimals = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await axios.get('/api/animals', { headers });
            setAnimals(response.data.animals || []);
        } catch (error) {
            console.error('Failed to fetch animals');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            await axios.post(`/api/health/animal/${formData.animal_id}`, formData, { headers });
            setShowAddForm(false);
            setFormData({
                animal_id: '',
                record_type: 'checkup',
                description: '',
                treatment: '',
                medication: '',
                dosage: '',
                veterinarian: '',
                cost: '',
                next_checkup_date: ''
            });
            fetchHealthRecords();
        } catch (error) {
            setError('Failed to create health record');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const filterRecords = () => {
        if (!selectedAnimal) return healthRecords || [];
        return (healthRecords || []).filter(record => record.animal_id === parseInt(selectedAnimal));
    };

    const getRecordTypeBadge = (type) => {
        const typeColors = {
            vaccination: 'success',
            treatment: 'warning',
            checkup: 'info',
            illness: 'danger',
            injury: 'danger'
        };
        return `badge badge-${typeColors[type] || 'info'}`;
    };

    if (loading) return <div className="container"><div className="loading">Loading health records...</div></div>;

    return (
        <div className="container" style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>Health Records</h1>
                <button 
                    onClick={() => setShowAddForm(true)}
                    className="btn btn-primary"
                >
                    Add Health Record
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="card mb-20">
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
                        <label className="form-label">Filter by Animal:</label>
                        <select
                            value={selectedAnimal}
                            onChange={(e) => setSelectedAnimal(e.target.value)}
                            className="form-control"
                        >
                            <option value="">All Animals</option>
                            {(animals || []).map(animal => (
                                <option key={animal.id} value={animal.id}>
                                    {animal.tag_number} - {animal.species}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ color: '#7f8c8d' }}>
                        Total Records: {filterRecords().length}
                    </div>
                </div>
            </div>

            {showAddForm && (
                <div className="card mb-20">
                    <h3>Add Health Record</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-3">
                            <div className="form-group">
                                <label className="form-label">Animal *</label>
                                <select
                                    name="animal_id"
                                    value={formData.animal_id}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                >
                                    <option value="">Select Animal</option>
                                    {(animals || []).map(animal => (
                                        <option key={animal.id} value={animal.id}>
                                            {animal.tag_number} - {animal.species} ({animal.farm_name})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Record Type *</label>
                                <select
                                    name="record_type"
                                    value={formData.record_type}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                >
                                    <option value="checkup">Checkup</option>
                                    <option value="vaccination">Vaccination</option>
                                    <option value="treatment">Treatment</option>
                                    <option value="illness">Illness</option>
                                    <option value="injury">Injury</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Veterinarian</label>
                                <input
                                    type="text"
                                    name="veterinarian"
                                    value={formData.veterinarian}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 3' }}>
                                <label className="form-label">Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="form-control"
                                    rows="3"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Treatment</label>
                                <input
                                    type="text"
                                    name="treatment"
                                    value={formData.treatment}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Medication</label>
                                <input
                                    type="text"
                                    name="medication"
                                    value={formData.medication}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Dosage</label>
                                <input
                                    type="text"
                                    name="dosage"
                                    value={formData.dosage}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Cost</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="cost"
                                    value={formData.cost}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Next Checkup Date</label>
                                <input
                                    type="date"
                                    name="next_checkup_date"
                                    value={formData.next_checkup_date}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn btn-success">Add Record</button>
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

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Animal</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Treatment</th>
                            <th>Medication</th>
                            <th>Veterinarian</th>
                            <th>Cost</th>
                            <th>Next Checkup</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filterRecords().map((record) => (
                            <tr key={record.id}>
                                <td>{new Date(record.record_date).toLocaleDateString()}</td>
                                <td>
                                    <strong>{record.tag_number}</strong>
                                    <br />
                                    <small style={{ color: '#7f8c8d' }}>
                                        {record.species} - {record.farm_name}
                                    </small>
                                </td>
                                <td>
                                    <span className={getRecordTypeBadge(record.record_type)}>
                                        {record.record_type}
                                    </span>
                                </td>
                                <td>{record.description}</td>
                                <td>{record.treatment || 'N/A'}</td>
                                <td>
                                    {record.medication && (
                                        <div>
                                            <strong>{record.medication}</strong>
                                            {record.dosage && <br />}
                                            <small>{record.dosage}</small>
                                        </div>
                                    )}
                                </td>
                                <td>{record.veterinarian || 'N/A'}</td>
                                <td>{record.cost ? `₹${record.cost}` : 'N/A'}</td>
                                <td>
                                    {record.next_checkup_date 
                                        ? new Date(record.next_checkup_date).toLocaleDateString()
                                        : 'N/A'
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filterRecords().length === 0 && (
                    <div className="text-center" style={{ padding: '40px' }}>
                        <h3>No health records found</h3>
                        <p>
                            {selectedAnimal 
                                ? "No health records found for the selected animal."
                                : "Click 'Add Health Record' to create your first health record."
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Health;
