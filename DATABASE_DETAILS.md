# Digital Farm Portal - Database Details

## 1. Database Overview

### Database Management System
- **DBMS**: MySQL 8.0
- **Engine**: InnoDB (for ACID compliance and foreign key support)
- **Character Set**: utf8mb4 (full Unicode support)
- **Collation**: utf8mb4_unicode_ci

### Database Architecture
The Digital Farm Portal uses a relational database design optimized for farm management operations, ensuring data integrity, scalability, and regulatory compliance.

## 2. DDL (Data Definition Language)

The Data Definition Language (DDL) commands were used to design and implement the database structure of the **Digital Farm Portal**. The DDL defines all entities (such as `Users`, `Farms`, `Animals`, and `Inventory`), their attributes, data types, and constraints to ensure data integrity and normalization. Each table includes primary keys, foreign keys, uniqueness constraints, and validation checks (e.g., for `role` enums and `quantity` values), making the schema robust and reliable for critical farm operations.

## 3. Detailed Table Structures

### 3.1 Users Table
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role ENUM('system_admin', 'farm_owner', 'farm_manager', 'farm_worker') NOT NULL,
    phone VARCHAR(20),
    license_number VARCHAR(50),
    specialization VARCHAR(100),
    company_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
);
```

**Purpose**: Central user management with role-based access control
**Key Features**:
- 4-role system (system_admin, farm_owner, farm_manager, farm_worker)
- Secure password storage with bcrypt hashing
- Professional fields for veterinarians and suppliers
- Activity tracking with last_login timestamp

### 3.2 Farms Table
```sql
CREATE TABLE farms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    farm_type ENUM('pig', 'poultry', 'mixed') NOT NULL,
    owner_id INT NOT NULL,
    manager_id INT,
    total_area DECIMAL(10,2),
    established_date DATE,
    license_number VARCHAR(50),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_owner (owner_id),
    INDEX idx_manager (manager_id),
    INDEX idx_type (farm_type),
    INDEX idx_status (status)
);
```

**Purpose**: Farm registration and management
**Key Features**:
- Multi-farm support for farm owners
- Farm type specialization (pig, poultry, mixed)
- Hierarchical management (owner → manager)
- Regulatory compliance with license tracking

### 3.3 Farm Areas Table
```sql
CREATE TABLE farm_areas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farm_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    area_type ENUM('shed', 'pen', 'pasture', 'quarantine', 'feed_storage', 'medical') NOT NULL,
    capacity INT,
    current_occupancy INT DEFAULT 0,
    status ENUM('active', 'maintenance', 'quarantine') DEFAULT 'active',
    temperature_range VARCHAR(20),
    humidity_range VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    INDEX idx_farm (farm_id),
    INDEX idx_type (area_type),
    INDEX idx_status (status),
    UNIQUE KEY unique_farm_area (farm_id, name)
);
```

**Purpose**: Detailed farm area management for biosecurity and organization
**Key Features**:
- Flexible area types for different farm operations
- Capacity management and occupancy tracking
- Environmental parameter storage
- Status tracking for maintenance and quarantine

### 3.4 Animals Table
```sql
CREATE TABLE animals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tag_number VARCHAR(50) NOT NULL,
    farm_id INT NOT NULL,
    area_id INT,
    species ENUM('pig', 'chicken', 'duck', 'turkey') NOT NULL,
    breed VARCHAR(50),
    gender ENUM('male', 'female', 'unknown') DEFAULT 'unknown',
    birth_date DATE,
    age INT GENERATED ALWAYS AS (DATEDIFF(CURDATE(), birth_date) DIV 365) STORED,
    weight DECIMAL(8,2),
    mother_id INT,
    father_id INT,
    status ENUM('healthy', 'sick', 'quarantine', 'deceased', 'sold') DEFAULT 'healthy',
    acquisition_date DATE DEFAULT (CURDATE()),
    acquisition_type ENUM('birth', 'purchase', 'transfer') DEFAULT 'birth',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    FOREIGN KEY (area_id) REFERENCES farm_areas(id) ON DELETE SET NULL,
    FOREIGN KEY (mother_id) REFERENCES animals(id) ON DELETE SET NULL,
    FOREIGN KEY (father_id) REFERENCES animals(id) ON DELETE SET NULL,
    INDEX idx_tag (tag_number),
    INDEX idx_farm (farm_id),
    INDEX idx_species (species),
    INDEX idx_status (status),
    INDEX idx_birth_date (birth_date),
    UNIQUE KEY unique_farm_tag (farm_id, tag_number)
);
```

**Purpose**: Comprehensive animal tracking and management
**Key Features**:
- Unique identification with farm-specific tag numbers
- Genealogy tracking (mother/father relationships)
- Automatic age calculation
- Location tracking within farm areas
- Status management for health and lifecycle

### 3.5 Health Records Table
```sql
CREATE TABLE health_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    animal_id INT NOT NULL,
    record_type ENUM('vaccination', 'treatment', 'checkup', 'illness', 'injury', 'death') NOT NULL,
    description TEXT NOT NULL,
    symptoms TEXT,
    diagnosis VARCHAR(255),
    treatment TEXT,
    medication VARCHAR(100),
    dosage VARCHAR(50),
    veterinarian_id INT,
    recorded_by INT NOT NULL,
    record_date DATE NOT NULL,
    follow_up_date DATE,
    cost DECIMAL(10,2),
    withdrawal_period_days INT,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE,
    FOREIGN KEY (veterinarian_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_animal (animal_id),
    INDEX idx_type (record_type),
    INDEX idx_date (record_date),
    INDEX idx_veterinarian (veterinarian_id),
    INDEX idx_status (status),
    INDEX idx_follow_up (follow_up_date)
);
```

**Purpose**: Comprehensive animal health tracking and treatment history
**Key Features**:
- Multiple record types for different health events
- Veterinarian involvement tracking
- Medication withdrawal period compliance
- Follow-up scheduling and management
- Cost tracking for financial analysis

### 3.6 Inventory Tables

#### Feed Inventory
```sql
CREATE TABLE feed_inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farm_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('starter', 'grower', 'finisher', 'breeder', 'supplement') NOT NULL,
    supplier VARCHAR(100),
    batch_number VARCHAR(50),
    quantity DECIMAL(10,2) NOT NULL,
    unit ENUM('kg', 'tons', 'bags') DEFAULT 'kg',
    cost_per_unit DECIMAL(10,2),
    purchase_date DATE,
    expiry_date DATE,
    storage_location VARCHAR(100),
    nutritional_info JSON,
    status ENUM('available', 'low_stock', 'expired', 'recalled') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    INDEX idx_farm (farm_id),
    INDEX idx_type (type),
    INDEX idx_expiry (expiry_date),
    INDEX idx_status (status)
);
```

#### Medicine Inventory
```sql
CREATE TABLE medicine_inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farm_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('antibiotic', 'vaccine', 'vitamin', 'dewormer', 'antiseptic', 'other') NOT NULL,
    manufacturer VARCHAR(100),
    batch_number VARCHAR(50),
    quantity DECIMAL(10,2) NOT NULL,
    unit ENUM('ml', 'tablets', 'doses', 'bottles') DEFAULT 'ml',
    cost_per_unit DECIMAL(10,2),
    purchase_date DATE,
    expiry_date DATE NOT NULL,
    storage_temperature VARCHAR(20),
    withdrawal_period_days INT,
    prescription_required BOOLEAN DEFAULT FALSE,
    status ENUM('available', 'low_stock', 'expired', 'recalled') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    INDEX idx_farm (farm_id),
    INDEX idx_type (type),
    INDEX idx_expiry (expiry_date),
    INDEX idx_status (status)
);
```

#### Equipment Inventory
```sql
CREATE TABLE equipment_inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farm_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    category ENUM('feeding', 'cleaning', 'medical', 'maintenance', 'safety', 'monitoring') NOT NULL,
    model VARCHAR(50),
    serial_number VARCHAR(50),
    purchase_date DATE,
    warranty_expiry DATE,
    last_maintenance DATE,
    next_maintenance DATE,
    condition_status ENUM('excellent', 'good', 'fair', 'poor', 'broken') DEFAULT 'good',
    location VARCHAR(100),
    cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    INDEX idx_farm (farm_id),
    INDEX idx_category (category),
    INDEX idx_condition (condition_status),
    INDEX idx_maintenance (next_maintenance)
);
```

### 3.7 Biosecurity Tables

#### Visitors Table
```sql
CREATE TABLE visitors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farm_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    purpose ENUM('inspection', 'delivery', 'maintenance', 'veterinary', 'audit', 'other') NOT NULL,
    entry_time TIMESTAMP NOT NULL,
    exit_time TIMESTAMP NULL,
    health_declaration BOOLEAN DEFAULT FALSE,
    temperature_check DECIMAL(4,1),
    disinfection_completed BOOLEAN DEFAULT FALSE,
    areas_visited JSON,
    escort_required BOOLEAN DEFAULT TRUE,
    escort_user_id INT,
    vehicle_info VARCHAR(100),
    notes TEXT,
    status ENUM('checked_in', 'on_site', 'checked_out') DEFAULT 'checked_in',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    FOREIGN KEY (escort_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_farm (farm_id),
    INDEX idx_entry_time (entry_time),
    INDEX idx_status (status)
);
```

#### Environmental Monitoring
```sql
CREATE TABLE environmental_monitoring (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farm_id INT NOT NULL,
    area_id INT,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    air_quality ENUM('excellent', 'good', 'moderate', 'poor', 'hazardous') DEFAULT 'good',
    ammonia_level DECIMAL(8,2),
    dust_level DECIMAL(8,2),
    water_quality ENUM('excellent', 'good', 'acceptable', 'poor') DEFAULT 'good',
    feed_quality ENUM('fresh', 'acceptable', 'stale', 'spoiled') DEFAULT 'fresh',
    recorded_by INT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    alert_triggered BOOLEAN DEFAULT FALSE,
    notes TEXT,
    
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    FOREIGN KEY (area_id) REFERENCES farm_areas(id) ON DELETE SET NULL,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_farm (farm_id),
    INDEX idx_area (area_id),
    INDEX idx_recorded_at (recorded_at),
    INDEX idx_alert (alert_triggered)
);
```

#### Cleaning Activities
```sql
CREATE TABLE cleaning_activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farm_id INT NOT NULL,
    area_id INT,
    activity_type ENUM('disinfection', 'deep_cleaning', 'routine_cleaning', 'equipment_cleaning') NOT NULL,
    cleaning_agent VARCHAR(100),
    concentration VARCHAR(20),
    method ENUM('spray', 'foam', 'manual', 'pressure_wash') NOT NULL,
    duration_minutes INT,
    performed_by INT NOT NULL,
    verified_by INT,
    scheduled_date DATE,
    completed_date DATE,
    effectiveness_rating ENUM('excellent', 'good', 'satisfactory', 'poor') DEFAULT 'good',
    photos JSON,
    notes TEXT,
    status ENUM('scheduled', 'in_progress', 'completed', 'verified') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    FOREIGN KEY (area_id) REFERENCES farm_areas(id) ON DELETE SET NULL,
    FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_farm (farm_id),
    INDEX idx_area (area_id),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_status (status)
);
```

### 3.8 System Tables

#### Inventory Alerts
```sql
CREATE TABLE inventory_alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farm_id INT NOT NULL,
    inventory_type ENUM('feed', 'medicine', 'equipment') NOT NULL,
    inventory_id INT NOT NULL,
    alert_type ENUM('low_stock', 'expiry_warning', 'expired', 'maintenance_due') NOT NULL,
    threshold_value DECIMAL(10,2),
    current_value DECIMAL(10,2),
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    message TEXT NOT NULL,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by INT,
    acknowledged_at TIMESTAMP NULL,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    FOREIGN KEY (acknowledged_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_farm (farm_id),
    INDEX idx_type (alert_type),
    INDEX idx_severity (severity),
    INDEX idx_acknowledged (acknowledged),
    INDEX idx_resolved (resolved)
);
```

#### Audit Log
```sql
CREATE TABLE audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    farm_id INT,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_farm (farm_id),
    INDEX idx_action (action),
    INDEX idx_table (table_name),
    INDEX idx_timestamp (timestamp)
);
```

## 4. Database Configuration

### 4.1 Connection Configuration
```javascript
// backend/config/db.js
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'farm_portal_user',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'digital_farm_portal',
    charset: 'utf8mb4',
    timezone: '+00:00',
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;
```

### 4.2 Environment Variables
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=farm_portal_user
DB_PASSWORD=secure_password_here
DB_NAME=digital_farm_portal

# Connection Pool Settings
DB_CONNECTION_LIMIT=10
DB_ACQUIRE_TIMEOUT=60000
DB_TIMEOUT=60000
```

