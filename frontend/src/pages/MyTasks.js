import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const MyTasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [newTask, setNewTask] = useState({
        task_type: 'cleaning',
        area: '',
        description: '',
        scheduled_date: ''
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [farms, setFarms] = useState([]);
    const [selectedFarm, setSelectedFarm] = useState('');

    useEffect(() => {
        fetchTasks();
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
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await axios.get('/biosecurity/tasks');
            setTasks(response.data.tasks || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setError('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('/biosecurity/tasks', {
                ...newTask,
                farm_id: selectedFarm,
                assigned_to: user.id
            });

            setNewTask({
                task_type: 'cleaning',
                area: '',
                description: '',
                scheduled_date: ''
            });
            setShowAddForm(false);
            fetchTasks();
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    const updateTaskStatus = async (taskId, status) => {
        try {
            await axios.put(`/biosecurity/tasks/${taskId}`, { status });
            fetchTasks();
        } catch (error) {
            setError('Failed to update task status');
        }
    };

    const getFilteredTasks = () => {
        if (filter === 'all') return tasks;
        return tasks.filter(task => task.status === filter);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#f39c12',
            in_progress: '#3498db',
            completed: '#27ae60',
            overdue: '#e74c3c'
        };
        return colors[status] || '#95a5a6';
    };

    const getTaskTypeIcon = (type) => {
        const icons = {
            cleaning: '🧹',
            disinfection: '🧴',
            maintenance: '🔧',
            inspection: '🔍'
        };
        return icons[type] || '📋';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="container">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="loading-spinner"></div>
                    <p>Loading tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>✓ My Tasks</h1>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="btn btn-primary"
                >
                    {showAddForm ? 'Cancel' : '+ Add Task'}
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {showAddForm && (
                <div className="card" style={{ marginBottom: '30px' }}>
                    <h3>Create New Task</h3>
                    <form onSubmit={handleTaskSubmit}>
                        {farms.length > 0 && (
                            <div className="form-group">
                                <label className="form-label">Farm</label>
                                <select
                                    value={selectedFarm}
                                    onChange={(e) => setSelectedFarm(e.target.value)}
                                    className="form-control"
                                    required
                                >
                                    {farms.map(farm => (
                                        <option key={farm.id} value={farm.id}>
                                            {farm.name} - {farm.location}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">Task Type</label>
                                <select
                                    value={newTask.task_type}
                                    onChange={(e) => setNewTask({...newTask, task_type: e.target.value})}
                                    className="form-control"
                                    required
                                >
                                    <option value="cleaning">Cleaning</option>
                                    <option value="disinfection">Disinfection</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="inspection">Inspection</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Area</label>
                                <input
                                    type="text"
                                    value={newTask.area}
                                    onChange={(e) => setNewTask({...newTask, area: e.target.value})}
                                    className="form-control"
                                    required
                                    placeholder="e.g., Coop A, Pen 1"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                value={newTask.description}
                                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                                className="form-control"
                                required
                                rows="3"
                                placeholder="Describe the task..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Scheduled Date</label>
                            <input
                                type="date"
                                value={newTask.scheduled_date}
                                onChange={(e) => setNewTask({...newTask, scheduled_date: e.target.value})}
                                className="form-control"
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn btn-success" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Task'}
                            </button>
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

            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setFilter('all')}
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        All Tasks ({tasks.length})
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        Pending ({tasks.filter(t => t.status === 'pending').length})
                    </button>
                    <button
                        onClick={() => setFilter('in_progress')}
                        className={`btn ${filter === 'in_progress' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        In Progress ({tasks.filter(t => t.status === 'in_progress').length})
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        Completed ({tasks.filter(t => t.status === 'completed').length})
                    </button>
                </div>
            </div>

            <div className="tasks-grid">
                {getFilteredTasks().length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                        <h3>No tasks found</h3>
                        <p>
                            {filter === 'all' 
                                ? 'No tasks have been created yet.' 
                                : `No ${filter.replace('_', ' ')} tasks found.`
                            }
                        </p>
                    </div>
                ) : (
                    getFilteredTasks().map(task => (
                        <div key={task.id} className="task-card">
                            <div className="task-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '20px' }}>
                                        {getTaskTypeIcon(task.task_type)}
                                    </span>
                                    <h4 style={{ margin: 0, textTransform: 'capitalize' }}>
                                        {task.task_type.replace('_', ' ')}
                                    </h4>
                                </div>
                                <span
                                    className="status-badge"
                                    style={{
                                        backgroundColor: getStatusColor(task.status),
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {task.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="task-content">
                                <p><strong>Area:</strong> {task.area}</p>
                                <p><strong>Description:</strong> {task.description}</p>
                                <p><strong>Scheduled:</strong> {formatDate(task.scheduled_date)}</p>
                                {task.farm_name && (
                                    <p><strong>Farm:</strong> {task.farm_name}</p>
                                )}
                            </div>

                            <div className="task-actions">
                                {task.status === 'pending' && (
                                    <button
                                        onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                        className="btn btn-primary btn-sm"
                                    >
                                        Start Task
                                    </button>
                                )}
                                {task.status === 'in_progress' && (
                                    <button
                                        onClick={() => updateTaskStatus(task.id, 'completed')}
                                        className="btn btn-success btn-sm"
                                    >
                                        Mark Complete
                                    </button>
                                )}
                                {task.status === 'completed' && (
                                    <span style={{ color: '#27ae60', fontWeight: 'bold' }}>
                                        ✅ Completed
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .tasks-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 20px;
                }
                .task-card {
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    border-left: 4px solid #3498db;
                }
                .task-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #ecf0f1;
                }
                .task-content {
                    margin-bottom: 15px;
                }
                .task-content p {
                    margin: 8px 0;
                    font-size: 14px;
                }
                .task-actions {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                .btn-sm {
                    padding: 6px 12px;
                    font-size: 12px;
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
            `}</style>
        </div>
    );
};

export default MyTasks;
