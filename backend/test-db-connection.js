const { pool, testConnection } = require('./config/db');

async function checkDatabase() {
    console.log('🔍 Testing database connection and checking demo users...\n');
    
    // Test connection
    const connected = await testConnection();
    if (!connected) {
        console.log('❌ Database connection failed. Check your MySQL server and .env credentials.');
        process.exit(1);
    }
    
    try {
        // Check if users table exists and has demo data
        const [users] = await pool.execute('SELECT username, role FROM users LIMIT 5');
        
        if (users.length === 0) {
            console.log('❌ Users table is empty. You need to import the database schema.');
            console.log('\n📋 To fix this:');
            console.log('1. Open MySQL Workbench or command line');
            console.log('2. Run: CREATE DATABASE IF NOT EXISTS farm_portal;');
            console.log('3. Run: USE farm_portal;');
            console.log('4. Import: backend/database/schema.sql');
        } else {
            console.log('✅ Demo users found in database:');
            users.forEach(user => {
                console.log(`   - ${user.username} (${user.role})`);
            });
            
            console.log('\n🎯 Demo Login Credentials:');
            console.log('   Username: admin_rajesh   | Password: admin123');
            console.log('   Username: owner_priya    | Password: owner123');
            console.log('   Username: manager_arjun  | Password: manager123');
            console.log('   Username: worker_anita   | Password: worker123');
        }
        
    } catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.log('❌ Users table does not exist. Database schema not imported.');
            console.log('\n📋 To fix this:');
            console.log('1. Open MySQL Workbench');
            console.log('2. Connect to your MySQL server (root/root)');
            console.log('3. Create database: CREATE DATABASE farm_portal;');
            console.log('4. Import schema: backend/database/schema.sql');
        } else {
            console.log('❌ Database error:', error.message);
        }
    }
    
    await pool.end();
}

checkDatabase();