## 5. Database Indexes and Performance

### 5.1 Primary Indexes
- All tables have auto-incrementing primary keys
- Unique constraints on business-critical fields (username, email, tag_number)
- Composite unique keys for farm-specific records

### 5.2 Performance Indexes
```sql
-- User performance indexes
CREATE INDEX idx_users_role_active ON users(role, is_active);
CREATE INDEX idx_users_last_login ON users(last_login);

-- Animal tracking indexes
CREATE INDEX idx_animals_farm_species ON animals(farm_id, species);
CREATE INDEX idx_animals_status_farm ON animals(status, farm_id);

-- Health records performance
CREATE INDEX idx_health_records_animal_date ON health_records(animal_id, record_date DESC);
CREATE INDEX idx_health_records_type_date ON health_records(record_type, record_date DESC);

-- Inventory performance
CREATE INDEX idx_feed_farm_status ON feed_inventory(farm_id, status);
CREATE INDEX idx_medicine_expiry_farm ON medicine_inventory(farm_id, expiry_date);

-- Biosecurity performance
CREATE INDEX idx_visitors_farm_date ON visitors(farm_id, entry_time DESC);
CREATE INDEX idx_environmental_farm_date ON environmental_monitoring(farm_id, recorded_at DESC);
```

### 5.3 Query Optimization
- Use of covering indexes for frequently accessed data
- Partitioning for large historical tables (audit_log, environmental_monitoring)
- Regular ANALYZE TABLE operations for query plan optimization

