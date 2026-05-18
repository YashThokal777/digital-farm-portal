-- Digital Farm Portal Database Schema
-- 4-Role System: system_admin, farm_owner, farm_manager, farm_worker

-- Drop existing tables if they exist
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS environmental_data;
DROP TABLE IF EXISTS biosecurity_tasks;
DROP TABLE IF EXISTS visitors;
DROP TABLE IF EXISTS health_records;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS animals;
DROP TABLE IF EXISTS farm_staff;
DROP TABLE IF EXISTS farms;
DROP TABLE IF EXISTS users;

-- Users table with 4-role system
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('system_admin', 'farm_owner', 'farm_manager', 'farm_worker') NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    failed_login_attempts INT DEFAULT 0,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Farms table
CREATE TABLE farms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    farm_type ENUM('poultry', 'pig', 'cattle', 'mixed') NOT NULL,
    owner_id INT NOT NULL,
    area_hectares DECIMAL(10,2),
    established_date DATE,
    license_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Farm staff assignments
CREATE TABLE farm_staff (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farm_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('manager', 'worker') NOT NULL,
    assigned_date DATE DEFAULT (CURRENT_DATE),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_farm_user (farm_id, user_id)
);

-- Animals table
CREATE TABLE animals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farm_id INT NOT NULL,
    tag_number VARCHAR(50) NOT NULL,
    species ENUM('chicken', 'pig', 'cow', 'goat', 'sheep') NOT NULL,
    breed VARCHAR(50),
    gender ENUM('male', 'female') NOT NULL,
    birth_date DATE,
    weight DECIMAL(8,2),
    health_status ENUM('healthy', 'sick', 'quarantine', 'deceased') DEFAULT 'healthy',
    location VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    UNIQUE KEY unique_farm_tag (farm_id, tag_number)
);

-- Health records
CREATE TABLE health_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    animal_id INT NOT NULL,
    record_type ENUM('vaccination', 'treatment', 'checkup', 'illness', 'injury') NOT NULL,
    description TEXT NOT NULL,
    treatment VARCHAR(200),
    medication VARCHAR(100),
    dosage VARCHAR(50),
    veterinarian VARCHAR(100),
    cost DECIMAL(10,2),
    next_checkup_date DATE,
    recorded_by INT NOT NULL,
    record_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- Inventory management
CREATE TABLE inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farm_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    category ENUM('feed', 'medicine', 'equipment', 'supplies') NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    cost_per_unit DECIMAL(10,2),
    supplier VARCHAR(100),
    purchase_date DATE,
    expiry_date DATE,
    minimum_stock DECIMAL(10,2) DEFAULT 0,
    location VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
);

-- Visitors management
CREATE TABLE visitors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farm_id INT NOT NULL,
    visitor_name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    purpose VARCHAR(200) NOT NULL,
    contact_number VARCHAR(20),
    entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exit_time TIMESTAMP NULL,
    temperature DECIMAL(4,1),
    health_declaration BOOLEAN DEFAULT FALSE,
    areas_visited TEXT,
    escort_person VARCHAR(100),
    vehicle_number VARCHAR(20),
    disinfection_done BOOLEAN DEFAULT FALSE,
    approved_by INT,
    notes TEXT,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Biosecurity tasks
CREATE TABLE biosecurity_tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farm_id INT NOT NULL,
    task_type ENUM('cleaning', 'disinfection', 'maintenance', 'inspection') NOT NULL,
    area VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    assigned_to INT,
    completed_by INT,
    scheduled_date DATE NOT NULL,
    completed_date TIMESTAMP NULL,
    status ENUM('pending', 'in_progress', 'completed', 'overdue') DEFAULT 'pending',
    verification_photo VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (completed_by) REFERENCES users(id)
);

-- Environmental monitoring
CREATE TABLE environmental_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farm_id INT NOT NULL,
    area VARCHAR(100) NOT NULL,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    air_quality_index INT,
    water_ph DECIMAL(4,2),
    feed_quality_score INT,
    recorded_by INT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- User sessions for enhanced security
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_user_expires (user_id, expires_at)
);

-- Audit log for tracking all activities
CREATE TABLE audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_action (user_id, action),
    INDEX idx_created_at (created_at)
);

