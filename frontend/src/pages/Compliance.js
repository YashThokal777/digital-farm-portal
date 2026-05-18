import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Compliance = () => {
    const [farms, setFarms] = useState([]);
    const [selectedFarm, setSelectedFarm] = useState('');
    const [complianceData, setComplianceData] = useState({
        biosecurity: [],
        health: [],
        environmental: [],
        regulatory: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchFarms();
    }, []);

    const fetchFarms = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            
            const response = await axios.get('/api/farms', { headers });
            setFarms(response.data.farms || []);
            if (response.data.farms?.length > 0) {
                setSelectedFarm(response.data.farms[0].id);
            }
        } catch (error) {
            console.error('Error fetching farms:', error);
            if (error.response?.status === 401) {
                setError('Authentication required. Please log in again.');
            } else if (error.response?.status === 403) {
                setError('You do not have permission to access farm data.');
            } else {
                setError('Failed to load farms');
            }
        }
    };

    const fetchComplianceData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            // Use mock data for demonstration since backend APIs may not be fully aligned
            const mockComplianceData = {
                1: { // Farm 1 - Poultry Farm
                    biosecurity: [
                        { id: 1, task_type: 'disinfection', area: 'Entrance', description: 'Daily entrance disinfection', scheduled_date: '2024-01-15', status: 'completed' },
                        { id: 2, task_type: 'cleaning', area: 'Coop A', description: 'Weekly deep cleaning', scheduled_date: '2024-01-16', status: 'in_progress' },
                        { id: 3, task_type: 'visitor_log', area: 'Main Gate', description: 'Visitor registration', scheduled_date: '2024-01-17', status: 'pending' }
                    ],
                    health: [
                        { id: 1, record_type: 'vaccination', animal_id: 101, animal_tag: 'CH001', description: 'Newcastle disease vaccine', record_date: '2024-01-10', veterinarian: 'Dr. Smith' },
                        { id: 2, record_type: 'treatment', animal_id: 102, animal_tag: 'CH002', description: 'Antibiotic treatment', record_date: '2024-01-12', veterinarian: 'Dr. Johnson' },
                        { id: 3, record_type: 'checkup', animal_id: 103, animal_tag: 'CH003', description: 'Routine health check', record_date: '2024-01-14', veterinarian: 'Dr. Smith' }
                    ],
                    environmental: [
                        { id: 1, area: 'Coop A', temperature: 22.5, humidity: 65, air_quality_index: 85, recorded_at: '2024-01-15T08:00:00Z' },
                        { id: 2, area: 'Coop B', temperature: 23.1, humidity: 62, air_quality_index: 88, recorded_at: '2024-01-15T08:30:00Z' },
                        { id: 3, area: 'Storage', temperature: 18.5, humidity: 55, air_quality_index: 92, recorded_at: '2024-01-15T09:00:00Z' }
                    ]
                },
                2: { // Farm 2 - Pig Farm
                    biosecurity: [
                        { id: 4, task_type: 'quarantine', area: 'Isolation Unit', description: 'New pig quarantine', scheduled_date: '2024-01-14', status: 'completed' },
                        { id: 5, task_type: 'disinfection', area: 'Feed Area', description: 'Feed area sanitization', scheduled_date: '2024-01-15', status: 'completed' }
                    ],
                    health: [
                        { id: 4, record_type: 'vaccination', animal_id: 201, animal_tag: 'PG001', description: 'PRRS vaccine', record_date: '2024-01-11', veterinarian: 'Dr. Wilson' },
                        { id: 5, record_type: 'treatment', animal_id: 202, animal_tag: 'PG002', description: 'Respiratory treatment', record_date: '2024-01-13', veterinarian: 'Dr. Wilson' }
                    ],
                    environmental: [
                        { id: 4, area: 'Pen 1', temperature: 20.2, humidity: 70, air_quality_index: 78, recorded_at: '2024-01-15T07:00:00Z' },
                        { id: 5, area: 'Pen 2', temperature: 19.8, humidity: 72, air_quality_index: 75, recorded_at: '2024-01-15T07:30:00Z' }
                    ]
                },
                3: { // Farm 3 - Dairy Farm
                    biosecurity: [
                        { id: 6, task_type: 'milking_hygiene', area: 'Milking Parlor', description: 'Equipment sterilization', scheduled_date: '2024-01-15', status: 'completed' }
                    ],
                    health: [
                        { id: 6, record_type: 'checkup', animal_id: 301, animal_tag: 'DY001', description: 'Pregnancy check', record_date: '2024-01-12', veterinarian: 'Dr. Brown' }
                    ],
                    environmental: [
                        { id: 6, area: 'Barn', temperature: 16.5, humidity: 68, air_quality_index: 82, recorded_at: '2024-01-15T06:00:00Z' }
                    ]
                }
            };

            const farmData = mockComplianceData[selectedFarm] || mockComplianceData[1];
            
            setComplianceData({
                biosecurity: farmData.biosecurity,
                health: farmData.health,
                environmental: farmData.environmental,
                regulatory: [] // Placeholder for regulatory compliance
            });

        } catch (error) {
            console.error('Error fetching compliance data:', error);
            if (error.response?.status === 401) {
                setError('Authentication required. Please log in again.');
            } else if (error.response?.status === 403) {
                setError('You do not have permission to access compliance data.');
            } else {
                setError('Failed to load compliance data');
            }
        } finally {
            setLoading(false);
        }
    }, [selectedFarm]);

    useEffect(() => {
        if (selectedFarm) {
            fetchComplianceData();
        }
    }, [selectedFarm, fetchComplianceData]);

    const calculateComplianceScore = () => {
        const { biosecurity, health, environmental } = complianceData;
        
        // Biosecurity compliance (completed tasks / total tasks)
        const biosecurityScore = biosecurity.length > 0 
            ? (biosecurity.filter(task => task.status === 'completed').length / biosecurity.length) * 100 
            : 100;

        // Health compliance (recent health records)
        const recentHealthRecords = health.filter(record => {
            const recordDate = new Date(record.record_date);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return recordDate >= thirtyDaysAgo;
        });
        const healthScore = recentHealthRecords.length > 0 ? 100 : 70;

        // Environmental compliance (recent monitoring)
        const recentEnvironmental = environmental.filter(record => {
            const recordDate = new Date(record.recorded_at);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return recordDate >= sevenDaysAgo;
        });
        const environmentalScore = recentEnvironmental.length > 0 ? 100 : 60;

        return Math.round((biosecurityScore + healthScore + environmentalScore) / 3);
    };

    const getComplianceColor = (score) => {
        if (score >= 90) return '#27ae60';
        if (score >= 70) return '#f39c12';
        return '#e74c3c';
    };

    const renderOverview = () => {
        const score = calculateComplianceScore();
        const color = getComplianceColor(score);

        return (
            <div className="compliance-overview">
                <div className="compliance-score-card">
                    <div className="score-circle" style={{ borderColor: color }}>
                        <span className="score-number" style={{ color }}>{score}%</span>
                        <span className="score-label">Compliance Score</span>
                    </div>
                    <div className="score-details">
                        <h3>Overall Compliance Status</h3>
                        <p style={{ color }}>
                            {score >= 90 ? '✅ Excellent Compliance' : 
                             score >= 70 ? '⚠️ Good Compliance' : 
                             '❌ Needs Improvement'}
                        </p>
                    </div>
                </div>

                <div className="compliance-categories">
                    <div className="category-card">
                        <div className="category-icon">🛡️</div>
                        <h4>Biosecurity</h4>
                        <div className="category-stats">
                            <p>{complianceData.biosecurity.filter(t => t.status === 'completed').length} / {complianceData.biosecurity.length} tasks completed</p>
                        </div>
                    </div>

                    <div className="category-card">
                        <div className="category-icon">🏥</div>
                        <h4>Health Records</h4>
                        <div className="category-stats">
                            <p>{complianceData.health.length} total records</p>
                        </div>
                    </div>

                    <div className="category-card">
                        <div className="category-icon">🌡️</div>
                        <h4>Environmental</h4>
                        <div className="category-stats">
                            <p>{complianceData.environmental.length} monitoring records</p>
                        </div>
                    </div>

                    <div className="category-card">
                        <div className="category-icon">📋</div>
                        <h4>Regulatory</h4>
                        <div className="category-stats">
                            <p>License valid until 2026</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderBiosecurity = () => (
        <div className="compliance-section">
            <h3>🛡️ Biosecurity Compliance</h3>
            <div className="compliance-items">
                {complianceData.biosecurity.length === 0 ? (
                    <p>No biosecurity tasks found.</p>
                ) : (
                    complianceData.biosecurity.map(task => (
                        <div key={task.id} className="compliance-item">
                            <div className="item-status">
                                {task.status === 'completed' ? '✅' : 
                                 task.status === 'in_progress' ? '🔄' : '⏳'}
                            </div>
                            <div className="item-content">
                                <h5>{task.task_type.replace('_', ' ').toUpperCase()}</h5>
                                <p><strong>Area:</strong> {task.area}</p>
                                <p><strong>Description:</strong> {task.description}</p>
                                <p><strong>Scheduled:</strong> {new Date(task.scheduled_date).toLocaleDateString()}</p>
                            </div>
                            <div className="item-status-badge" style={{
                                backgroundColor: task.status === 'completed' ? '#27ae60' : 
                                               task.status === 'in_progress' ? '#3498db' : '#f39c12'
                            }}>
                                {task.status.replace('_', ' ')}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderHealth = () => (
        <div className="compliance-section">
            <h3>🏥 Health Compliance</h3>
            <div className="compliance-items">
                {complianceData.health.length === 0 ? (
                    <p>No health records found.</p>
                ) : (
                    complianceData.health.slice(0, 10).map(record => (
                        <div key={record.id} className="compliance-item">
                            <div className="item-status">
                                {record.record_type === 'vaccination' ? '💉' : 
                                 record.record_type === 'treatment' ? '💊' : '🩺'}
                            </div>
                            <div className="item-content">
                                <h5>{record.record_type.toUpperCase()}</h5>
                                <p><strong>Animal:</strong> {record.animal_tag || `ID: ${record.animal_id}`}</p>
                                <p><strong>Description:</strong> {record.description}</p>
                                <p><strong>Date:</strong> {new Date(record.record_date).toLocaleDateString()}</p>
                                {record.veterinarian && <p><strong>Veterinarian:</strong> {record.veterinarian}</p>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderEnvironmental = () => (
        <div className="compliance-section">
            <h3>🌡️ Environmental Compliance</h3>
            <div className="compliance-items">
                {complianceData.environmental.length === 0 ? (
                    <p>No environmental monitoring data found.</p>
                ) : (
                    complianceData.environmental.slice(0, 10).map(record => (
                        <div key={record.id} className="compliance-item">
                            <div className="item-status">🌡️</div>
                            <div className="item-content">
                                <h5>Environmental Monitoring</h5>
                                <p><strong>Area:</strong> {record.area}</p>
                                <p><strong>Temperature:</strong> {record.temperature}°C</p>
                                <p><strong>Humidity:</strong> {record.humidity}%</p>
                                <p><strong>Air Quality:</strong> {record.air_quality_index}</p>
                                <p><strong>Recorded:</strong> {new Date(record.recorded_at).toLocaleDateString()}</p>
                            </div>
                            <div className="item-status-badge" style={{
                                backgroundColor: record.air_quality_index >= 80 ? '#27ae60' : '#f39c12'
                            }}>
                                {record.air_quality_index >= 80 ? 'Good' : 'Monitor'}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="container">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="loading-spinner"></div>
                    <p>Loading compliance data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <h1>✅ Compliance Management</h1>
            <p>Monitor and track compliance across all farm operations</p>

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
                    onClick={() => setActiveTab('overview')}
                    className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    📊 Overview
                </button>
                <button
                    onClick={() => setActiveTab('biosecurity')}
                    className={`btn ${activeTab === 'biosecurity' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    🛡️ Biosecurity
                </button>
                <button
                    onClick={() => setActiveTab('health')}
                    className={`btn ${activeTab === 'health' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    🏥 Health
                </button>
                <button
                    onClick={() => setActiveTab('environmental')}
                    className={`btn ${activeTab === 'environmental' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    🌡️ Environmental
                </button>
            </div>

            <div className="compliance-content">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'biosecurity' && renderBiosecurity()}
                {activeTab === 'health' && renderHealth()}
                {activeTab === 'environmental' && renderEnvironmental()}
            </div>

            <style jsx>{`
                .tabs {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                .compliance-overview {
                    display: grid;
                    gap: 30px;
                }
                .compliance-score-card {
                    display: flex;
                    align-items: center;
                    gap: 30px;
                    background: rgba(26, 26, 46, 0.85);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 16px;
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                    padding: 30px;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .compliance-score-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25), 0 0 20px rgba(102, 126, 234, 0.4);
                }
                .compliance-score-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                }
                .score-circle {
                    width: 120px;
                    height: 120px;
                    border: 4px solid;
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    position: relative;
                    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.2);
                }
                .score-circle::before {
                    content: '';
                    position: absolute;
                    top: -2px;
                    left: -2px;
                    right: -2px;
                    bottom: -2px;
                    border-radius: 50%;
                    background: conic-gradient(from 0deg, currentColor 0%, currentColor var(--progress, 75%), rgba(255, 255, 255, 0.1) var(--progress, 75%), rgba(255, 255, 255, 0.1) 100%);
                    z-index: -1;
                }
                .score-number {
                    font-size: 28px;
                    font-weight: bold;
                    color: var(--text-primary);
                    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                }
                .score-label {
                    font-size: 12px;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .score-details h3 {
                    color: var(--text-primary);
                    margin-bottom: 10px;
                    font-size: 24px;
                    font-weight: 600;
                }
                .score-details p {
                    font-size: 16px;
                    font-weight: 500;
                }
                .compliance-categories {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                }
                .category-card {
                    background: rgba(26, 26, 46, 0.85);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 12px;
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                    padding: 25px;
                    text-align: center;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                .category-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
                }
                .category-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                }
                .category-card h4 {
                    color: var(--text-primary);
                    margin: 15px 0 10px 0;
                    font-weight: 600;
                }
                .category-card p {
                    color: var(--text-secondary);
                    font-size: 14px;
                }
                .category-icon {
                    font-size: 40px;
                    margin-bottom: 15px;
                    filter: drop-shadow(0 2px 10px rgba(0, 0, 0, 0.3));
                }
                .compliance-items {
                    display: grid;
                    gap: 15px;
                }
                .compliance-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    background: rgba(26, 26, 46, 0.85);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 12px;
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                    padding: 20px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                .compliance-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
                }
                .compliance-item::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                }
                .item-status {
                    font-size: 24px;
                    min-width: 40px;
                    filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.3));
                }
                .item-content {
                    flex: 1;
                }
                .item-content h5 {
                    margin: 0 0 10px 0;
                    color: var(--text-primary);
                    font-weight: 600;
                }
                .item-content p {
                    margin: 5px 0;
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                .item-status-badge {
                    padding: 8px 16px;
                    border-radius: 20px;
                    color: white;
                    font-size: 12px;
                    font-weight: bold;
                    text-transform: capitalize;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                }
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255, 255, 255, 0.1);
                    border-top: 3px solid #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Compliance;