## 6. Data Integrity and Constraints

### 6.1 Foreign Key Constraints
- **CASCADE**: Child records deleted when parent is deleted (farm → animals)
- **RESTRICT**: Prevents deletion if child records exist (users → health_records)
- **SET NULL**: Sets foreign key to NULL when parent is deleted (manager assignments)

### 6.2 Check Constraints
```sql
-- Age validation
ALTER TABLE animals ADD CONSTRAINT chk_age CHECK (age >= 0 AND age <= 50);

-- Weight validation
ALTER TABLE animals ADD CONSTRAINT chk_weight CHECK (weight > 0);

-- Temperature validation
ALTER TABLE environmental_monitoring 
ADD CONSTRAINT chk_temperature CHECK (temperature BETWEEN -50 AND 100);

-- Quantity validation
ALTER TABLE feed_inventory ADD CONSTRAINT chk_quantity CHECK (quantity >= 0);
```

### 6.3 Data Validation Rules
- Email format validation using regular expressions
- Phone number format standardization
- Date range validations (birth_date cannot be in future)
- Enum value restrictions for controlled vocabularies

## 7. Backup and Recovery Strategy

### 7.1 Backup Configuration
```bash
#!/bin/bash
# Daily backup script
BACKUP_DIR="/var/backups/mysql"
DB_NAME="digital_farm_portal"
DATE=$(date +%Y%m%d_%H%M%S)

# Full backup
mysqldump --single-transaction --routines --triggers \
  --user=$DB_USER --password=$DB_PASSWORD \
  $DB_NAME > $BACKUP_DIR/full_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/full_backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### 7.2 Recovery Procedures
```bash
# Point-in-time recovery
mysql --user=$DB_USER --password=$DB_PASSWORD \
  $DB_NAME < full_backup_20240101_120000.sql

