const express = require('express');
const cors = require('cors');
const { pool, testConnection } = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const authRoutes = require('./routes/auth');
const farmRoutes = require('./routes/farms');
const animalRoutes = require('./routes/animals');
const healthRoutes = require('./routes/health');
const inventoryRoutes = require('./routes/inventory');
const biosecurityRoutes = require('./routes/biosecurity');
const dashboardRoutes = require('./routes/dashboard');
const reportsRoutes = require('./routes/reports');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make pool available to routes
app.locals.db = pool;

// Use routes
app.use('/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/biosecurity', biosecurityRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Digital Farm Portal API is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Digital Farm Portal API',
        version: '1.0.0',
        endpoints: {
            auth: '/auth',
            farms: '/api/farms',
            animals: '/api/animals',
            health: '/api/health',
            inventory: '/api/inventory',
            biosecurity: '/api/biosecurity',
            dashboard: '/dashboard',
            reports: '/api/reports'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Start server
async function startServer() {
    await testConnection();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📱 API URL: http://localhost:${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
}

startServer().catch(console.error);
