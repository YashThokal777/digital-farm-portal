import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const QuickEntry = () => {
    const { user } = useAuth();
    const [farms, setFarms] = useState([]);
    const [selectedFarm, setSelectedFarm] = useState('');
    const [entryType, setEntryType] = useState('animal');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Animal entry form
    const [animalData, setAnimalData] = useState({
        tag_number: '',
        species: 'chicken',
        breed: '',
        gender: 'female',
        birth_date: '',
        weight: '',
        location: ''
    });

    // Health record form
    const [healthData, setHealthData] = useState({
        animal_id: '',
        record_type: 'checkup',
        description: '',
        treatment: '',
        medication: '',
        veterinarian: ''
    });

    // Inventory form
    const [inventoryData, setInventoryData] = useState({
        item_name: '',
        category: 'feed',
        quantity: '',
        unit: 'kg',
        cost_per_unit: '',
        supplier: '',
        expiry_date: '',
        minimum_stock: ''
    });

    useEffect(() => {
        fetchFarms();
    }, []);

    const fetchFarms = async () => {
        try {
            const response = await axios.get('/farms');
            setFarms(response.data.farms || []);
            if (response.data.farms?.length > 0) {
                setSelectedFarm(response.data.farms[0].id);
            }
        } catch (error) {
            console.error('Error fetching farms:', error);
            setError('Failed to load farms');
        }
    };

    const handleAnimalSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await axios.post('/api/animals', {
                ...animalData,
                farm_id: selectedFarm
            });

            if (response.data.success) {
                setMessage('Animal registered successfully!');
                setAnimalData({
                    tag_number: '',
                    species: 'chicken',
                    breed: '',
                    gender: 'female',
                    birth_date: '',
                    weight: '',
                    location: ''
                });
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to register animal');
        } finally {
            setLoading(false);
        }
    };

    const handleHealthSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await axios.post('/health/records', {
                ...healthData,
                farm_id: selectedFarm
            });

            setMessage('Health record added successfully!');
            setHealthData({
                animal_id: '',
                record_type: 'checkup',
                description: '',
                treatment: '',
                medication: '',
                veterinarian: ''
            });
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to add health record');
        } finally {
            setLoading(false);
        }
    };

    const handleInventorySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await axios.post('/inventory', {
                ...inventoryData,
                farm_id: selectedFarm
            });

            setMessage('Inventory item added successfully!');
            setInventoryData({
                item_name: '',
                category: 'feed',
                quantity: '',
                unit: 'kg',
                cost_per_unit: '',
                supplier: '',
                expiry_date: '',
                minimum_stock: ''
            });
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to add inventory item');
        } finally {
            setLoading(false);
        }
    };

    const renderAnimalForm = () => (
        <form onSubmit={handleAnimalSubmit} className="quick-entry-form">
            <h3>🐄 Register New Animal</h3>
            
            <div className="grid grid-2">
                <div className="form-group">
                    <label className="form-label">Tag Number *</label>
                    <input
                        type="text"
                        value={animalData.tag_number}
                        onChange={(e) => setAnimalData({...animalData, tag_number: e.target.value})}
                        className="form-control"
                        required
                        placeholder="e.g., CH001"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Species *</label>
                    <select
                        value={animalData.species}
                        onChange={(e) => setAnimalData({...animalData, species: e.target.value})}
                        className="form-control"
                        required
                    >
                        <option value="chicken">Chicken</option>
                        <option value="pig">Pig</option>
                        <option value="cow">Cow</option>
                        <option value="goat">Goat</option>
                        <option value="sheep">Sheep</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-2">
                <div className="form-group">
                    <label className="form-label">Breed</label>
                    <input
                        type="text"
                        value={animalData.breed}
                        onChange={(e) => setAnimalData({...animalData, breed: e.target.value})}
                        className="form-control"
                        placeholder="e.g., Rhode Island Red"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                        value={animalData.gender}
                        onChange={(e) => setAnimalData({...animalData, gender: e.target.value})}
                        className="form-control"
                    >
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-2">
                <div className="form-group">
                    <label className="form-label">Birth Date</label>
                    <input
                        type="date"
                        value={animalData.birth_date}
                        onChange={(e) => setAnimalData({...animalData, birth_date: e.target.value})}
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Weight (kg)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={animalData.weight}
                        onChange={(e) => setAnimalData({...animalData, weight: e.target.value})}
                        className="form-control"
                        placeholder="0.0"
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Location</label>
                <input
                    type="text"
                    value={animalData.location}
                    onChange={(e) => setAnimalData({...animalData, location: e.target.value})}
                    className="form-control"
                    placeholder="e.g., Coop A, Pen 1"
                />
            </div>

            <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'Registering...' : 'Register Animal'}
            </button>
        </form>
    );

    const renderHealthForm = () => (
        <form onSubmit={handleHealthSubmit} className="quick-entry-form">
            <h3>🏥 Add Health Record</h3>
            
            <div className="grid grid-2">
                <div className="form-group">
                    <label className="form-label">Animal Tag/ID *</label>
                    <input
                        type="text"
                        value={healthData.animal_id}
                        onChange={(e) => setHealthData({...healthData, animal_id: e.target.value})}
                        className="form-control"
                        required
                        placeholder="Enter animal tag number"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Record Type</label>
                    <select
                        value={healthData.record_type}
                        onChange={(e) => setHealthData({...healthData, record_type: e.target.value})}
                        className="form-control"
                    >
                        <option value="checkup">Checkup</option>
                        <option value="vaccination">Vaccination</option>
                        <option value="treatment">Treatment</option>
                        <option value="surgery">Surgery</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                    value={healthData.description}
                    onChange={(e) => setHealthData({...healthData, description: e.target.value})}
                    className="form-control"
                    required
                    rows="3"
                    placeholder="Describe the health record..."
                />
            </div>

            <div className="grid grid-2">
                <div className="form-group">
                    <label className="form-label">Treatment</label>
                    <input
                        type="text"
                        value={healthData.treatment}
                        onChange={(e) => setHealthData({...healthData, treatment: e.target.value})}
                        className="form-control"
                        placeholder="Treatment given"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Medication</label>
                    <input
                        type="text"
                        value={healthData.medication}
                        onChange={(e) => setHealthData({...healthData, medication: e.target.value})}
                        className="form-control"
                        placeholder="Medication administered"
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Veterinarian</label>
                <input
                    type="text"
                    value={healthData.veterinarian}
                    onChange={(e) => setHealthData({...healthData, veterinarian: e.target.value})}
                    className="form-control"
                    placeholder="Veterinarian name"
                />
            </div>

            <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'Adding...' : 'Add Health Record'}
            </button>
        </form>
    );

    const renderInventoryForm = () => (
        <form onSubmit={handleInventorySubmit} className="quick-entry-form">
            <h3>📦 Add Inventory Item</h3>
            
            <div className="grid grid-2">
                <div className="form-group">
                    <label className="form-label">Item Name *</label>
                    <input
                        type="text"
                        value={inventoryData.item_name}
                        onChange={(e) => setInventoryData({...inventoryData, item_name: e.target.value})}
                        className="form-control"
                        required
                        placeholder="e.g., Layer Feed"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                        value={inventoryData.category}
                        onChange={(e) => setInventoryData({...inventoryData, category: e.target.value})}
                        className="form-control"
                    >
                        <option value="feed">Feed</option>
                        <option value="medicine">Medicine</option>
                        <option value="equipment">Equipment</option>
                        <option value="supplies">Supplies</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-3">
                <div className="form-group">
                    <label className="form-label">Quantity *</label>
                    <input
                        type="number"
                        step="0.1"
                        value={inventoryData.quantity}
                        onChange={(e) => setInventoryData({...inventoryData, quantity: e.target.value})}
                        className="form-control"
                        required
                        placeholder="0"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Unit</label>
                    <select
                        value={inventoryData.unit}
                        onChange={(e) => setInventoryData({...inventoryData, unit: e.target.value})}
                        className="form-control"
                    >
                        <option value="kg">kg</option>
                        <option value="liters">liters</option>
                        <option value="pieces">pieces</option>
                        <option value="bottles">bottles</option>
                        <option value="bags">bags</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Cost per Unit</label>
                    <input
                        type="number"
                        step="0.01"
                        value={inventoryData.cost_per_unit}
                        onChange={(e) => setInventoryData({...inventoryData, cost_per_unit: e.target.value})}
                        className="form-control"
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div className="grid grid-2">
                <div className="form-group">
                    <label className="form-label">Supplier</label>
                    <input
                        type="text"
                        value={inventoryData.supplier}
                        onChange={(e) => setInventoryData({...inventoryData, supplier: e.target.value})}
                        className="form-control"
                        placeholder="Supplier name"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input
                        type="date"
                        value={inventoryData.expiry_date}
                        onChange={(e) => setInventoryData({...inventoryData, expiry_date: e.target.value})}
                        className="form-control"
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Minimum Stock Level</label>
                <input
                    type="number"
                    step="0.1"
                    value={inventoryData.minimum_stock}
                    onChange={(e) => setInventoryData({...inventoryData, minimum_stock: e.target.value})}
                    className="form-control"
                    placeholder="Alert when stock falls below this level"
                />
            </div>

            <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'Adding...' : 'Add Inventory Item'}
            </button>
        </form>
    );

    return (
        <div className="container">
            <h1>⚡ Quick Entry</h1>
            <p>Quickly add new records to your farm management system</p>

            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            {farms.length > 0 && (
                <div className="form-group" style={{ marginBottom: '30px' }}>
                    <label className="form-label">Select Farm</label>
                    <select
                        value={selectedFarm}
                        onChange={(e) => setSelectedFarm(e.target.value)}
                        className="form-control"
                        style={{ maxWidth: '300px' }}
                    >
                        {farms.map(farm => (
                            <option key={farm.id} value={farm.id}>
                                {farm.name} - {farm.location}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="tabs" style={{ marginBottom: '30px' }}>
                <button
                    onClick={() => setEntryType('animal')}
                    className={`btn ${entryType === 'animal' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    🐄 Animal
                </button>
                <button
                    onClick={() => setEntryType('health')}
                    className={`btn ${entryType === 'health' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    🏥 Health Record
                </button>
                <button
                    onClick={() => setEntryType('inventory')}
                    className={`btn ${entryType === 'inventory' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    📦 Inventory
                </button>
            </div>

            <div className="quick-entry-content">
                {entryType === 'animal' && renderAnimalForm()}
                {entryType === 'health' && renderHealthForm()}
                {entryType === 'inventory' && renderInventoryForm()}
            </div>

            <style jsx>{`
                .tabs {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                .quick-entry-form {
                    background: white;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .quick-entry-form h3 {
                    margin-top: 0;
                    color: #2c3e50;
                    border-bottom: 2px solid #ecf0f1;
                    padding-bottom: 10px;
                }
            `}</style>
        </div>
    );
};

export default QuickEntry;
