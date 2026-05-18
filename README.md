# 🏢 Digital Farm Portal

A comprehensive farm management system designed for modern agricultural operations with role-based access control.

## 🎯 Features

- **4-Tier Role System**: System Admin, Farm Owner, Farm Manager, Farm Worker
- **Biosecurity Management**: Visitor tracking, environmental monitoring, cleaning schedules
- **Animal Health Tracking**: Medical records, vaccination schedules, treatments
- **Inventory Management**: Feed, medicine, equipment tracking with alerts
- **Mobile-Optimized**: Touch-friendly interface for field workers
- **Real-time Analytics**: Performance metrics and compliance dashboards

## 🏗️ Tech Stack

### Backend
- Node.js with Express.js
- MySQL database
- JWT authentication
- RESTful API architecture

### Frontend
- React 19.1.1
- React Router for navigation
- Axios for API calls
- Responsive CSS design

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone and setup**
```bash
cd MiniProject
```

2. **Database Setup**
```bash
mysql -u root -p
CREATE DATABASE farm_portal;
USE farm_portal;
source backend/database/schema.sql
```

3. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm start
```

4. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### Demo Credentials
- **System Admin**: `admin_rajesh` / `admin123`
- **Farm Owner**: `owner_priya` / `owner123`
- **Farm Manager**: `manager_arjun` / `manager123`
- **Farm Worker**: `worker_anita` / `worker123`

## 📱 User Flow

1. **Landing Page** → Role selection interface
2. **Authentication** → Role-specific login
3. **Dashboard** → Role-based features and navigation
4. **Operations** → Farm management, biosecurity, health tracking
5. **Reports** → Analytics and compliance monitoring

## 🔐 Security Features

- JWT token authentication (2-hour expiration)
- Role-based access control
- Session management with activity tracking
- Account lockout protection
- Audit logging for all actions

## 📊 Database Schema

- **users**: 4-role authentication system
- **farms**: Multi-farm support with ownership
- **animals**: Complete livestock management
- **health_records**: Medical history and treatments
- **biosecurity_tasks**: Cleaning and compliance tracking
- **visitors**: Entry/exit management
- **environmental_data**: Monitoring and alerts
- **inventory**: Supply chain management

## 🦠 Biosecurity Module

- **Visitor Management**: Check-in/out with health declarations
- **Environmental Monitoring**: Temperature, humidity, air quality
- **Cleaning Tracker**: Task scheduling and verification
- **Compliance Dashboard**: Real-time scoring and alerts

## 📈 Role-Specific Features

### System Administrator
- Complete system control and user management
- Security monitoring and analytics
- Multi-farm oversight and compliance

### Farm Owner
- Portfolio management across multiple farms
- Financial oversight and performance analytics
- Strategic planning and compliance tracking

### Farm Manager
- Daily operations and team coordination
- Health monitoring and task management
- Biosecurity compliance and reporting

### Farm Worker
- Mobile-optimized task execution
- Quick data entry and progress tracking
- Emergency alerts and issue reporting

## 🔧 API Endpoints

### Authentication
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET /auth/verify` - Token verification

### Farm Management
- `GET /farms` - List farms (role-based)
- `POST /farms` - Create farm (restricted roles)
- `PUT /farms/:id` - Update farm
- `DELETE /farms/:id` - Delete farm

### Animal Health
- `GET /api/animals` - List animals
- `POST /api/animals` - Add animal
- `GET /health/animal/:id` - Health records
- `POST /health/animal/:id` - Add health record

### Biosecurity
- `POST /biosecurity/visitors` - Register visitor
- `GET /biosecurity/environmental` - Environmental data
- `POST /biosecurity/cleaning` - Log cleaning activity

## 📝 License

This project is licensed under the MIT License.
