import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Biosecurity = () => {
    const [activeTab, setActiveTab] = useState('visitors');
    const [visitors, setVisitors] = useState([]);
    const [environmentalData, setEnvironmentalData] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form states
    const [showVisitorForm, setShowVisitorForm] = useState(false);
    const [showEnvironmentalForm, setShowEnvironmentalForm] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);

    const [visitorForm, setVisitorForm] = useState({
        farm_id: '',
        visitor_name: '',
        company: '',
        purpose: '',
        contact_number: '',
        temperature: '',
        health_declaration: false,
        areas_visited: '',
        escort_person: '',
        vehicle_number: '',
        notes: ''
    });

    const [environmentalForm, setEnvironmentalForm] = useState({
        farm_id: '',
        area: '',
        temperature: '',
        humidity: '',
        air_quality_index: '',
        water_ph: '',
        feed_quality_score: '',
        notes: ''
    });

    const [taskForm, setTaskForm] = useState({
        farm_id: '',
        task_type: 'cleaning',
        area: '',
        description: '',
        assigned_to: '',
        scheduled_date: ''
    });

    useEffect(() => {
        fetchData();
        fetchFarms();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'visitors') {
                const response = await axios.get('/api/biosecurity/visitors');
                setVisitors(response.data.visitors);
            } else if (activeTab === 'environmental') {
                const response = await axios.get('/api/biosecurity/environmental');
                setEnvironmentalData(response.data.data);
            } else if (activeTab === 'tasks') {
                const response = await axios.get('/api/biosecurity/tasks');
                setTasks(response.data.tasks);
            }
        } catch (error) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const fetchFarms = async () => {
        try {
            const response = await axios.get('/api/farms');
            setFarms(response.data.farms);
        } catch (error) {
            console.error('Failed to fetch farms');
        }
    };

    const handleVisitorSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/biosecurity/visitors', visitorForm);
            setShowVisitorForm(false);
            setVisitorForm({
                farm_id: '',
                visitor_name: '',
                company: '',
                purpose: '',
                contact_number: '',
                temperature: '',
                health_declaration: false,
                areas_visited: '',
                escort_person: '',
                vehicle_number: '',
                notes: ''
            });
            fetchData();
        } catch (error) {
            setError('Failed to register visitor');
        }
    };

    const handleEnvironmentalSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/biosecurity/environmental', environmentalForm);
            setShowEnvironmentalForm(false);
            setEnvironmentalForm({
                farm_id: '',
                area: '',
                temperature: '',
                humidity: '',
                air_quality_index: '',
                water_ph: '',
                feed_quality_score: '',
                notes: ''
            });
            fetchData();
        } catch (error) {
            setError('Failed to record environmental data');
        }
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/biosecurity/tasks', taskForm);
            setShowTaskForm(false);
            setTaskForm({
                farm_id: '',
                task_type: 'cleaning',
                area: '',
                description: '',
                assigned_to: '',
                scheduled_date: ''
            });
            fetchData();
        } catch (error) {
            setError('Failed to create task');
        }
    };

    const checkoutVisitor = async (visitorId) => {
        try {
            await axios.put(`/api/biosecurity/visitors/${visitorId}/checkout`, {
                disinfection_done: true,
                notes: 'Checked out successfully'
            });
            fetchData();
        } catch (error) {
            setError('Failed to checkout visitor');
        }
    };

    const completeTask = async (taskId) => {
        try {
            console.log('Completing task:', taskId);
            const response = await axios.put(`/api/biosecurity/tasks/${taskId}/complete`, {
                notes: 'Task completed'
            });
            console.log('Task completion response:', response.data);
            fetchData();
        } catch (error) {
            console.error('Complete task error:', error.response?.data || error.message);
            setError(`Failed to complete task: ${error.response?.data?.error || error.message}`);
        }
    };

    const getTaskStatusBadge = (status) => {
        const statusColors = {
            pending: 'warning',
            in_progress: 'info',
            completed: 'success',
            overdue: 'danger'
        };
        return `badge badge-${statusColors[status] || 'info'}`;
    };

    const renderVisitors = () => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Visitor Management</h3>
                <button onClick={() => setShowVisitorForm(true)} className="btn btn-primary">
                    Register Visitor
                </button>
            </div>

            {showVisitorForm && (
                <div className="card mb-20">
                    <h4>Register New Visitor</h4>
                    <form onSubmit={handleVisitorSubmit}>
                        <div className="grid grid-3">
                            <div className="form-group">
                                <label className="form-label">Farm *</label>
                                <select
                                    value={visitorForm.farm_id}
                                    onChange={(e) => setVisitorForm({...visitorForm, farm_id: e.target.value})}
                                    className="form-control"
                                    required
                                >
                                    <option value="">Select Farm</option>
                                    {farms.map(farm => (
                                        <option key={farm.id} value={farm.id}>{farm.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Visitor Name *</label>
                                <input
                                    type="text"
                                    value={visitorForm.visitor_name}
                                    onChange={(e) => setVisitorForm({...visitorForm, visitor_name: e.target.value})}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Company</label>
                                <input
                                    type="text"
                                    value={visitorForm.company}
                                    onChange={(e) => setVisitorForm({...visitorForm, company: e.target.value})}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Purpose *</label>
                                <input
                                    type="text"
                                    value={visitorForm.purpose}
                                    onChange={(e) => setVisitorForm({...visitorForm, purpose: e.target.value})}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Contact Number</label>
                                <input
                                    type="tel"
                                    value={visitorForm.contact_number}
                                    onChange={(e) => setVisitorForm({...visitorForm, contact_number: e.target.value})}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Temperature (°F)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={visitorForm.temperature}
                                    onChange={(e) => setVisitorForm({...visitorForm, temperature: e.target.value})}
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={visitorForm.health_declaration}
                                    onChange={(e) => setVisitorForm({...visitorForm, health_declaration: e.target.checked})}
                                />
                                Health Declaration (No symptoms, no recent travel to affected areas)
                            </label>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button type="submit" className="btn btn-success">Register Visitor</button>
                            <button type="button" onClick={() => setShowVisitorForm(false)} className="btn btn-secondary">
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
                            <th>Name</th>
                            <th>Company</th>
                            <th>Purpose</th>
                            <th>Entry Time</th>
                            <th>Temperature</th>
                            <th>Health Check</th>
                            <th>Farm</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visitors.map((visitor) => (
                            <tr key={visitor.id}>
                                <td><strong>{visitor.visitor_name}</strong></td>
                                <td>{visitor.company || 'N/A'}</td>
                                <td>{visitor.purpose}</td>
                                <td>{new Date(visitor.entry_time).toLocaleString()}</td>
                                <td>{visitor.temperature ? `${visitor.temperature}°F` : 'N/A'}</td>
                                <td>
                                    <span className={`badge ${visitor.health_declaration ? 'badge-success' : 'badge-warning'}`}>
                                        {visitor.health_declaration ? 'Cleared' : 'Pending'}
                                    </span>
                                </td>
                                <td>{visitor.farm_name}</td>
                                <td>
                                    <span className={`badge ${visitor.exit_time ? 'badge-success' : 'badge-info'}`}>
                                        {visitor.exit_time ? 'Checked Out' : 'On Site'}
                                    </span>
                                </td>
                                <td>
                                    {!visitor.exit_time && (
                                        <button
                                            onClick={() => checkoutVisitor(visitor.id)}
                                            className="btn btn-warning"
                                            style={{ fontSize: '12px', padding: '4px 8px' }}
                                        >
                                            Check Out
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderEnvironmental = () => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Environmental Monitoring</h3>
                <button onClick={() => setShowEnvironmentalForm(true)} className="btn btn-primary">
                    Record Data
                </button>
            </div>

            {showEnvironmentalForm && (
                <div className="card mb-20">
                    <h4>Record Environmental Data</h4>
                    <form onSubmit={handleEnvironmentalSubmit}>
                        <div className="grid grid-3">
                            <div className="form-group">
                                <label className="form-label">Farm *</label>
                                <select
                                    value={environmentalForm.farm_id}
                                    onChange={(e) => setEnvironmentalForm({...environmentalForm, farm_id: e.target.value})}
                                    className="form-control"
                                    required
                                >
                                    <option value="">Select Farm</option>
                                    {farms.map(farm => (
                                        <option key={farm.id} value={farm.id}>{farm.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Area *</label>
                                <input
                                    type="text"
                                    value={environmentalForm.area}
                                    onChange={(e) => setEnvironmentalForm({...environmentalForm, area: e.target.value})}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Temperature (°C)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={environmentalForm.temperature}
                                    onChange={(e) => setEnvironmentalForm({...environmentalForm, temperature: e.target.value})}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Humidity (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={environmentalForm.humidity}
                                    onChange={(e) => setEnvironmentalForm({...environmentalForm, humidity: e.target.value})}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Air Quality Index</label>
                                <input
                                    type="number"
                                    value={environmentalForm.air_quality_index}
                                    onChange={(e) => setEnvironmentalForm({...environmentalForm, air_quality_index: e.target.value})}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Water pH</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={environmentalForm.water_ph}
                                    onChange={(e) => setEnvironmentalForm({...environmentalForm, water_ph: e.target.value})}
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button type="submit" className="btn btn-success">Record Data</button>
                            <button type="button" onClick={() => setShowEnvironmentalForm(false)} className="btn btn-secondary">
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
                            <th>Date/Time</th>
                            <th>Farm</th>
                            <th>Area</th>
                            <th>Temperature</th>
                            <th>Humidity</th>
                            <th>Air Quality</th>
                            <th>Water pH</th>
                            <th>Recorded By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {environmentalData.map((data) => (
                            <tr key={data.id}>
                                <td>{new Date(data.recorded_at).toLocaleString()}</td>
                                <td>{data.farm_name}</td>
                                <td>{data.area}</td>
                                <td>{data.temperature ? `${data.temperature}°C` : 'N/A'}</td>
                                <td>{data.humidity ? `${data.humidity}%` : 'N/A'}</td>
                                <td>{data.air_quality_index || 'N/A'}</td>
                                <td>{data.water_ph || 'N/A'}</td>
                                <td>{data.first_name} {data.last_name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderTasks = () => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Biosecurity Tasks</h3>
                <button onClick={() => setShowTaskForm(true)} className="btn btn-primary">
                    Create Task
                </button>
            </div>

            {showTaskForm && (
                <div className="card mb-20">
                    <h4>Create Biosecurity Task</h4>
                    <form onSubmit={handleTaskSubmit}>
                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">Farm *</label>
                                <select
                                    value={taskForm.farm_id}
                                    onChange={(e) => setTaskForm({...taskForm, farm_id: e.target.value})}
                                    className="form-control"
                                    required
                                >
                                    <option value="">Select Farm</option>
                                    {farms.map(farm => (
                                        <option key={farm.id} value={farm.id}>{farm.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Task Type *</label>
                                <select
                                    value={taskForm.task_type}
                                    onChange={(e) => setTaskForm({...taskForm, task_type: e.target.value})}
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
                                <label className="form-label">Area *</label>
                                <input
                                    type="text"
                                    value={taskForm.area}
                                    onChange={(e) => setTaskForm({...taskForm, area: e.target.value})}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Scheduled Date *</label>
                                <input
                                    type="date"
                                    value={taskForm.scheduled_date}
                                    onChange={(e) => setTaskForm({...taskForm, scheduled_date: e.target.value})}
                                    className="form-control"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description *</label>
                            <textarea
                                value={taskForm.description}
                                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                                className="form-control"
                                rows="3"
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button type="submit" className="btn btn-success">Create Task</button>
                            <button type="button" onClick={() => setShowTaskForm(false)} className="btn btn-secondary">
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
                            <th>Task</th>
                            <th>Type</th>
                            <th>Area</th>
                            <th>Farm</th>
                            <th>Scheduled Date</th>
                            <th>Status</th>
                            <th>Assigned To</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task) => (
                            <tr key={task.id}>
                                <td><strong>{task.description}</strong></td>
                                <td style={{ textTransform: 'capitalize' }}>{task.task_type}</td>
                                <td>{task.area}</td>
                                <td>{task.farm_name}</td>
                                <td>{new Date(task.scheduled_date).toLocaleDateString()}</td>
                                <td>
                                    <span className={getTaskStatusBadge(task.status)}>
                                        {task.status}
                                    </span>
                                </td>
                                <td>
                                    {task.assigned_first_name && task.assigned_last_name
                                        ? `${task.assigned_first_name} ${task.assigned_last_name}`
                                        : 'Unassigned'
                                    }
                                </td>
                                <td>
                                    {task.status === 'pending' && (
                                        <button
                                            onClick={() => completeTask(task.id)}
                                            className="btn btn-success"
                                            style={{ fontSize: '12px', padding: '4px 8px' }}
                                        >
                                            Complete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="container" style={{ padding: '20px 0' }}>
            <h1>Biosecurity Management</h1>
            
            {error && <div className="alert alert-error">{error}</div>}

            <div className="card mb-20">
                <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e9ecef', paddingBottom: '10px' }}>
                    <button
                        onClick={() => setActiveTab('visitors')}
                        className={`btn ${activeTab === 'visitors' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        👥 Visitors
                    </button>
                    <button
                        onClick={() => setActiveTab('environmental')}
                        className={`btn ${activeTab === 'environmental' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        🌡️ Environmental
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`btn ${activeTab === 'tasks' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        ✓ Tasks
                    </button>
                </div>

                <div style={{ marginTop: '20px' }}>
                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : (
                        <>
                            {activeTab === 'visitors' && renderVisitors()}
                            {activeTab === 'environmental' && renderEnvironmental()}
                            {activeTab === 'tasks' && renderTasks()}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Biosecurity;
