-- Inventory Management System Database Schema
-- Feed inventory, medicine stock, equipment maintenance, and alerts

-- Feed Inventory Table
CREATE TABLE IF NOT EXISTS feed_inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farm_id INT NOT NULL,
    feed_type VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    batch_number VARCHAR(50),
    quantity_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit_price DECIMAL(10,2),
    purchase_date DATE,
    expiry_date DATE,
    supplier VARCHAR(100),
    minimum_stock DECIMAL(10,2) DEFAULT 100,
    location VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
);

-- Medicine Inventory Table
CREATE TABLE IF NOT EXISTS medicine_inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farm_id INT NOT NULL,
    medicine_name VARCHAR(100) NOT NULL,
    medicine_type ENUM('antibiotic', 'vaccine', 'vitamin', 'dewormer', 'antiseptic', 'other') NOT NULL,
    brand VARCHAR(100),
    batch_number VARCHAR(50),
    quantity INT NOT NULL DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'pieces',
    unit_price DECIMAL(10,2),
    purchase_date DATE,
    expiry_date DATE,
    supplier VARCHAR(100),
    minimum_stock INT DEFAULT 10,
    storage_requirements TEXT,
    prescription_required BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
);

-- Equipment Inventory Table
CREATE TABLE IF NOT EXISTS equipment_inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farm_id INT NOT NULL,
    equipment_name VARCHAR(100) NOT NULL,
    equipment_type ENUM('feeding', 'cleaning', 'medical', 'maintenance', 'monitoring', 'other') NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    purchase_date DATE,
    warranty_expiry DATE,
    condition_status ENUM('excellent', 'good', 'fair', 'poor', 'needs_repair') DEFAULT 'good',
    location VARCHAR(100),
    purchase_price DECIMAL(10,2),
    supplier VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
);

-- Equipment Maintenance Records
CREATE TABLE IF NOT EXISTS equipment_maintenance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_id INT NOT NULL,
    maintenance_type ENUM('routine', 'repair', 'inspection', 'calibration') NOT NULL,
    maintenance_date DATE NOT NULL,
    performed_by INT,
    description TEXT,
    cost DECIMAL(10,2),
    next_maintenance_date DATE,
    status ENUM('completed', 'pending', 'overdue') DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment_inventory(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- Inventory Transactions (for tracking usage/additions)
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farm_id INT NOT NULL,
    item_type ENUM('feed', 'medicine', 'equipment') NOT NULL,
    item_id INT NOT NULL,
    transaction_type ENUM('purchase', 'usage', 'waste', 'transfer', 'adjustment') NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    performed_by INT,
    reference_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- Low Stock Alerts
CREATE TABLE IF NOT EXISTS inventory_alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farm_id INT NOT NULL,
    alert_type ENUM('low_stock', 'expiry_warning', 'maintenance_due', 'equipment_repair') NOT NULL,
    item_type ENUM('feed', 'medicine', 'equipment') NOT NULL,
    item_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    alert_message TEXT NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('active', 'acknowledged', 'resolved') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP NULL,
    acknowledged_by INT,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    FOREIGN KEY (acknowledged_by) REFERENCES users(id)
);

-- Reports Data Storage
CREATE TABLE IF NOT EXISTS farm_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farm_id INT NOT NULL,
    report_type ENUM('daily', 'weekly', 'monthly', 'custom') NOT NULL,
    report_category ENUM('health', 'biosecurity', 'inventory', 'financial', 'compliance') NOT NULL,
    report_date DATE NOT NULL,
    data JSON,
    summary TEXT,
    generated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(id)
);

-- Sample Data for Testing
INSERT IGNORE INTO feed_inventory (farm_id, feed_type, brand, quantity_kg, unit_price, purchase_date, expiry_date, supplier, minimum_stock, location) VALUES
(1, 'Pig Starter Feed', 'NutriPig', 500.00, 45.50, '2024-01-15', '2024-07-15', 'Farm Supply Co', 100, 'Storage Shed A'),
(1, 'Pig Grower Feed', 'NutriPig', 750.00, 42.00, '2024-01-15', '2024-07-15', 'Farm Supply Co', 150, 'Storage Shed A'),
(2, 'Poultry Layer Feed', 'ChickFeed Pro', 300.00, 38.75, '2024-01-20', '2024-06-20', 'Poultry Supplies Ltd', 80, 'Feed Room B');

INSERT IGNORE INTO medicine_inventory (farm_id, medicine_name, medicine_type, brand, quantity, unit, unit_price, purchase_date, expiry_date, supplier, minimum_stock) VALUES
(1, 'Amoxicillin Injectable', 'antibiotic', 'VetMed', 50, 'vials', 12.50, '2024-01-10', '2025-01-10', 'Veterinary Supplies', 10),
(1, 'Vitamin B Complex', 'vitamin', 'AnimalHealth', 100, 'tablets', 0.75, '2024-01-10', '2025-06-10', 'Veterinary Supplies', 20),
(2, 'Newcastle Disease Vaccine', 'vaccine', 'PoultryVax', 25, 'doses', 8.00, '2024-01-15', '2024-12-15', 'Poultry Health Co', 5);

INSERT IGNORE INTO equipment_inventory (farm_id, equipment_name, equipment_type, brand, model, purchase_date, condition_status, location, purchase_price) VALUES
(1, 'Automatic Feeder System', 'feeding', 'FarmTech', 'AF-2000', '2023-06-15', 'good', 'Pig Pen 1', 2500.00),
(1, 'High Pressure Washer', 'cleaning', 'CleanMaster', 'HP-500', '2023-08-20', 'excellent', 'Equipment Room', 800.00),
(2, 'Egg Collection System', 'feeding', 'PoultryPro', 'EC-100', '2023-09-10', 'good', 'Chicken House 1', 1500.00);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feed_farm_type ON feed_inventory(farm_id, feed_type);
CREATE INDEX IF NOT EXISTS idx_medicine_farm_type ON medicine_inventory(farm_id, medicine_type);
CREATE INDEX IF NOT EXISTS idx_equipment_farm_type ON equipment_inventory(farm_id, equipment_type);
CREATE INDEX IF NOT EXISTS idx_alerts_farm_status ON inventory_alerts(farm_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_farm_date ON inventory_transactions(farm_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_reports_farm_date ON farm_reports(farm_id, report_date);
