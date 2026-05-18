# Digital Farm Portal - Frontend-Backend Connectivity

## Connectivity Summary

The Digital Farm Portal operates on a classic three-tier architecture. The **React.js frontend** acts as the client, capturing user input and sending RESTful API requests to the **Node.js/Express.js backend**. The backend processes these requests, enforces business logic and security rules, and interacts with the **MySQL database** by executing SQL queries to read or write data. The backend then sends a JSON response back to the frontend, which dynamically updates the UI to provide a seamless user experience.

## 1. Architecture Overview

### System Architecture
```
┌─────────────────┐    HTTP/HTTPS     ┌─────────────────┐    MySQL      ┌─────────────────┐
│   React.js      │◄─────────────────►│   Node.js       │◄─────────────►│     MySQL       │
│   Frontend      │    REST API       │   Express.js    │   Connection  │    Database     │
│   (Port 3000)   │    JSON Data      │   Backend       │     Pool      │                 │
│                 │                   │   (Port 5000)   │               │                 │
└─────────────────┘                   └─────────────────┘               └─────────────────┘
```

### Technology Stack
- **Frontend**: React.js 18, React Router, Axios, Context API
- **Backend**: Node.js, Express.js, MySQL2, JWT, bcrypt
- **Communication**: RESTful APIs with JSON data exchange
- **Authentication**: JWT tokens with role-based access control

## 2. API Endpoints Structure

### 2.1 Authentication Endpoints
```javascript
// Backend Routes (auth.js)
POST   /api/auth/login          // User login
POST   /api/auth/register       // User registration  
POST   /api/auth/verify         // Token verification
POST   /api/auth/logout         // User logout
GET    /api/auth/profile        // Get user profile
PUT    /api/auth/profile        // Update user profile
```

### 2.2 Farm Management Endpoints
```javascript
// Backend Routes (farms.js)
GET    /api/farms               // Get all farms for user
POST   /api/farms               // Create new farm
GET    /api/farms/:id           // Get specific farm
PUT    /api/farms/:id           // Update farm
DELETE /api/farms/:id           // Delete farm
GET    /api/farms/:id/areas     // Get farm areas
POST   /api/farms/:id/areas     // Create farm area
```

### 2.3 Animal Management Endpoints
```javascript
// Backend Routes (animals.js)
GET    /api/animals             // Get all animals
POST   /api/animals             // Add new animal
GET    /api/animals/:id         // Get specific animal
PUT    /api/animals/:id         // Update animal
DELETE /api/animals/:id         // Delete animal
GET    /api/animals/search      // Search animals
```

### 2.4 Health Records Endpoints
```javascript
// Backend Routes (health.js)
GET    /api/health/records      // Get health records
POST   /api/health/records      // Create health record
GET    /api/health/animal/:id   // Get animal health history
PUT    /api/health/records/:id  // Update health record
GET    /api/health/alerts       // Get health alerts
```

### 2.5 Biosecurity Endpoints
```javascript
// Backend Routes (biosecurity.js)
GET    /api/biosecurity/visitors        // Get visitors
POST   /api/biosecurity/visitors/checkin // Check in visitor
PUT    /api/biosecurity/visitors/:id/checkout // Check out visitor
GET    /api/biosecurity/environmental   // Environmental data
POST   /api/biosecurity/environmental   // Record environmental data
GET    /api/biosecurity/cleaning        // Cleaning activities
POST   /api/biosecurity/cleaning        // Log cleaning activity
```

### 2.6 Inventory Endpoints
```javascript
// Backend Routes (inventory.js)
GET    /api/inventory/feed      // Get feed inventory
POST   /api/inventory/feed      // Add feed item
PUT    /api/inventory/feed/:id  // Update feed item
GET    /api/inventory/medicine  // Get medicine inventory
POST   /api/inventory/medicine  // Add medicine item
GET    /api/inventory/equipment // Get equipment inventory
GET    /api/inventory/alerts    // Get inventory alerts
```

## 3. Authentication & Authorization Flow

### 3.1 Login Process
```javascript
// Frontend: Login Component
const handleLogin = async (credentials) => {
  try {
    const response = await axios.post('/api/auth/login', credentials);
    const { token, user } = response.data;
    
    // Store token in localStorage
    localStorage.setItem('token', token);
    
    // Update auth context
    setUser(user);
    setIsAuthenticated(true);
    
    // Redirect based on role
    navigate(getRoleBasedRoute(user.role));
  } catch (error) {
    setError(error.response.data.message);
  }
};

// Backend: Login Route
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ where: { username } });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    
    res.json({ token, user: { id: user.id, username, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
```

### 3.2 Token Verification Middleware
```javascript
// Backend: Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};
```