# Binary log recovery for recent changes
mysqlbinlog --start-datetime="2024-01-01 12:00:00" \
  --stop-datetime="2024-01-01 18:00:00" \
  mysql-bin.000001 | mysql --user=$DB_USER --password=$DB_PASSWORD
```

## 8. Security Measures

### 8.1 User Privileges
```sql
-- Application user with limited privileges
CREATE USER 'farm_portal_app'@'localhost' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON digital_farm_portal.* TO 'farm_portal_app'@'localhost';

-- Read-only user for reporting
CREATE USER 'farm_portal_readonly'@'localhost' IDENTIFIED BY 'readonly_password';
GRANT SELECT ON digital_farm_portal.* TO 'farm_portal_readonly'@'localhost';

-- Backup user
CREATE USER 'farm_portal_backup'@'localhost' IDENTIFIED BY 'backup_password';
GRANT SELECT, LOCK TABLES, SHOW VIEW ON digital_farm_portal.* TO 'farm_portal_backup'@'localhost';
```

### 8.2 Data Encryption
- Passwords hashed using bcrypt with salt rounds
- Sensitive data encrypted at application level
- SSL/TLS encryption for data in transit
- Encrypted backups for data at rest

### 8.3 Access Control
- Role-based database access aligned with application roles
- IP address restrictions for database connections
- Regular password rotation policies
- Audit logging for all database modifications

## 9. Monitoring and Maintenance

### 9.1 Performance Monitoring
```sql
-- Query performance monitoring
SELECT 
    SCHEMA_NAME,
    DIGEST_TEXT,
    COUNT_STAR,
    AVG_TIMER_WAIT/1000000000 as avg_time_seconds,
    SUM_ROWS_EXAMINED/COUNT_STAR as avg_rows_examined
