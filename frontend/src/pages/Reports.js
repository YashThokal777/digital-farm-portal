import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Reports = () => {
    const [farms, setFarms] = useState([]);
    const [selectedFarm, setSelectedFarm] = useState('');
    const [reportType, setReportType] = useState('overview');
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [reportData, setReportData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchFarms();
    }, []);

    const fetchFarms = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required. Please log in.');
                return;
            }

            const response = await axios.get('/api/farms', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Farms API response:', response.data);
            
            const farms = response.data.farms || [];
            setFarms(farms);
            
            if (farms.length > 0) {
                setSelectedFarm(farms[0].id);
            } else {
                setError('No farms found. Please create a farm first.');
            }
        } catch (error) {
            console.error('Error fetching farms:', error);
            if (error.response?.status === 401) {
                setError('Authentication failed. Please log in again.');
            } else if (error.response?.status === 403) {
                setError('Access denied. You may not have permission to view farms.');
            } else {
                setError(`Failed to load farms: ${error.response?.data?.error || error.message}`);
            }
        }
    };

    const generateReport = useCallback(async () => {
        if (!selectedFarm) return;
        
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${token}`
            };

            let reportResponse;
            
            // Generate farm-specific mock data
            const farmDataMap = {
                1: { // Sunrise Poultry Farm
                    animals: [
                        { id: 1, tag_number: 'CH001', species: 'chicken', breed: 'Rhode Island Red', gender: 'female', birth_date: '2023-01-15', weight: 2.5, health_status: 'healthy', location: 'Coop A' },
                        { id: 2, tag_number: 'CH002', species: 'chicken', breed: 'Leghorn', gender: 'male', birth_date: '2023-01-20', weight: 3.2, health_status: 'healthy', location: 'Coop A' },
                        { id: 3, tag_number: 'CH003', species: 'chicken', breed: 'Rhode Island Red', gender: 'female', birth_date: '2023-02-01', weight: 2.8, health_status: 'healthy', location: 'Coop B' }
                    ],
                    health: [
                        { id: 1, animal_id: 1, animal_tag: 'CH001', record_type: 'vaccination', description: 'Newcastle Disease Vaccine', treatment: 'Vaccination', veterinarian: 'Dr. Mehta', record_date: '2023-02-01' },
                        { id: 2, animal_id: 2, animal_tag: 'CH002', record_type: 'checkup', description: 'Routine health checkup', treatment: 'General examination', veterinarian: 'Dr. Mehta', record_date: '2023-02-15' }
                    ],
                    inventory: [
                        { id: 1, item_name: 'Layer Feed', category: 'feed', quantity: 500, unit: 'kg', cost_per_unit: 25.50, supplier: 'Godrej Agrovet', expiry_date: '2023-09-01' },
                        { id: 2, item_name: 'Multivitamin', category: 'medicine', quantity: 50, unit: 'bottles', cost_per_unit: 120.00, supplier: 'Vetcare India', expiry_date: '2024-02-15' }
                    ],
                    biosecurity: [
                        { id: 1, task_type: 'cleaning', area: 'Coop A', description: 'Daily cleaning and sanitization', status: 'completed', scheduled_date: '2023-03-16' },
                        { id: 2, task_type: 'disinfection', area: 'Entry Gate', description: 'Disinfect entry area and footbaths', status: 'pending', scheduled_date: '2023-03-16' }
                    ]
                },
                2: { // Golden Pig Farm
                    animals: [
                        { id: 4, tag_number: 'PG001', species: 'pig', breed: 'Yorkshire', gender: 'female', birth_date: '2022-08-10', weight: 85.5, health_status: 'healthy', location: 'Pen 1' },
                        { id: 5, tag_number: 'PG002', species: 'pig', breed: 'Duroc', gender: 'male', birth_date: '2022-07-15', weight: 95.2, health_status: 'healthy', location: 'Pen 2' }
                    ],
                    health: [
                        { id: 3, animal_id: 4, animal_tag: 'PG001', record_type: 'treatment', description: 'Respiratory infection treatment', treatment: 'Antibiotic course', veterinarian: 'Dr. Verma', record_date: '2023-03-01' }
                    ],
                    inventory: [
                        { id: 3, item_name: 'Pig Starter Feed', category: 'feed', quantity: 800, unit: 'kg', cost_per_unit: 32.00, supplier: 'Cargill India', expiry_date: '2023-12-05' },
                        { id: 4, item_name: 'Pig Antibiotics', category: 'medicine', quantity: 25, unit: 'bottles', cost_per_unit: 180.00, supplier: 'Vetcare India', expiry_date: '2024-06-15' }
                    ],
                    biosecurity: [
                        { id: 3, task_type: 'cleaning', area: 'Pen 1', description: 'Clean pig pens and feeding areas', status: 'completed', scheduled_date: '2023-03-16' },
                        { id: 4, task_type: 'disinfection', area: 'Pen 2', description: 'Disinfect pig housing areas', status: 'pending', scheduled_date: '2023-03-17' }
                    ]
                },
                3: { // Green Valley Dairy
                    animals: [
                        { id: 6, tag_number: 'CT001', species: 'cow', breed: 'Holstein', gender: 'female', birth_date: '2021-05-20', weight: 450.0, health_status: 'healthy', location: 'Barn A' },
                        { id: 7, tag_number: 'CT002', species: 'cow', breed: 'Jersey', gender: 'female', birth_date: '2021-06-10', weight: 380.5, health_status: 'healthy', location: 'Barn A' }
                    ],
                    health: [
                        { id: 4, animal_id: 6, animal_tag: 'CT001', record_type: 'vaccination', description: 'FMD Vaccination', treatment: 'Vaccination', veterinarian: 'Dr. Joshi', record_date: '2023-01-20' }
                    ],
                    inventory: [
                        { id: 5, item_name: 'Cattle Feed', category: 'feed', quantity: 1200, unit: 'kg', cost_per_unit: 28.75, supplier: 'Amul Feeds', expiry_date: '2023-11-28' },
                        { id: 6, item_name: 'Calcium Supplement', category: 'medicine', quantity: 30, unit: 'bottles', cost_per_unit: 95.00, supplier: 'Dairy Care', expiry_date: '2024-08-15' }
                    ],
                    biosecurity: [
                        { id: 5, task_type: 'maintenance', area: 'Milking Parlor', description: 'Check and clean milking equipment', status: 'pending', scheduled_date: '2023-03-17' },
                        { id: 6, task_type: 'cleaning', area: 'Barn A', description: 'Clean cattle housing and feeding areas', status: 'completed', scheduled_date: '2023-03-16' }
                    ]
                }
            };

            const mockData = farmDataMap[selectedFarm] || farmDataMap[1];
            setReportData(mockData);
        } catch (error) {
            console.error('Error generating report:', error);
            setError('Failed to generate report');
        } finally {
            setLoading(false);
        }
    }, [selectedFarm, reportType, dateRange]);

    useEffect(() => {
        generateReport();
    }, [selectedFarm, reportType, dateRange, generateReport]);

    const exportReport = () => {
        const farmName = farms.find(f => f.id == selectedFarm)?.name || 'Farm';
        const reportContent = generateReportContent();
        
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${farmName}_${reportType}_report_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const generateReportContent = () => {
        const farm = farms.find(f => f.id == selectedFarm);
        let content = `FARM REPORT - ${farm?.name || 'Unknown Farm'}\n`;
        content += `Generated: ${new Date().toLocaleString()}\n`;
        content += `Report Type: ${reportType.toUpperCase()}\n`;
        content += `Date Range: ${dateRange.start} to ${dateRange.end}\n\n`;

        if (reportType === 'overview') {
            content += `OVERVIEW SUMMARY\n`;
            content += `================\n`;
            content += `Total Animals: ${reportData.animals?.length || 0}\n`;
            content += `Healthy Animals: ${reportData.animals?.filter(animal => animal.health_status === 'healthy').length || 0}\n`;
            content += `Health Records: ${reportData.health?.length || 0}\n`;
            content += `Inventory Items: ${reportData.inventory?.length || 0}\n`;
            content += `Low Stock Items: ${reportData.inventory?.filter(item => item.quantity === 0 || item.quantity < item.reorder_level).length || 0}\n`;
            content += `Biosecurity Tasks: ${reportData.biosecurity?.length || 0}\n\n`;
        }

        return content;
    };

    const renderOverviewReport = () => {
        const { animals = [], health = [], inventory = [], biosecurity = [] } = reportData;

        const animalsBySpecies = animals.reduce((acc, animal) => {
            acc[animal.species] = (acc[animal.species] || 0) + 1;
            return acc;
        }, {});

        const healthByType = health.reduce((acc, record) => {
            acc[record.record_type] = (acc[record.record_type] || 0) + 1;
            return acc;
        }, {});

        const inventoryByCategory = inventory.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {});

        const biosecurityByStatus = biosecurity.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {});

        const healthyCount = animals.filter(animal => animal.health_status === 'healthy').length;
        const lowStockItems = inventory.filter(item => item.quantity === 0 || item.quantity < item.reorder_level).length;

        return (
            <div className="report-content">
                <div className="report-summary">
                    <div className="summary-card">
                        <h3>📊 Farm Overview</h3>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-number">{animals.length}</span>
                                <span className="stat-label">Total Animals</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{healthyCount}</span>
                                <span className="stat-label">Healthy Animals</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{health.length}</span>
                                <span className="stat-label">Health Records</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{inventory.length}</span>
                                <span className="stat-label">Inventory Items</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{lowStockItems}</span>
                                <span className="stat-label">Low Stock Items</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{biosecurity.length}</span>
                                <span className="stat-label">Security Tasks</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="report-sections">
                    <div className="report-section">
                        <h4>🐄 Animals by Species</h4>
                        <div className="breakdown-list">
                            {Object.entries(animalsBySpecies).map(([species, count]) => (
                                <div key={species} className="breakdown-item">
                                    <span className="breakdown-label">{species}</span>
                                    <span className="breakdown-value">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="report-section">
                        <h4>🏥 Health Records by Type</h4>
                        <div className="breakdown-list">
                            {Object.entries(healthByType).map(([type, count]) => (
                                <div key={type} className="breakdown-item">
                                    <span className="breakdown-label">{type}</span>
                                    <span className="breakdown-value">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="report-section">
                        <h4>📦 Inventory by Category</h4>
                        <div className="breakdown-list">
                            {Object.entries(inventoryByCategory).map(([category, count]) => (
                                <div key={category} className="breakdown-item">
                                    <span className="breakdown-label">{category}</span>
                                    <span className="breakdown-value">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="report-section">
                        <h4>🛡️ Biosecurity Tasks by Status</h4>
                        <div className="breakdown-list">
                            {Object.entries(biosecurityByStatus).map(([status, count]) => (
                                <div key={status} className="breakdown-item">
                                    <span className="breakdown-label">{status.replace('_', ' ')}</span>
                                    <span className="breakdown-value">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderAnimalReport = () => {
        const { animals = [] } = reportData;
        
        return (
            <div className="report-content">
                <h3>🐄 Animal Report</h3>
                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Tag Number</th>
                                <th>Species</th>
                                <th>Breed</th>
                                <th>Gender</th>
                                <th>Age (Days)</th>
                                <th>Weight (kg)</th>
                                <th>Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {animals.map(animal => (
                                <tr key={animal.id}>
                                    <td>{animal.tag_number}</td>
                                    <td>{animal.species}</td>
                                    <td>{animal.breed || 'N/A'}</td>
                                    <td>{animal.gender}</td>
                                    <td>
                                        {animal.birth_date 
                                            ? Math.floor((new Date() - new Date(animal.birth_date)) / (1000 * 60 * 60 * 24))
                                            : 'N/A'
                                        }
                                    </td>
                                    <td>{animal.weight || 'N/A'}</td>
                                    <td>{animal.location || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderHealthReport = () => {
        const { health = [] } = reportData;
        
        return (
            <div className="report-content">
                <h3>🏥 Health Report</h3>
                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Animal</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Treatment</th>
                                <th>Veterinarian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {health.map(record => (
                                <tr key={record.id}>
                                    <td>{new Date(record.record_date).toLocaleDateString()}</td>
                                    <td>{record.animal_tag || `ID: ${record.animal_id}`}</td>
                                    <td>{record.record_type}</td>
                                    <td>{record.description}</td>
                                    <td>{record.treatment || 'N/A'}</td>
                                    <td>{record.veterinarian || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderInventoryReport = () => {
        const { inventory = [] } = reportData;
        
        return (
            <div className="report-content">
                <h3>📦 Inventory Report</h3>
                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Unit</th>
                                <th>Cost/Unit</th>
                                <th>Supplier</th>
                                <th>Expiry Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map(item => (
                                <tr key={item.id}>
                                    <td>{item.item_name}</td>
                                    <td>{item.category}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.unit}</td>
                                    <td>₹{item.cost_per_unit || 'N/A'}</td>
                                    <td>{item.supplier || 'N/A'}</td>
                                    <td>
                                        {item.expiry_date 
                                            ? new Date(item.expiry_date).toLocaleDateString()
                                            : 'N/A'
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="container">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="loading-spinner"></div>
                    <p>Generating report...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>📊 Reports & Analytics</h1>
                <button onClick={exportReport} className="btn btn-success">
                    📥 Export Report
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="report-controls">
                {farms.length > 0 && (
                    <div className="form-group">
                        <label className="form-label">Select Farm</label>
                        <select
                            value={selectedFarm}
                            onChange={(e) => setSelectedFarm(e.target.value)}
                            className="form-control"
                        >
                            {farms.map(farm => (
                                <option key={farm.id} value={farm.id}>
                                    {farm.name} - {farm.location}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">Report Type</label>
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="form-control"
                    >
                        <option value="overview">📊 Overview</option>
                        <option value="animals">🐄 Animals</option>
                        <option value="health">🏥 Health</option>
                        <option value="inventory">📦 Inventory</option>
                    </select>
                </div>

                <div className="date-range">
                    <div className="form-group">
                        <label className="form-label">Start Date</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">End Date</label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                            className="form-control"
                        />
                    </div>
                </div>
            </div>

            <div className="report-container">
                {reportType === 'overview' && renderOverviewReport()}
                {reportType === 'animals' && renderAnimalReport()}
                {reportType === 'health' && renderHealthReport()}
                {reportType === 'inventory' && renderInventoryReport()}
            </div>

            <style jsx>{`
                .report-controls {
                    display: grid;
                    grid-template-columns: 1fr 1fr 2fr;
                    gap: var(--space-lg);
                    margin-bottom: var(--space-xl);
                    padding: var(--space-lg);
                    background: rgba(26, 26, 46, 0.85);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--glass-shadow);
                    color: var(--text-primary);
                }
                .date-range {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--space-md);
                }
                .report-container {
                    background: rgba(26, 26, 46, 0.85);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--glass-shadow);
                    padding: var(--space-xl);
                    color: var(--text-primary);
                    transition: var(--transition-normal);
                }
                .report-container:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-heavy);
                }
                .report-summary {
                    margin-bottom: var(--space-xl);
                }
                .summary-card {
                    background: rgba(22, 33, 62, 0.8);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    padding: var(--space-xl);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-light);
                    position: relative;
                    overflow: hidden;
                }
                .summary-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: var(--space-lg);
                    margin-top: var(--space-lg);
                }
                .stat-item {
                    text-align: center;
                    padding: var(--space-md);
                    background: rgba(26, 26, 46, 0.9);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-md);
                    transition: var(--transition-normal);
                    position: relative;
                    overflow: hidden;
                }
                .stat-item:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-glow);
                }
                .stat-number {
                    display: block;
                    font-size: 2rem;
                    font-weight: 800;
                    background: var(--primary-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: var(--space-xs);
                }
                .stat-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }
                .report-sections {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: var(--space-xl);
                }
                .report-section {
                    background: rgba(22, 33, 62, 0.8);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    padding: var(--space-lg);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-light);
                    transition: var(--transition-normal);
                    position: relative;
                    overflow: hidden;
                }
                .report-section:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-heavy);
                }
                .report-section h4 {
                    color: var(--text-primary);
                    margin-bottom: var(--space-md);
                    font-weight: 700;
                }
                .breakdown-list {
                    display: grid;
                    gap: var(--space-sm);
                    margin-top: var(--space-md);
                }
                .breakdown-item {
                    display: flex;
                    justify-content: space-between;
                    padding: var(--space-sm) var(--space-md);
                    background: rgba(26, 26, 46, 0.9);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-sm);
                    transition: var(--transition-fast);
                }
                .breakdown-item:hover {
                    background: rgba(102, 126, 234, 0.15);
                    transform: translateX(5px);
                }
                .breakdown-label {
                    text-transform: capitalize;
                    color: var(--text-secondary);
                    font-weight: 500;
                }
                .breakdown-value {
                    font-weight: 700;
                    background: var(--primary-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .data-table {
                    overflow-x: auto;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--glass-border);
                    background: rgba(26, 26, 46, 0.85);
                    backdrop-filter: blur(20px);
                }
                .data-table table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 0;
                }
                .data-table th,
                .data-table td {
                    padding: var(--space-md);
                    text-align: left;
                    border-bottom: 1px solid var(--glass-border);
                    color: var(--text-primary);
                }
                .data-table th {
                    background: rgba(102, 126, 234, 0.2);
                    font-weight: 600;
                    color: var(--text-primary);
                    border-bottom: 2px solid var(--glass-border);
                    text-transform: uppercase;
                    font-size: 0.875rem;
                    letter-spacing: 0.5px;
                }
                .data-table tbody tr {
                    background: rgba(26, 26, 46, 0.6);
                    transition: var(--transition-fast);
                }
                .data-table tbody tr:hover {
                    background: rgba(102, 126, 234, 0.15);
                    transform: translateY(-1px);
                }
                .data-table tbody tr:nth-child(even) {
                    background: rgba(26, 26, 46, 0.8);
                }
                .data-table tbody tr:nth-child(even):hover {
                    background: rgba(102, 126, 234, 0.15);
                }
                .data-table tbody tr:last-child td {
                    border-bottom: none;
                }
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid var(--glass-border);
                    border-radius: 50%;
                    border-top-color: #667eea;
                    animation: spin 1s ease-in-out infinite;
                    margin: 0 auto var(--space-lg);
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @media (max-width: 768px) {
                    .report-controls {
                        grid-template-columns: 1fr;
                        padding: var(--space-md);
                    }
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: var(--space-md);
                    }
                    .report-sections {
                        grid-template-columns: 1fr;
                        gap: var(--space-lg);
                    }
                    .report-container {
                        padding: var(--space-lg);
                    }
                    .summary-card {
                        padding: var(--space-lg);
                    }
                    .data-table th,
                    .data-table td {
                        padding: var(--space-sm);
                    }
                }
            `}</style>
        </div>
    );
};

export default Reports;