### 3.3 Frontend Auth Context
```javascript
// AuthContext.js
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);
  
  const verifyToken = async (token) => {
    try {
      const response = await axios.post('/api/auth/verify', { token });
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider value={{
      user, setUser, isAuthenticated, setIsAuthenticated, loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 4. HTTP Client Configuration

### 4.1 Axios Configuration
```javascript
// api/client.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 4.2 API Service Functions
```javascript
// services/animalService.js
import apiClient from '../api/client';

export const animalService = {
  getAllAnimals: async () => {
    const response = await apiClient.get('/api/animals');
    return response.data;
  },
  
  createAnimal: async (animalData) => {
    const response = await apiClient.post('/api/animals', animalData);
    return response.data;
  },
  
  updateAnimal: async (id, animalData) => {
    const response = await apiClient.put(`/api/animals/${id}`, animalData);
    return response.data;
  },
  
  deleteAnimal: async (id) => {
    const response = await apiClient.delete(`/api/animals/${id}`);
    return response.data;
  },
  
  searchAnimals: async (searchParams) => {
    const response = await apiClient.get('/api/animals/search', { params: searchParams });
    return response.data;
  }
};
```

## 5. Data Flow Examples

### 5.1 Animal Health Record Creation
```javascript
// Frontend Component
const HealthRecordForm = () => {
  const [formData, setFormData] = useState({
    animal_id: '',
    record_type: 'checkup',
    description: '',
    treatment: ''
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/api/health/records', formData);
      setSuccess('Health record created successfully');
      // Update local state or refetch data
      onRecordCreated(response.data);
    } catch (error) {
      setError(error.response.data.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};

// Backend Route Handler
app.post('/api/health/records', authenticateToken, async (req, res) => {
  try {
    const { animal_id, record_type, description, treatment } = req.body;
    
    // Validate animal exists and user has access
    const animal = await Animal.findOne({
      where: { id: animal_id },
      include: [{ model: Farm, where: { owner_id: req.user.userId } }]
    });
    
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }
    
    const healthRecord = await HealthRecord.create({
      animal_id,
      record_type,
      description,
      treatment,
      recorded_by: req.user.userId,
      record_date: new Date()
    });
    
    res.status(201).json(healthRecord);
  } catch (error) {
    res.status(500).json({ message: 'Error creating health record' });
  }
});
```

### 5.2 Real-time Dashboard Data
```javascript
// Frontend Dashboard Component
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDashboardData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.get('/api/reports/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className="dashboard">
      <MetricsCards data={dashboardData.metrics} />
      <AlertsPanel alerts={dashboardData.alerts} />
      <RecentActivity activities={dashboardData.recentActivities} />
    </div>
  );
};
```

## 6. Error Handling & Validation

### 6.1 Frontend Error Handling
```javascript
// Custom hook for API calls
const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const makeApiCall = async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return { makeApiCall, loading, error };
};
```

### 6.2 Backend Validation Middleware
```javascript
// Validation middleware
const validateAnimalData = (req, res, next) => {
  const { tag_number, species, farm_id } = req.body;
  const errors = [];
  
  if (!tag_number || tag_number.trim().length === 0) {
    errors.push('Tag number is required');
  }
  
  if (!species || !['pig', 'chicken', 'duck', 'turkey'].includes(species)) {
    errors.push('Valid species is required');
  }
  
  if (!farm_id || isNaN(farm_id)) {
    errors.push('Valid farm ID is required');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation errors', errors });
  }
  
  next();
};
```

## 7. State Management

### 7.1 Context API for Global State
```javascript
// FarmContext.js
const FarmContext = createContext();

export const FarmProvider = ({ children }) => {
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [animals, setAnimals] = useState([]);
  
  const fetchFarms = async () => {
    try {
      const response = await apiClient.get('/api/farms');
      setFarms(response.data);
    } catch (error) {
      console.error('Error fetching farms:', error);
    }
  };
  
  const addAnimal = async (animalData) => {
    try {
      const response = await apiClient.post('/api/animals', animalData);
      setAnimals(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  return (
    <FarmContext.Provider value={{
      farms, setFarms, selectedFarm, setSelectedFarm,
      animals, setAnimals, fetchFarms, addAnimal
    }}>
      {children}
    </FarmContext.Provider>
  );
};
```

## 8. Performance Optimization

### 8.1 Frontend Optimizations
```javascript
// Lazy loading components
const Dashboard = lazy(() => import('./components/Dashboard'));
const AnimalManagement = lazy(() => import('./components/AnimalManagement'));

// Memoized components
const AnimalCard = memo(({ animal, onUpdate }) => {
  return (
    <div className="animal-card">
      {/* Animal details */}
    </div>
  );
});

// Debounced search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};
```

### 8.2 Backend Optimizations
```javascript
// Database query optimization
const getAnimalsWithHealthRecords = async (farmId) => {
  return await Animal.findAll({
    where: { farm_id: farmId },
    include: [{
      model: HealthRecord,
      limit: 5,
      order: [['record_date', 'DESC']]
    }],
    order: [['tag_number', 'ASC']]
  });
};

// Response caching
const cache = new Map();

const getCachedData = (key, fetchFunction, ttl = 300000) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const data = fetchFunction();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};
```

