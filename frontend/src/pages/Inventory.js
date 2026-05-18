import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Inventory.css';

const Inventory = () => {
    const [feedInventory, setFeedInventory] = useState([]);
    const [medicineInventory, setMedicineInventory] = useState([]);
    const [equipmentInventory, setEquipmentInventory] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('feed');
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedFarm, setSelectedFarm] = useState('');
    const [showLowStock, setShowLowStock] = useState(false);
    const [feedFormData, setFeedFormData] = useState({
        farm_id: '',
        feed_type: '',
        brand: '',
        batch_number: '',
        quantity_kg: '',
        unit_price: '',
        purchase_date: '',
        expiry_date: '',
        supplier: '',
        minimum_stock: '100',
        location: '',
        notes: ''
    });
    const [medicineFormData, setMedicineFormData] = useState({
        farm_id: '',
        medicine_name: '',
        medicine_type: 'antibiotic',
        brand: '',
        batch_number: '',
        quantity: '',
        unit: 'pieces',
        unit_price: '',
        purchase_date: '',
        expiry_date: '',
        supplier: '',
        minimum_stock: '10',
        storage_requirements: '',
        prescription_required: false,
        notes: ''
    });
    const [equipmentFormData, setEquipmentFormData] = useState({
        farm_id: '',
        equipment_name: '',
        equipment_type: 'feeding',
        brand: '',
        model: '',
        serial_number: '',
        purchase_date: '',
        warranty_expiry: '',
        condition_status: 'good',
        location: '',
        purchase_price: '',
        supplier: '',
        notes: ''
    });

    useEffect(() => {
        fetchInventory();
        fetchFarms();
    }, []);

    const fetchInventory = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedFarm) params.append('farm_id', selectedFarm);
            if (showLowStock) params.append('low_stock', 'true');
            const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            
            // Fetch all inventory types
            const [feedResponse, medicineResponse, equipmentResponse, alertsResponse] = await Promise.all([
                axios.get(`${baseURL}/api/inventory/feed?${params}`),
                axios.get(`${baseURL}/api/inventory/medicine?${params}`),
                axios.get(`${baseURL}/api/inventory/equipment?${params}`),
                axios.get(`${baseURL}/api/inventory/alerts?${params}`)
            ]);

            setFeedInventory(feedResponse.data.items || []);
            setMedicineInventory(medicineResponse.data.items || []);
            setEquipmentInventory(equipmentResponse.data.items || []);
            setAlerts(alertsResponse.data.alerts || []);
            setError(''); // Clear any previous errors
        } catch (error) {
            console.error('Inventory fetch error:', error);
            setError(`Failed to fetch inventory: ${error.response?.data?.message || error.message}`);
            // Set empty arrays to ensure UI renders properly
            setFeedInventory([]);
            setMedicineInventory([]);
            setEquipmentInventory([]);
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchFarms = async () => {
        try {
            const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const response = await axios.get(`${baseURL}/api/farms`);
            setFarms(response.data.farms || []);
        } catch (error) {
            console.error('Failed to fetch farms:', error);
            setFarms([]); // Ensure farms array is set even on error
        }
    };

    useEffect(() => {
        fetchInventory();
    }, [selectedFarm, showLowStock]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let endpoint = '';
            let data = {};
            
            if (activeTab === 'feed') {
                endpoint = '/api/inventory/feed';
                data = feedFormData;
            } else if (activeTab === 'medicine') {
                endpoint = '/api/inventory/medicine';
                data = medicineFormData;
            } else if (activeTab === 'equipment') {
                endpoint = '/api/inventory/equipment';
                data = equipmentFormData;
            }

            await axios.post(endpoint, data);
            setShowAddForm(false);
            resetForms();
            fetchInventory();
        } catch (error) {
            setError('Failed to create inventory item');
        }
    };

    const resetForms = () => {
        setFeedFormData({
            farm_id: '',
            feed_type: '',
            brand: '',
            batch_number: '',
            quantity_kg: '',
            unit_price: '',
            purchase_date: '',
            expiry_date: '',
            supplier: '',
            minimum_stock: '100',
            location: '',
            notes: ''
        });
        setMedicineFormData({
            farm_id: '',
            medicine_name: '',
            medicine_type: 'antibiotic',
            brand: '',
            batch_number: '',
            quantity: '',
            unit: 'pieces',
            unit_price: '',
            purchase_date: '',
            expiry_date: '',
            supplier: '',
            minimum_stock: '10',
            storage_requirements: '',
            prescription_required: false,
            notes: ''
        });
        setEquipmentFormData({
            farm_id: '',
            equipment_name: '',
            equipment_type: 'feeding',
            brand: '',
            model: '',
            serial_number: '',
            purchase_date: '',
            warranty_expiry: '',
            condition_status: 'good',
            location: '',
            purchase_price: '',
            supplier: '',
            notes: ''
        });
    };

    const handleFeedChange = (e) => {
        setFeedFormData({
            ...feedFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleMedicineChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setMedicineFormData({
            ...medicineFormData,
            [e.target.name]: value
        });
    };

    const handleEquipmentChange = (e) => {
        setEquipmentFormData({
            ...equipmentFormData,
            [e.target.name]: e.target.value
        });
    };

    const checkAlerts = async () => {
        try {
            await axios.post('/api/inventory/check-alerts', { farm_id: selectedFarm });
            fetchInventory();
        } catch (error) {
            setError('Failed to check alerts');
        }
    };

    const getTypeColor = (type) => {
        const colors = {
            feed: '#28a745',
            medicine: '#dc3545',
            equipment: '#17a2b8',
            antibiotic: '#dc3545',
            vaccine: '#6f42c1',
            vitamin: '#fd7e14',
            dewormer: '#20c997',
            antiseptic: '#6c757d',
            feeding: '#28a745',
            cleaning: '#17a2b8',
            medical: '#dc3545',
            maintenance: '#ffc107',
            monitoring: '#6f42c1'
        };
        return colors[type] || '#6c757d';
    };

    const isLowStock = (item, type) => {
        if (type === 'feed') {
            return item.quantity_kg <= item.minimum_stock;
        } else if (type === 'medicine') {
            return item.quantity <= item.minimum_stock;
        }
        return false;
    };

    const isExpiringSoon = (item) => {
        if (!item.expiry_date) return false;
        const expiryDate = new Date(item.expiry_date);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow;
    };

    const getCurrentInventory = () => {
        switch (activeTab) {
            case 'feed': return feedInventory;
            case 'medicine': return medicineInventory;
            case 'equipment': return equipmentInventory;
            default: return [];
        }
    };

    const getActiveAlerts = () => {
        return alerts.filter(alert => alert.status === 'active');
    };

    if (loading) return (
        <div className="container">
            <div className="loading">
                <h2>Loading inventory...</h2>
                <p>Fetching data from server...</p>
            </div>
        </div>
    );

    return (
        <div className="inventory-container">
            <div className="inventory-header">
                <h1 className="inventory-title">📦 Inventory Management</h1>
                <button 
                    onClick={() => setShowAddForm(true)}
                    className="btn btn-primary"
                >
                    ➕ Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </button>
            </div>

            {error && <div className="error-alert">{error}</div>}

            {/* Alerts Section */}
            {getActiveAlerts().length > 0 && (
                <div className="alerts-section">
                    <div className="alerts-header">
                        <h3 className="alerts-title">🚨 Active Alerts ({getActiveAlerts().length})</h3>
                        <button onClick={checkAlerts} className="check-alerts-btn">
                            🔄 Check Alerts
                        </button>
                    </div>
                    <div className="alerts-list">
                        {getActiveAlerts().slice(0, 5).map((alert) => (
                            <div key={alert.id} className={`alert-item ${alert.severity}`}>
                                <p className="alert-message">{alert.alert_message}</p>
                                <span className={`alert-severity ${alert.severity}`}>
                                    {alert.severity}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Inventory Tabs */}
            <div className="inventory-tabs">
                <button 
                    className={`tab-button ${activeTab === 'feed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('feed')}
                >
                    🌾 Feed ({feedInventory.length})
                </button>
                <button 
                    className={`tab-button ${activeTab === 'medicine' ? 'active' : ''}`}
                    onClick={() => setActiveTab('medicine')}
                >
                    💊 Medicine ({medicineInventory.length})
                </button>
                <button 
                    className={`tab-button ${activeTab === 'equipment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('equipment')}
                >
                    🔧 Equipment ({equipmentInventory.length})
                </button>
            </div>

            {/* Controls */}
            <div className="inventory-controls">
                <div className="controls-row">
                    <div className="control-group">
                        <label className="control-label">Farm:</label>
                        <select
                            value={selectedFarm}
                            onChange={(e) => setSelectedFarm(e.target.value)}
                            className="control-select"
                        >
                            <option value="">All Farms</option>
                            {farms.map(farm => (
                                <option key={farm.id} value={farm.id}>
                                    {farm.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id="lowStock"
                            checked={showLowStock}
                            onChange={(e) => setShowLowStock(e.target.checked)}
                        />
                        <label htmlFor="lowStock">Show Low Stock Only</label>
                    </div>
                    <div className="stats-info">
                        Total Items: {getCurrentInventory().length}
                    </div>
                </div>
            </div>

            {showAddForm && (
                <div className="add-form">
                    <h3 className="form-title">Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Item</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Farm *</label>
                                <select
                                    name="farm_id"
                                    value={activeTab === 'feed' ? feedFormData.farm_id : activeTab === 'medicine' ? medicineFormData.farm_id : equipmentFormData.farm_id}
                                    onChange={activeTab === 'feed' ? handleFeedChange : activeTab === 'medicine' ? handleMedicineChange : handleEquipmentChange}
                                    className="form-input"
                                    required
                                >
                                    <option value="">Select Farm</option>
                                    {farms.map(farm => (
                                        <option key={farm.id} value={farm.id}>
                                            {farm.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">{activeTab === 'feed' ? 'Feed Type' : activeTab === 'medicine' ? 'Medicine Name' : 'Equipment Name'} *</label>
                                <input
                                    type="text"
                                    name={activeTab === 'feed' ? 'feed_type' : activeTab === 'medicine' ? 'medicine_name' : 'equipment_name'}
                                    value={activeTab === 'feed' ? feedFormData.feed_type : activeTab === 'medicine' ? medicineFormData.medicine_name : equipmentFormData.equipment_name}
                                    onChange={activeTab === 'feed' ? handleFeedChange : activeTab === 'medicine' ? handleMedicineChange : handleEquipmentChange}
                                    className="form-input"
                                    required
                                />
                            </div>
                            {activeTab === 'medicine' && (
                                <div className="form-group">
                                    <label className="form-label">Medicine Type *</label>
                                    <select
                                        name="medicine_type"
                                        value={medicineFormData.medicine_type}
                                        onChange={handleMedicineChange}
                                        className="form-input"
                                        required
                                    >
                                        <option value="antibiotic">Antibiotic</option>
                                        <option value="vaccine">Vaccine</option>
                                        <option value="vitamin">Vitamin</option>
                                        <option value="dewormer">Dewormer</option>
                                        <option value="antiseptic">Antiseptic</option>
                                    </select>
                                </div>
                            )}
                            {activeTab === 'equipment' && (
                                <div className="form-group">
                                    <label className="form-label">Equipment Type *</label>
                                    <select
                                        name="equipment_type"
                                        value={equipmentFormData.equipment_type}
                                        onChange={handleEquipmentChange}
                                        className="form-input"
                                        required
                                    >
                                        <option value="feeding">Feeding</option>
                                        <option value="cleaning">Cleaning</option>
                                        <option value="medical">Medical</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="monitoring">Monitoring</option>
                                    </select>
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">Quantity *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name={activeTab === 'feed' ? 'quantity_kg' : 'quantity'}
                                    value={activeTab === 'feed' ? feedFormData.quantity_kg : activeTab === 'medicine' ? medicineFormData.quantity : equipmentFormData.quantity || '1'}
                                    onChange={activeTab === 'feed' ? handleFeedChange : activeTab === 'medicine' ? handleMedicineChange : handleEquipmentChange}
                                    className="form-input"
                                    required
                                />
                            </div>
                            {activeTab === 'medicine' && (
                                <div className="form-group">
                                    <label className="form-label">Unit *</label>
                                    <select
                                        name="unit"
                                        value={medicineFormData.unit}
                                        onChange={handleMedicineChange}
                                        className="form-input"
                                        required
                                    >
                                        <option value="pieces">Pieces</option>
                                        <option value="ml">ML</option>
                                        <option value="tablets">Tablets</option>
                                        <option value="vials">Vials</option>
                                        <option value="bottles">Bottles</option>
                                    </select>
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">Unit Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="unit_price"
                                    value={activeTab === 'feed' ? feedFormData.unit_price : activeTab === 'medicine' ? medicineFormData.unit_price : equipmentFormData.purchase_price}
                                    onChange={activeTab === 'feed' ? handleFeedChange : activeTab === 'medicine' ? handleMedicineChange : handleEquipmentChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Supplier</label>
                                <input
                                    type="text"
                                    name="supplier"
                                    value={activeTab === 'feed' ? feedFormData.supplier : activeTab === 'medicine' ? medicineFormData.supplier : equipmentFormData.supplier}
                                    onChange={activeTab === 'feed' ? handleFeedChange : activeTab === 'medicine' ? handleMedicineChange : handleEquipmentChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Purchase Date</label>
                                <input
                                    type="date"
                                    name="purchase_date"
                                    value={activeTab === 'feed' ? feedFormData.purchase_date : activeTab === 'medicine' ? medicineFormData.purchase_date : equipmentFormData.purchase_date}
                                    onChange={activeTab === 'feed' ? handleFeedChange : activeTab === 'medicine' ? handleMedicineChange : handleEquipmentChange}
                                    className="form-input"
                                />
                            </div>
                            {(activeTab === 'feed' || activeTab === 'medicine') && (
                                <div className="form-group">
                                    <label className="form-label">Expiry Date</label>
                                    <input
                                        type="date"
                                        name="expiry_date"
                                        value={activeTab === 'feed' ? feedFormData.expiry_date : medicineFormData.expiry_date}
                                        onChange={activeTab === 'feed' ? handleFeedChange : handleMedicineChange}
                                        className="form-input"
                                    />
                                </div>
                            )}
                            {(activeTab === 'feed' || activeTab === 'medicine') && (
                                <div className="form-group">
                                    <label className="form-label">Minimum Stock</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="minimum_stock"
                                        value={activeTab === 'feed' ? feedFormData.minimum_stock : medicineFormData.minimum_stock}
                                        onChange={activeTab === 'feed' ? handleFeedChange : handleMedicineChange}
                                        className="form-input"
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={activeTab === 'feed' ? feedFormData.location : activeTab === 'equipment' ? equipmentFormData.location : ''}
                                    onChange={activeTab === 'feed' ? handleFeedChange : handleEquipmentChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <textarea
                                    name="notes"
                                    value={activeTab === 'feed' ? feedFormData.notes : activeTab === 'medicine' ? medicineFormData.notes : equipmentFormData.notes}
                                    onChange={activeTab === 'feed' ? handleFeedChange : activeTab === 'medicine' ? handleMedicineChange : handleEquipmentChange}
                                    className="form-textarea"
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-success">Add Item</button>
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

            <div className="inventory-table">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>Unit</th>
                            <th>Cost/Unit</th>
                            <th>Supplier</th>
                            <th>Purchase Date</th>
                            <th>Expiry Date</th>
                            <th>Farm</th>
                            <th>Location</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getCurrentInventory().map((item) => (
                            <tr key={item.id} className={`${
                                isLowStock(item, activeTab) ? 'low-stock' : 
                                isExpiringSoon(item) ? 'expiring' : ''
                            }`}>
                                <td><strong>{item.feed_type || item.medicine_name || item.equipment_name}</strong></td>
                                <td>
                                    <span className="type-badge" style={{backgroundColor: getTypeColor(activeTab)}}>
                                        {activeTab}
                                    </span>
                                </td>
                                <td>
                                    <div className="quantity-info">{item.quantity_kg || item.quantity || '1'}</div>
                                    {isLowStock(item, activeTab) && (
                                        <div className="quantity-warning">
                                            Min: {item.minimum_stock}
                                        </div>
                                    )}
                                </td>
                                <td>{activeTab === 'feed' ? 'kg' : item.unit || 'pieces'}</td>
                                <td>{item.unit_price ? `₹${item.unit_price}` : 'N/A'}</td>
                                <td>{item.supplier || 'N/A'}</td>
                                <td>
                                    {item.purchase_date 
                                        ? new Date(item.purchase_date).toLocaleDateString()
                                        : 'N/A'
                                    }
                                </td>
                                <td>
                                    {item.expiry_date ? (
                                        <div>
                                            {new Date(item.expiry_date).toLocaleDateString()}
                                            {isExpiringSoon(item) && (
                                                <div className="expiry-warning">
                                                    Expiring Soon!
                                                </div>
                                            )}
                                        </div>
                                    ) : 'N/A'}
                                </td>
                                <td>{item.farm_name}</td>
                                <td>{item.location || 'N/A'}</td>
                                <td>
                                    {isLowStock(item, activeTab) && (
                                        <span className="status-badge low-stock">Low Stock</span>
                                    )}
                                    {isExpiringSoon(item) && (
                                        <span className="status-badge expiring">Expiring</span>
                                    )}
                                    {activeTab === 'equipment' && item.condition_status && (
                                        <span className={`status-badge ${item.condition_status}`}>
                                            {item.condition_status}
                                        </span>
                                    )}
                                    {!isLowStock(item, activeTab) && !isExpiringSoon(item) && activeTab !== 'equipment' && (
                                        <span className="status-badge good">Good</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {getCurrentInventory().length === 0 && (
                    <div className="empty-state">
                        <h3>No {activeTab} inventory found</h3>
                        <p>
                            {selectedFarm || showLowStock
                                ? "No items match your current filters."
                                : `Click 'Add ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}' to add your first item.`
                            }
                        </p>
                        {error && (
                            <div style={{marginTop: '10px', padding: '10px', background: 'rgba(220, 53, 69, 0.1)', borderRadius: '5px'}}>
                                <strong>Debug Info:</strong> {error}
                            </div>
                        )}
                        <div style={{marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)'}}>
                            <p>Debug: Feed items: {feedInventory.length}, Medicine: {medicineInventory.length}, Equipment: {equipmentInventory.length}</p>
                            <p>Active tab: {activeTab}, Selected farm: {selectedFarm || 'All'}, Show low stock: {showLowStock ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inventory;