-- Insert sample users with Indian names
INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone) VALUES
('admin_rajesh', 'rajesh.admin@farmportal.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'system_admin', 'Rajesh', 'Kumar', '+91-9876543210'),
('owner_priya', 'priya.owner@farmportal.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farm_owner', 'Priya', 'Sharma', '+91-9876543211'),
('manager_arjun', 'arjun.manager@farmportal.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farm_manager', 'Arjun', 'Singh', '+91-9876543212'),
('worker_anita', 'anita.worker@farmportal.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farm_worker', 'Anita', 'Patel', '+91-9876543213'),
('manager_vikram', 'vikram.manager@farmportal.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farm_manager', 'Vikram', 'Reddy', '+91-9876543214'),
('worker_sunita', 'sunita.worker@farmportal.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farm_worker', 'Sunita', 'Gupta', '+91-9876543215');

-- Insert sample farms
INSERT INTO farms (name, location, farm_type, owner_id, area_hectares, established_date, license_number) VALUES
('Sunrise Poultry Farm', 'Pune, Maharashtra', 'poultry', 2, 5.5, '2020-03-15', 'PUN-POULTRY-2020-001'),
('Golden Pig Farm', 'Bangalore, Karnataka', 'pig', 2, 8.2, '2019-07-22', 'BLR-PIG-2019-002'),
('Green Valley Dairy', 'Ahmedabad, Gujarat', 'cattle', 2, 12.0, '2018-11-10', 'AMD-CATTLE-2018-003');

-- Insert farm staff assignments
INSERT INTO farm_staff (farm_id, user_id, role) VALUES
(1, 3, 'manager'),  -- Arjun manages Sunrise Poultry
(1, 4, 'worker'),   -- Anita works at Sunrise Poultry
(2, 5, 'manager'),  -- Vikram manages Golden Pig Farm
(2, 6, 'worker'),   -- Sunita works at Golden Pig Farm
(3, 3, 'manager');  -- Arjun also manages Green Valley Dairy

-- Insert sample animals
INSERT INTO animals (farm_id, tag_number, species, breed, gender, birth_date, weight, location) VALUES
(1, 'CH001', 'chicken', 'Rhode Island Red', 'female', '2023-01-15', 2.5, 'Coop A'),
(1, 'CH002', 'chicken', 'Leghorn', 'male', '2023-01-20', 3.2, 'Coop A'),
(1, 'CH003', 'chicken', 'Rhode Island Red', 'female', '2023-02-01', 2.8, 'Coop B'),
(2, 'PG001', 'pig', 'Yorkshire', 'female', '2022-08-10', 85.5, 'Pen 1'),
(2, 'PG002', 'pig', 'Duroc', 'male', '2022-07-15', 95.2, 'Pen 2'),
(3, 'CT001', 'cow', 'Holstein', 'female', '2021-05-20', 450.0, 'Barn A'),
(3, 'CT002', 'cow', 'Jersey', 'female', '2021-06-10', 380.5, 'Barn A');

-- Insert sample health records
INSERT INTO health_records (animal_id, record_type, description, treatment, medication, veterinarian, recorded_by, record_date) VALUES
(1, 'vaccination', 'Newcastle Disease Vaccine', 'Vaccination', 'Newcastle Vaccine', 'Dr. Mehta', 3, '2023-02-01 10:00:00'),
(2, 'checkup', 'Routine health checkup', 'General examination', NULL, 'Dr. Mehta', 3, '2023-02-15 14:30:00'),
(4, 'treatment', 'Respiratory infection treatment', 'Antibiotic course', 'Amoxicillin', 'Dr. Verma', 5, '2023-03-01 09:15:00'),
(6, 'vaccination', 'FMD Vaccination', 'Vaccination', 'FMD Vaccine', 'Dr. Joshi', 3, '2023-01-20 11:00:00');

-- Insert sample inventory
INSERT INTO inventory (farm_id, item_name, category, quantity, unit, cost_per_unit, supplier, purchase_date, expiry_date, minimum_stock) VALUES
(1, 'Layer Feed', 'feed', 500.0, 'kg', 25.50, 'Godrej Agrovet', '2023-03-01', '2023-09-01', 100.0),
(1, 'Multivitamin', 'medicine', 50.0, 'bottles', 120.00, 'Vetcare India', '2023-02-15', '2024-02-15', 10.0),
(2, 'Pig Starter Feed', 'feed', 800.0, 'kg', 32.00, 'Cargill India', '2023-03-05', '2023-12-05', 200.0),
(3, 'Cattle Feed', 'feed', 1200.0, 'kg', 28.75, 'Amul Feeds', '2023-02-28', '2023-11-28', 300.0);

-- Insert sample environmental data
INSERT INTO environmental_data (farm_id, area, temperature, humidity, air_quality_index, recorded_by, recorded_at) VALUES
(1, 'Coop A', 24.5, 65.2, 85, 4, '2023-03-15 08:00:00'),
(1, 'Coop B', 25.1, 62.8, 88, 4, '2023-03-15 08:15:00'),
(2, 'Pen 1', 22.8, 70.5, 82, 6, '2023-03-15 09:00:00'),
(3, 'Barn A', 21.5, 68.9, 90, 3, '2023-03-15 07:30:00');

-- Insert sample biosecurity tasks
INSERT INTO biosecurity_tasks (farm_id, task_type, area, description, assigned_to, scheduled_date, status) VALUES
(1, 'cleaning', 'Coop A', 'Daily cleaning and sanitization', 4, '2023-03-16', 'pending'),
(1, 'disinfection', 'Entry Gate', 'Disinfect entry area and footbaths', 4, '2023-03-16', 'pending'),
(2, 'cleaning', 'Pen 1', 'Clean pig pens and feeding areas', 6, '2023-03-16', 'pending'),
(3, 'maintenance', 'Milking Parlor', 'Check and clean milking equipment', 3, '2023-03-17', 'pending');

-- Insert sample visitor record
INSERT INTO visitors (farm_id, visitor_name, company, purpose, contact_number, temperature, health_declaration, approved_by) VALUES
(1, 'Dr. Rajesh Veterinarian', 'Animal Health Clinic', 'Routine health inspection', '+91-9988776655', 98.4, TRUE, 3),
(2, 'Amit Feed Supplier', 'Quality Feeds Ltd', 'Feed delivery and quality check', '+91-9876543299', 98.6, TRUE, 5);

-- Create indexes for better performance
CREATE INDEX idx_animals_farm_species ON animals(farm_id, species);
CREATE INDEX idx_health_records_animal_date ON health_records(animal_id, record_date);
CREATE INDEX idx_inventory_farm_category ON inventory(farm_id, category);
CREATE INDEX idx_environmental_farm_date ON environmental_data(farm_id, recorded_at);
CREATE INDEX idx_biosecurity_farm_status ON biosecurity_tasks(farm_id, status);
CREATE INDEX idx_visitors_farm_entry ON visitors(farm_id, entry_time);

-- Note: All passwords are hashed version of 'password123' for demo purposes
-- In production, use strong passwords and proper hashing
