import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
        fetchAlerts();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/dashboard');
            setDashboardData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchAlerts = async () => {
        try {
            const response = await axios.get('/dashboard/alerts');
            setAlerts(response.data.alerts || []);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        }
    };

    const renderSystemAdminDashboard = () => (
        <div className="dashboard-grid">
            <div className="stat-card">
                <div className="stat-icon">🏢</div>
                <div className="stat-content">
                    <h3>Total Farms</h3>
                    <div className="stat-number">{dashboardData?.farms?.total_farms || 0}</div>
                    <div className="stat-detail">
                        {dashboardData?.farms?.active_farms || 0} active
                    </div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                    <h3>System Users</h3>
                    <div className="stat-number">
                        {dashboardData?.users?.reduce((sum, u) => sum + u.count, 0) || 0}
                    </div>
                    <div className="stat-detail">Across all roles</div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon">🐄</div>
                <div className="stat-content">
                    <h3>Total Animals</h3>
                    <div className="stat-number">
                        {dashboardData?.animals?.reduce((sum, a) => sum + a.count, 0) || 0}
                    </div>
                    <div className="stat-detail">All species</div>
                </div>
            </div>

            <div className="chart-card">
                <h3>User Distribution by Role</h3>
                <div className="role-stats">
                    {dashboardData?.users?.map((roleData, index) => (
                        <div key={index} className="role-stat">
                            <span className="role-name">
                                {roleData.role.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="role-count">{roleData.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chart-card">
                <h3>Animal Distribution</h3>
                <div className="animal-stats">
                    {dashboardData?.animals?.map((animalData, index) => (
                        <div key={index} className="animal-stat">
                            <span className="animal-species">
                                {animalData.species.charAt(0).toUpperCase() + animalData.species.slice(1)}
                            </span>
                            <span className="animal-count">{animalData.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderFarmOwnerDashboard = () => (
        <div className="dashboard-grid">
            <div className="stat-card">
                <div className="stat-icon">🏢</div>
                <div className="stat-content">
                    <h3>My Farms</h3>
                    <div className="stat-number">{dashboardData?.stats?.total_farms || 0}</div>
                    <div className="stat-detail">Owned properties</div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon">🐄</div>
                <div className="stat-content">
                    <h3>Total Animals</h3>
                    <div className="stat-number">{dashboardData?.stats?.total_animals || 0}</div>
                    <div className="stat-detail">Across all farms</div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                    <h3>Staff Members</h3>
                    <div className="stat-number">{dashboardData?.stats?.total_staff || 0}</div>
                    <div className="stat-detail">Managers & workers</div>
                </div>
            </div>

            <div className="farms-overview">
                <h3>Farm Portfolio</h3>
                <div className="farms-grid">
                    {dashboardData?.farms?.map((farm) => (
                        <div key={farm.id} className="farm-card">
                            <h4>{farm.name}</h4>
                            <p className="farm-location">{farm.location}</p>
                            <div className="farm-stats">
                                <span>🐄 {farm.animal_count} animals</span>
                                <span>👥 {farm.staff_count} staff</span>
                            </div>
                            <div className="farm-type">
                                <span className={`badge badge-${farm.farm_type}`}>
                                    {farm.farm_type}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderFarmManagerDashboard = () => (
        <div className="dashboard-grid">
            <div className="stat-card">
                <div className="stat-icon">🏢</div>
                <div className="stat-content">
                    <h3>Assigned Farms</h3>
                    <div className="stat-number">{dashboardData?.farms?.length || 0}</div>
                    <div className="stat-detail">Under management</div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon">✓</div>
                <div className="stat-content">
                    <h3>Pending Tasks</h3>
                    <div className="stat-number">{dashboardData?.pending_tasks || 0}</div>
                    <div className="stat-detail">Require attention</div>
                </div>
            </div>

            <div className="recent-health">
                <h3>Recent Health Records</h3>
                <div className="health-list">
                    {dashboardData?.recent_health?.slice(0, 5).map((record) => (
                        <div key={record.id} className="health-item">
                            <div className="health-info">
                                <span className="animal-tag">{record.tag_number}</span>
                                <span className="health-type">{record.record_type}</span>
                            </div>
                            <div className="health-farm">{record.farm_name}</div>
                            <div className="health-date">
                                {new Date(record.record_date).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="farms-overview">
                <h3>Managed Farms</h3>
                <div className="farms-grid">
                    {dashboardData?.farms?.map((farm) => (
                        <div key={farm.id} className="farm-card">
                            <h4>{farm.name}</h4>
                            <p className="farm-location">{farm.location}</p>
                            <div className="farm-stats">
                                <span>🐄 {farm.animal_count} animals</span>
                            </div>
                            <div className="farm-type">
                                <span className={`badge badge-${farm.farm_type}`}>
                                    {farm.farm_type}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderFarmWorkerDashboard = () => (
        <div className="dashboard-grid worker-dashboard">
            <div className="stat-card">
                <div className="stat-icon">✓</div>
                <div className="stat-content">
                    <h3>My Tasks</h3>
                    <div className="stat-number">{dashboardData?.my_tasks?.length || 0}</div>
                    <div className="stat-detail">Assigned to me</div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                    <h3>Completed Today</h3>
                    <div className="stat-number">{dashboardData?.completed_today || 0}</div>
                    <div className="stat-detail">Tasks finished</div>
                </div>
            </div>

            <div className="tasks-overview">
                <h3>My Pending Tasks</h3>
                <div className="tasks-list">
                    {dashboardData?.my_tasks?.map((task) => (
                        <div key={task.id} className="task-item">
                            <div className="task-info">
                                <h4>{task.description}</h4>
                                <p>{task.area} - {task.farm_name}</p>
                            </div>
                            <div className="task-meta">
                                <span className={`badge badge-${task.task_type}`}>
                                    {task.task_type}
                                </span>
                                <span className="task-date">
                                    {new Date(task.scheduled_date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                    <button className="action-btn" onClick={() => navigate('/biosecurity/visitors')}>
                        📝 Register Visitor
                    </button>
                    <button className="action-btn" onClick={() => navigate('/biosecurity/environmental')}>
                        🌡️ Log Environment
                    </button>
                    <button className="action-btn" onClick={() => navigate('/animals')}>
                        🐄 Animal Check
                    </button>
                    <button className="action-btn" onClick={() => navigate('/biosecurity')}>
                        🧹 View Tasks
                    </button>
                </div>
            </div>
        </div>
    );

    const renderDashboardContent = () => {
        if (!dashboardData) return null;

        switch (user?.role) {
            case 'system_admin':
                return renderSystemAdminDashboard();
            case 'farm_owner':
                return renderFarmOwnerDashboard();
            case 'farm_manager':
                return renderFarmManagerDashboard();
            case 'farm_worker':
                return renderFarmWorkerDashboard();
            default:
                return <div>Unknown role</div>;
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="alert alert-error">{error}</div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <h1>
                        Welcome back, {user?.first_name} {user?.last_name}
                    </h1>
                    <p className="role-badge">
                        {user?.role?.replace('_', ' ').toUpperCase()}
                    </p>
                </div>

                {alerts.length > 0 && (
                    <div className="alerts-section">
                        <h3>🚨 Alerts & Notifications</h3>
                        <div className="alerts-list">
                            {alerts.slice(0, 3).map((alert, index) => (
                                <div key={index} className={`alert alert-${alert.severity}`}>
                                    <strong>{alert.type.replace('_', ' ').toUpperCase()}:</strong> {alert.message}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {renderDashboardContent()}
            </div>
        </div>
    );
};

export default Dashboard;
