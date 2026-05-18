const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'farm_portal',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        console.log(`📊 Connected to database: ${dbConfig.database}`);
        console.log(`🖥️  Host: ${dbConfig.host}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('🔧 Check your MySQL server and credentials in .env file');
        return false;
    }
}

// Execute query with error handling
async function executeQuery(query, params = []) {
    try {
        const [results] = await pool.execute(query, params);
        return { success: true, data: results };
    } catch (error) {
        console.error('Database query error:', error.message);
        return { success: false, error: error.message };
    }
}

// Get a single connection for transactions
async function getConnection() {
    try {
        return await pool.getConnection();
    } catch (error) {
        console.error('Failed to get database connection:', error.message);
        throw error;
    }
}

// Close all connections
async function closePool() {
    try {
        await pool.end();
        console.log('📴 Database connection pool closed');
    } catch (error) {
        console.error('Error closing database pool:', error.message);
    }
}

module.exports = {
    pool,
    testConnection,
    executeQuery,
    getConnection,
    closePool
};