## 9. Development & Production Configuration

### 9.1 Environment Configuration
```javascript
// Frontend (.env)
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development

// Backend (.env)
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:3000
```

### 9.2 CORS Configuration
```javascript
// Backend CORS setup
const cors = require('cors');

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

## 10. Example Workflows

This section illustrates the end-to-end communication flow for common user actions.

### 10.1 User Login Workflow

1.  **Frontend (React)**: The user enters their `username` and `password` into the `Login.js` component and clicks "Login."
2.  **API Request**: An `onSubmit` event handler triggers an asynchronous `POST` request to the backend endpoint `/api/auth/login` using Axios, sending the credentials in the request body.
3.  **Backend (Node.js/Express)**: The `auth.js` router receives the request.
4.  **Data Validation**: The backend validates the input (e.g., checks for non-empty fields).
5.  **Database Query**: The controller queries the `users` table to find a user with the matching `username`.
6.  **Authentication**: It uses `bcrypt.compare()` to verify that the provided password matches the hashed password stored in the database.
7.  **Token Generation**: If authentication is successful, it generates a JSON Web Token (JWT) containing the `user_id` and `role`.
8.  **API Response**: The backend sends a `200 OK` response back to the frontend, including the JWT and user details.
9.  **Frontend (React)**: The frontend receives the response. The `AuthContext` stores the JWT in local storage, updates the application state to reflect that the user is logged in, and redirects the user to their role-specific dashboard.

### 10.2 Adding a New Animal Workflow

1.  **Frontend (React)**: A Farm Manager fills out the "Add Animal" form with details like `tag_number`, `species`, and `birth_date`.
2.  **API Request**: The form submission triggers a `POST` request to `/api/animals`. The JWT is included in the `Authorization` header to authenticate the request.
3.  **Backend (Node.js/Express)**: The `animals.js` router receives the request.
4.  **Middleware**: The `auth` middleware verifies the JWT to ensure the user is authenticated. The `roleAuth` middleware checks if the user's role (`farm_manager` or `farm_owner`) is permitted to perform this action.
5.  **Data Validation**: The backend validates the incoming animal data (e.g., ensures `tag_number` is unique for the farm).
6.  **Database Query**: If validation passes, the controller executes an `INSERT` query to add a new record to the `animals` table.
7.  **API Response**: The backend sends a `201 Created` response with the newly created animal's data.
8.  **Frontend (React)**: The frontend displays a success message and updates the animal list UI to show the new animal without needing a page refresh.

## 11. Code Snippets for User Login

Here are the code snippets illustrating the User Login workflow across the different layers of the application.

### 11.1 Frontend (React.js - Login Component)

This snippet shows how the frontend uses `axios` to send the user's credentials to the backend API.

```javascript
// src/pages/Login.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/auth/login', formData);
            login(response.data.token, response.data.user);
            // Redirect to dashboard happens within AuthContext
        } catch (error) {
            console.error('Login failed:', error.response.data.message);
        }
    };

    // ... rest of the form JSX
};
```

### 11.2 Backend (Node.js/Express - Auth Route)

This snippet shows the Express route that receives the login request and passes it to the controller.

```javascript
// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController');

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', loginUser);

module.exports = router;
```

### 11.3 Backend (Node.js - Auth Controller & DB Query)

This snippet shows the controller logic that queries the database, verifies the password, and generates a JWT.

```javascript
// backend/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Database Query
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 2. Authentication
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 3. Token Generation
        const payload = { userId: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
```

This connectivity architecture ensures secure, efficient communication between the React frontend and Node.js backend, supporting all the Digital Farm Portal's functionality with proper authentication, error handling, and performance optimization.

## 12. Flow of Connectivity

### 12.1 User Interaction (Frontend – React.js)

-   Users perform actions such as logging in, adding a new animal, or updating inventory levels.
-   React captures form data and sends API requests to the backend via Axios, including the JWT in the authorization header for protected routes.

### 12.2 Request Handling (Backend – Node.js/Express.js)

-   Express routes handle the incoming API requests (e.g., `/api/auth/login`, `/api/animals`, `/api/inventory/feed`).
-   Middleware is used to verify the JWT for authentication and check user roles for authorization before passing the request to the controller.

### 12.3 Database Interaction (MySQL)

-   The backend controllers execute individual SQL queries (e.g., `INSERT`, `UPDATE`, `SELECT`) to interact with the database.
-   Data consistency is maintained through application-level validation and the successful execution of these individual queries.

### 12.4 Response Delivery

-   The backend responds with structured JSON data, such as a success message, the requested data, or an error notification.
-   React uses this response to dynamically update the UI—for example, by redirecting the user to their dashboard, refreshing an inventory list, or displaying an alert.
