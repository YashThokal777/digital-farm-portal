-- Fix biosecurity tables and ensure they exist with proper data

-- Create biosecurity_tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS biosecurity_tasks (
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

-- Create visitors table if it doesn't exist
CREATE TABLE IF NOT EXISTS visitors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farm_id INT NOT NULL,
    visitor_name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    purpose VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20),
    temperature DECIMAL(4,1),
    health_declaration BOOLEAN DEFAULT FALSE,
    areas_visited TEXT,
    escort_person VARCHAR(100),
    vehicle_number VARCHAR(20),
    entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exit_time TIMESTAMP NULL,
    disinfection_done BOOLEAN DEFAULT FALSE,
    approved_by INT,
    notes TEXT,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Create environmental_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS environmental_data (
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

-- Insert sample biosecurity tasks if table is empty
INSERT IGNORE INTO biosecurity_tasks (id, farm_id, task_type, area, description, assigned_to, scheduled_date, status) VALUES
(1, 1, 'inspection', 'Near Pig food section', 'inspected, everything found good!', 3, '2025-09-06', 'pending'),
(2, 2, 'maintenance', 'Milking Parlor', 'Check and clean milking equipment', 3, '2023-03-17', 'pending'),
(3, 1, 'cleaning', 'Coop A', 'Daily cleaning and sanitization', 4, '2023-03-16', 'pending'),
(4, 1, 'disinfection', 'Entry Gate', 'Disinfect entry area and footbaths', 4, '2023-03-16', 'pending'),
(5, 2, 'cleaning', 'Pen 1', 'Clean pig pens and feeding areas', 6, '2023-03-16', 'pending');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_biosecurity_farm_status ON biosecurity_tasks(farm_id, status);
CREATE INDEX IF NOT EXISTS idx_visitors_farm_entry ON visitors(farm_id, entry_time);
CREATE INDEX IF NOT EXISTS idx_environmental_farm_date ON environmental_data(farm_id, recorded_at);

-- Update farm names to match the sample data
UPDATE farms SET name = 'GreenWoods' WHERE id = 1;
UPDATE farms SET name = 'Green Valley Dairy' WHERE id = 2;
UPDATE farms SET name = 'Sunrise Poultry Farm' WHERE id = 3;
UPDATE farms SET name = 'Golden Pig Farm' WHERE id = 4;

-- Ensure we have the right users for assignments
INSERT IGNORE INTO users (id, username, first_name, last_name, role) VALUES
(3, 'sudeep', 'sudeep', 'wable', 'farm_worker'),
(4, 'anita', 'Anita', 'Patel', 'farm_worker'),
(6, 'sunita', 'Sunita', 'Gupta', 'farm_worker');