FROM performance_schema.events_statements_summary_by_digest 
WHERE SCHEMA_NAME = 'digital_farm_portal'
ORDER BY AVG_TIMER_WAIT DESC 
LIMIT 10;
```

### 9.2 Storage Monitoring
```sql
-- Table size monitoring
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
    table_rows
FROM information_schema.tables 
WHERE table_schema = 'digital_farm_portal'
ORDER BY (data_length + index_length) DESC;
```

### 9.3 Maintenance Tasks
- Weekly OPTIMIZE TABLE operations
- Monthly index analysis and rebuilding
- Quarterly data archival for historical records
- Annual capacity planning and scaling assessment

## 10. Scalability Considerations

### 10.1 Horizontal Scaling
- Read replicas for reporting and analytics
- Database sharding by farm_id for large deployments
- Connection pooling and load balancing

### 10.2 Vertical Scaling
- Memory optimization for buffer pools
- SSD storage for improved I/O performance
- CPU scaling for complex analytical queries

### 10.3 Data Archival
```sql
-- Archive old records (older than 2 years)
CREATE TABLE health_records_archive LIKE health_records;

INSERT INTO health_records_archive 
SELECT * FROM health_records 
WHERE record_date < DATE_SUB(CURDATE(), INTERVAL 2 YEAR);

DELETE FROM health_records 
WHERE record_date < DATE_SUB(CURDATE(), INTERVAL 2 YEAR);
```

## 11. DML (Data Manipulation Language) Queries

This section provides examples of common DML queries used to manage data within the Digital Farm Portal.

### 11.1 INSERT Queries

- **Register a new Farm Worker:**
```sql
INSERT INTO users (username, password, email, role, first_name, last_name)
VALUES ('bob_worker', '$2b$10$S/somehashedpassword', 'bob@farm.com', 'farm_worker', 'Bob', 'Worker');
```

- **Add a new animal to a farm:**
```sql
INSERT INTO animals (tag_number, farm_id, species, breed, birth_date, status)
VALUES ('PIG-007', 1, 'pig', 'Yorkshire', '2023-05-10', 'healthy');
```

- **Log a new health record:**
```sql
INSERT INTO health_records (animal_id, record_type, description, recorded_by, record_date)
VALUES (7, 'vaccination', 'Annual flu vaccine administered', 2, CURDATE());
```

### 11.2 SELECT Queries

- **Retrieve all sick animals on a specific farm:**
```sql
SELECT id, tag_number, species, status
FROM animals
WHERE farm_id = 1 AND status = 'sick';
```

- **Get all low-stock medicine inventory:**
```sql
SELECT name, quantity, unit
FROM medicine_inventory
WHERE farm_id = 1 AND status = 'low_stock';
```

- **Fetch visitor logs for a compliance audit:**
```sql
SELECT name, company, purpose, entry_time, exit_time
FROM visitors
WHERE farm_id = 1 AND entry_time BETWEEN '2023-01-01' AND '2023-01-31';
```

### 11.3 UPDATE Queries

- **Update an animal's health status after recovery:**
```sql
UPDATE animals
SET status = 'healthy'
WHERE id = 7;
```

- **Decrease inventory quantity after use:**
```sql
UPDATE medicine_inventory
SET quantity = quantity - 5
WHERE id = 3 AND farm_id = 1;
```

- **Acknowledge a system-generated alert:**
```sql
UPDATE inventory_alerts
SET acknowledged = TRUE, acknowledged_by = 2, acknowledged_at = NOW()
WHERE id = 15;
```

### 11.4 DELETE Queries

- **Remove a deceased animal's record:**
```sql
DELETE FROM animals
WHERE id = 12 AND status = 'deceased';
```

- **Delete an old, resolved alert:**
```sql
DELETE FROM inventory_alerts
WHERE resolved = TRUE AND created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

This comprehensive database design supports the full functionality of the Digital Farm Portal while ensuring data integrity, performance, and scalability for growing farm operations.
