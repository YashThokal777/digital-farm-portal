# 🚀 Digital Farm Portal - Setup Instructions

## Prerequisites

Before setting up the Digital Farm Portal, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/mysql/)
- **Git** (optional) - [Download here](https://git-scm.com/)

## 📋 Quick Setup Guide

### Step 1: Database Setup

1. **Start MySQL Server**
   ```bash
   # Windows (if MySQL is in PATH)
   mysql -u root -p
   
   # Or use MySQL Workbench GUI
   ```

2. **Create Database**
   ```sql
   CREATE DATABASE farm_portal;
   USE farm_portal;
   ```

3. **Import Database Schema**
   ```sql
   SOURCE backend/database/schema.sql;
   ```

### Step 2: Backend Setup

1. **Navigate to Backend Directory**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   - Edit `backend/.env` file with your MySQL credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=farm_portal
   JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
   NODE_ENV=development
   ```

4. **Start Backend Server**
   ```bash
   npm start
   ```
   
   ✅ Backend should be running on http://localhost:5000

### Step 3: Frontend Setup

1. **Open New Terminal and Navigate to Frontend**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```
   
   ✅ Frontend should be running on http://localhost:3000

## 🎯 Demo Credentials

The system comes with pre-configured demo accounts:

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| **System Admin** | `admin_rajesh` | `admin123` | Complete system control |
| **Farm Owner** | `owner_priya` | `owner123` | Portfolio management |
| **Farm Manager** | `manager_arjun` | `manager123` | Daily operations |
| **Farm Worker** | `worker_anita` | `worker123` | Field operations |

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check credentials in `.env` file
   - Ensure `farm_portal` database exists

2. **Port Already in Use**
   - Backend (5000): Change `PORT` in `.env`
   - Frontend (3000): It will prompt for alternative port

3. **Module Not Found Errors**
   - Run `npm install` in respective directory
   - Delete `node_modules` and `package-lock.json`, then reinstall

4. **CORS Issues**
   - Backend includes CORS middleware
   - Frontend proxy is configured in `package.json`

### Database Reset

If you need to reset the database:

```sql
DROP DATABASE farm_portal;
CREATE DATABASE farm_portal;
USE farm_portal;
SOURCE backend/database/schema.sql;
```

## 📱 Testing the Application

### 1. Access the Application
- Open browser and go to http://localhost:3000
- You'll see the landing page with role descriptions

### 2. Login with Demo Account
- Click "Get Started" or "Login"
- Use any demo credentials from the table above
- Each role has different dashboard and features

### 3. Test Key Features

**System Admin:**
- User management
- System analytics
- All farms overview

**Farm Owner:**
- Portfolio management
- Multiple farms view
- Financial oversight

**Farm Manager:**
- Daily operations
- Animal health records
- Biosecurity management
- Inventory tracking

**Farm Worker:**
- Task management
- Quick data entry
- Mobile-optimized interface

## 🌟 Key Features to Explore

### 🏢 Farm Management
- Create and manage multiple farms
- Assign staff to farms
- Track farm performance

### 🐄 Animal Management
- Register animals with unique tags
- Track species, breeds, and health status
- Age and weight monitoring

### 🏥 Health Records
- Medical history tracking
- Vaccination schedules
- Treatment records
- Veterinarian notes

### 📦 Inventory Management
- Feed, medicine, equipment tracking
- Low stock alerts
- Expiry date monitoring
- Supplier management

### 🦠 Biosecurity
- Visitor registration and tracking
- Environmental monitoring
- Cleaning task management
- Compliance reporting

## 🔒 Security Features

- JWT token authentication (2-hour expiration)
- Role-based access control
- Account lockout protection
- Session management
- Audit logging
- Password security requirements

## 📊 API Endpoints

The backend provides RESTful APIs:

- **Authentication**: `/auth/*`
- **Farms**: `/farms/*`
- **Animals**: `/api/animals/*`
- **Health**: `/health/*`
- **Inventory**: `/inventory/*`
- **Biosecurity**: `/biosecurity/*`
- **Dashboard**: `/dashboard/*`

## 🚀 Production Deployment

For production deployment:

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong JWT secret
   - Configure production database

2. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

3. **Process Management**
   - Use PM2 or similar for backend
   - Serve frontend build with nginx/apache

4. **Database Security**
   - Create dedicated database user
   - Restrict permissions
   - Enable SSL connections

## 📞 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all prerequisites are installed
3. Ensure database schema is properly imported
4. Check network connectivity between frontend/backend

## 🎉 Success!

If everything is set up correctly, you should see:
- Landing page at http://localhost:3000
- Successful login with demo credentials
- Role-specific dashboards
- Functional CRUD operations
- Real-time data updates

Happy farming! 🌾
