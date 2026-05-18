import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Portfolio = () => {
    const [farms, setFarms] = useState([]);
    const [portfolioStats, setPortfolioStats] = useState({
        totalFarms: 0,
        totalAnimals: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        profitMargin: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTimeframe, setSelectedTimeframe] = useState('monthly');

    useEffect(() => {
        fetchPortfolioData();
    }, [selectedTimeframe]);

    const fetchPortfolioData = async () => {
        setLoading(true);
        setError('');

        try {
            // Fetch all farms owned by the user
            const farmsResponse = await axios.get('/farms');
            const userFarms = farmsResponse.data.farms || [];
            setFarms(userFarms);

            // Calculate portfolio statistics
            let totalAnimals = 0;
            let totalRevenue = 0;
            let totalExpenses = 0;

            // Fetch data for each farm
            for (const farm of userFarms) {
                try {
                    // Get animals count
                    const animalsResponse = await axios.get(`/api/animals?farm_id=${farm.id}`);
                    totalAnimals += animalsResponse.data.animals?.length || 0;

                    // Get inventory for expense calculation
                    const inventoryResponse = await axios.get(`/inventory?farm_id=${farm.id}`);
                    const inventory = inventoryResponse.data.items || [];
                    
                    // Calculate expenses from inventory costs
                    const farmExpenses = inventory.reduce((sum, item) => {
                        return sum + (parseFloat(item.cost_per_unit) * parseFloat(item.quantity) || 0);
                    }, 0);
                    totalExpenses += farmExpenses;

                    // Estimate revenue (simplified calculation)
                    // In a real system, this would come from sales/production data
                    const estimatedRevenue = totalAnimals * 500; // ₹500 per animal per month (example)
                    totalRevenue += estimatedRevenue;
                } catch (farmError) {
                    console.error(`Error fetching data for farm ${farm.id}:`, farmError);
                }
            }

            const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;

            setPortfolioStats({
                totalFarms: userFarms.length,
                totalAnimals,
                totalRevenue,
                totalExpenses,
                profitMargin
            });

        } catch (error) {
            console.error('Error fetching portfolio data:', error);
            setError('Failed to load portfolio data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const getFarmTypeIcon = (type) => {
        const icons = {
            poultry: '🐔',
            pig: '🐷',
            cattle: '🐄',
            mixed: '🏢'
        };
        return icons[type] || '🏢';
    };

    const getPerformanceColor = (value, threshold = 0) => {
        if (value > threshold) return '#27ae60';
        if (value > threshold * 0.5) return '#f39c12';
        return '#e74c3c';
    };

    if (loading) {
        return (
            <div className="container">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="loading-spinner"></div>
                    <p>Loading portfolio data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>💼 Farm Portfolio</h1>
                <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
                    <select
                        value={selectedTimeframe}
                        onChange={(e) => setSelectedTimeframe(e.target.value)}
                        className="form-control"
                    >
                        <option value="weekly">This Week</option>
                        <option value="monthly">This Month</option>
                        <option value="quarterly">This Quarter</option>
                        <option value="yearly">This Year</option>
                    </select>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Portfolio Overview */}
            <div className="portfolio-overview">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">🏢</div>
                        <div className="stat-content">
                            <h3>Total Farms</h3>
                            <div className="stat-number">{portfolioStats.totalFarms}</div>
                            <div className="stat-detail">Active operations</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🐄</div>
                        <div className="stat-content">
                            <h3>Total Animals</h3>
                            <div className="stat-number">{portfolioStats.totalAnimals}</div>
                            <div className="stat-detail">Across all farms</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <h3>Est. Revenue</h3>
                            <div className="stat-number" style={{ color: getPerformanceColor(portfolioStats.totalRevenue, 10000) }}>
                                {formatCurrency(portfolioStats.totalRevenue)}
                            </div>
                            <div className="stat-detail">Current period</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <h3>Profit Margin</h3>
                            <div className="stat-number" style={{ color: getPerformanceColor(portfolioStats.profitMargin, 20) }}>
                                {portfolioStats.profitMargin.toFixed(1)}%
                            </div>
                            <div className="stat-detail">
                                {portfolioStats.profitMargin > 20 ? 'Excellent' : 
                                 portfolioStats.profitMargin > 10 ? 'Good' : 'Needs improvement'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Summary */}
            <div className="financial-summary">
                <div className="card">
                    <h3>💹 Financial Summary</h3>
                    <div className="financial-breakdown">
                        <div className="financial-item">
                            <span className="financial-label">Total Revenue</span>
                            <span className="financial-value positive">
                                {formatCurrency(portfolioStats.totalRevenue)}
                            </span>
                        </div>
                        <div className="financial-item">
                            <span className="financial-label">Total Expenses</span>
                            <span className="financial-value negative">
                                -{formatCurrency(portfolioStats.totalExpenses)}
                            </span>
                        </div>
                        <div className="financial-item total">
                            <span className="financial-label">Net Profit</span>
                            <span className="financial-value" style={{ 
                                color: getPerformanceColor(portfolioStats.totalRevenue - portfolioStats.totalExpenses)
                            }}>
                                {formatCurrency(portfolioStats.totalRevenue - portfolioStats.totalExpenses)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Farms Overview */}
            <div className="farms-portfolio">
                <h3>🏢 Farm Operations</h3>
                {farms.length === 0 ? (
                    <div className="empty-state">
                        <p>No farms found in your portfolio.</p>
                        <button className="btn btn-primary" onClick={() => window.location.href = '/farms'}>
                            Add Your First Farm
                        </button>
                    </div>
                ) : (
                    <div className="farms-grid">
                        {farms.map(farm => (
                            <div key={farm.id} className="farm-portfolio-card">
                                <div className="farm-header">
                                    <div className="farm-icon">
                                        {getFarmTypeIcon(farm.farm_type)}
                                    </div>
                                    <div className="farm-info">
                                        <h4>{farm.name}</h4>
                                        <p>{farm.location}</p>
                                    </div>
                                    <div className="farm-status">
                                        <span className={`status-badge ${farm.is_active ? 'active' : 'inactive'}`}>
                                            {farm.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>

                                <div className="farm-details">
                                    <div className="farm-detail-item">
                                        <span className="detail-label">Type:</span>
                                        <span className="detail-value">{farm.farm_type}</span>
                                    </div>
                                    <div className="farm-detail-item">
                                        <span className="detail-label">Area:</span>
                                        <span className="detail-value">{farm.area_hectares || 'N/A'} hectares</span>
                                    </div>
                                    <div className="farm-detail-item">
                                        <span className="detail-label">Established:</span>
                                        <span className="detail-value">
                                            {farm.established_date 
                                                ? new Date(farm.established_date).getFullYear()
                                                : 'N/A'
                                            }
                                        </span>
                                    </div>
                                    <div className="farm-detail-item">
                                        <span className="detail-label">License:</span>
                                        <span className="detail-value">{farm.license_number || 'Pending'}</span>
                                    </div>
                                </div>

                                <div className="farm-actions">
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={() => window.location.href = `/farms?farm_id=${farm.id}`}
                                    >
                                        View Details
                                    </button>
                                    <button 
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => window.location.href = `/reports?farm_id=${farm.id}`}
                                    >
                                        Reports
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                .portfolio-overview {
                    margin-bottom: 30px;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .stat-card {
                    background: white;
                    padding: 25px;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .stat-icon {
                    font-size: 40px;
                    min-width: 60px;
                }
                .stat-content h3 {
                    margin: 0 0 8px 0;
                    color: #666;
                    font-size: 14px;
                    font-weight: 500;
                }
                .stat-number {
                    font-size: 28px;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 5px;
                }
                .stat-detail {
                    font-size: 12px;
                    color: #95a5a6;
                }
                .financial-summary {
                    margin-bottom: 30px;
                }
                .financial-breakdown {
                    display: grid;
                    gap: 15px;
                    margin-top: 20px;
                }
                .financial-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 0;
                    border-bottom: 1px solid #ecf0f1;
                }
                .financial-item.total {
                    border-bottom: none;
                    border-top: 2px solid #3498db;
                    font-weight: bold;
                    font-size: 18px;
                }
                .financial-label {
                    color: #666;
                }
                .financial-value.positive {
                    color: #27ae60;
                }
                .financial-value.negative {
                    color: #e74c3c;
                }
                .farms-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 25px;
                }
                .farm-portfolio-card {
                    background: white;
                    border-radius: 12px;
                    padding: 25px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    transition: transform 0.2s ease;
                }
                .farm-portfolio-card:hover {
                    transform: translateY(-2px);
                }
                .farm-header {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #ecf0f1;
                }
                .farm-icon {
                    font-size: 32px;
                }
                .farm-info {
                    flex: 1;
                }
                .farm-info h4 {
                    margin: 0 0 5px 0;
                    color: #2c3e50;
                }
                .farm-info p {
                    margin: 0;
                    color: #666;
                    font-size: 14px;
                }
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: bold;
                    text-transform: uppercase;
                }
                .status-badge.active {
                    background: #d5f4e6;
                    color: #27ae60;
                }
                .status-badge.inactive {
                    background: #fadbd8;
                    color: #e74c3c;
                }
                .farm-details {
                    margin-bottom: 20px;
                }
                .farm-detail-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                .detail-label {
                    color: #666;
                    font-size: 14px;
                }
                .detail-value {
                    font-weight: 500;
                    color: #2c3e50;
                    font-size: 14px;
                }
                .farm-actions {
                    display: flex;
                    gap: 10px;
                }
                .btn-sm {
                    padding: 8px 16px;
                    font-size: 12px;
                }
                .empty-state {
                    text-align: center;
                    padding: 50px;
                    color: #666;
                }
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .farms-grid {
                        grid-template-columns: 1fr;
                    }
                    .farm-actions {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
};

export default Portfolio;
