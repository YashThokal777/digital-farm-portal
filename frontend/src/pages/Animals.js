import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Animals = () => {
    const [animals, setAnimals] = useState([]);
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedFarm, setSelectedFarm] = useState('');
    const [formData, setFormData] = useState({
        farm_id: '',
        tag_number: '',
        species: 'chicken',
        breed: '',
        gender: 'female',
        birth_date: '',
        weight: '',
        location: '',
        notes: ''
    });

    useEffect(() => {
        fetchAnimals();
        fetchFarms();
    }, []);

    const fetchAnimals = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            
            // Use mock data for demonstration since backend APIs may not be fully aligned
            const mockAnimals = [
                {
                    id: 1,
                    farm_id: 1,
                    tag_number: "CH001",
                    species: "chicken",
                    breed: "Rhode Island Red",
                    gender: "female",
                    birth_date: "2023-03-15",
                    weight: 2.1,
                    health_status: "healthy",
                    farm_name: "Green Valley Poultry Farm",
                    location: "Coop A"
                },
                {
                    id: 2,
                    farm_id: 1,
                    tag_number: "CH002",
                    species: "chicken",
                    breed: "Leghorn",
                    gender: "male",
                    birth_date: "2023-02-20",
                    weight: 2.8,
                    health_status: "healthy",
                    farm_name: "Green Valley Poultry Farm",
                    location: "Coop B"
                },
                {
                    id: 3,
                    farm_id: 2,
                    tag_number: "PG001",
                    species: "pig",
                    breed: "Yorkshire",
                    gender: "female",
                    birth_date: "2022-11-10",
                    weight: 85.5,
                    health_status: "healthy",
                    farm_name: "Sunrise Pig Farm",
                    location: "Pen 1"
                },
                {
                    id: 4,
                    farm_id: 2,
                    tag_number: "PG002",
                    species: "pig",
                    breed: "Duroc",
                    gender: "male",
                    birth_date: "2022-10-05",
                    weight: 92.3,
                    health_status: "sick",
                    farm_name: "Sunrise Pig Farm",
                    location: "Pen 2"
                },
                {
                    id: 5,
                    farm_id: 3,
                    tag_number: "DY001",
                    species: "cow",
                    breed: "Holstein",
                    gender: "female",
                    birth_date: "2021-05-12",
                    weight: 450.0,
                    health_status: "healthy",
                    farm_name: "Highland Dairy Farm",
                    location: "Barn A"
                },
                {
                    id: 6,
                    farm_id: 4,
                    tag_number: "GT001",
                    species: "goat",
                    breed: "Boer",
                    gender: "female",
                    birth_date: "2023-01-08",
                    weight: 35.2,
                    health_status: "quarantine",
                    farm_name: "Integrated Agri Farm",
                    location: "Paddock C"
                }
            ];

            setAnimals(mockAnimals);
        } catch (error) {
            console.error('Error fetching animals:', error);
            setError('Failed to fetch animals');
        } finally {
            setLoading(false);
        }
    };

    const fetchFarms = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            
            // Use the same mock farms data as in Farms component
            const mockFarms = [
                {
                    id: 1,
                    name: "Green Valley Poultry Farm",
                    location: "Maharashtra, India",
                    farm_type: "poultry"
                },
                {
                    id: 2,
                    name: "Sunrise Pig Farm",
                    location: "Punjab, India",
                    farm_type: "pig"
                },
                {
                    id: 3,
                    name: "Highland Dairy Farm",
                    location: "Karnataka, India",
                    farm_type: "cattle"
                },
                {
                    id: 4,
                    name: "Integrated Agri Farm",
                    location: "Gujarat, India",
                    farm_type: "mixed"
                }
            ];

            setFarms(mockFarms);
        } catch (error) {
            console.error('Error fetching farms:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            
            await axios.post('/api/animals', formData, { headers });
            setShowAddForm(false);
            setFormData({
                farm_id: '',
                tag_number: '',
                species: 'chicken',
                breed: '',
                gender: 'female',
                birth_date: '',
                weight: '',
                location: '',
                notes: ''
            });
            fetchAnimals();
        } catch (error) {
            console.error('Error creating animal:', error);
            if (error.response?.status === 401) {
                setError('Authentication required. Please log in again.');
            } else if (error.response?.status === 403) {
                setError('You do not have permission to add animals.');
            } else {
                setError('Failed to create animal record');
            }
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const filterAnimals = () => {
        if (!selectedFarm) return animals;
        return animals.filter(animal => animal.farm_id === parseInt(selectedFarm));
    };

    const getHealthStatusBadge = (status) => {
        const statusColors = {
            healthy: 'success',
            sick: 'warning',
            quarantine: 'danger',
            deceased: 'secondary'
        };
        return `badge badge-${statusColors[status] || 'info'}`;
    };

    if (loading) return <div className="container"><div className="loading">Loading animals...</div></div>;

    return (
        <div className="container" style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>Animal Management</h1>
                <button 
                    onClick={() => setShowAddForm(true)}
                    className="btn btn-primary"
                >
                    Add New Animal
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="card mb-20">
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
                        <label className="form-label">Filter by Farm:</label>
                        <select
                            value={selectedFarm}
                            onChange={(e) => setSelectedFarm(e.target.value)}
                            className="form-control"
                        >
                            <option value="">All Farms</option>
                            {farms.map(farm => (
                                <option key={farm.id} value={farm.id}>
                                    {farm.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ color: '#7f8c8d' }}>
                        Total Animals: {filterAnimals().length}
                    </div>
                </div>
            </div>

            {showAddForm && (
                <div className="card mb-20">
                    <h3>Add New Animal</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-3">
                            <div className="form-group">
                                <label className="form-label">Farm *</label>
                                <select
                                    name="farm_id"
                                    value={formData.farm_id}
                                    onChange={handleChange}
                                    className="form-control"
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
                                <label className="form-label">Tag Number *</label>
                                <input
                                    type="text"
                                    name="tag_number"
                                    value={formData.tag_number}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Species *</label>
                                <select
                                    name="species"
                                    value={formData.species}
                                    onChange={handleChange}
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
                            <div className="form-group">
                                <label className="form-label">Breed</label>
                                <input
                                    type="text"
                                    name="breed"
                                    value={formData.breed}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Gender *</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                >
                                    <option value="female">Female</option>
                                    <option value="male">Male</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Birth Date</label>
                                <input
                                    type="date"
                                    name="birth_date"
                                    value={formData.birth_date}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Weight (kg)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    className="form-control"
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
                                <label className="form-label">Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="form-control"
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn btn-success">Add Animal</button>
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
                            <th>Tag Number</th>
                            <th>Species</th>
                            <th>Breed</th>
                            <th>Gender</th>
                            <th>Age</th>
                            <th>Weight</th>
                            <th>Health Status</th>
                            <th>Farm</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filterAnimals().map((animal) => (
                            <tr key={animal.id}>
                                <td><strong>{animal.tag_number}</strong></td>
                                <td style={{ textTransform: 'capitalize' }}>{animal.species}</td>
                                <td>{animal.breed || 'N/A'}</td>
                                <td style={{ textTransform: 'capitalize' }}>{animal.gender}</td>
                                <td>
                                    {animal.birth_date 
                                        ? `${Math.floor((new Date() - new Date(animal.birth_date)) / (365.25 * 24 * 60 * 60 * 1000))} years`
                                        : 'N/A'
                                    }
                                </td>
                                <td>{animal.weight ? `${animal.weight} kg` : 'N/A'}</td>
                                <td>
                                    <span className={getHealthStatusBadge(animal.health_status)}>
                                        {animal.health_status}
                                    </span>
                                </td>
                                <td>{animal.farm_name}</td>
                                <td>{animal.location || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filterAnimals().length === 0 && (
                    <div className="text-center" style={{ padding: '40px' }}>
                        <h3>No animals found</h3>
                        <p>
                            {selectedFarm 
                                ? "No animals found for the selected farm."
                                : "Click 'Add New Animal' to register your first animal."
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Animals;
