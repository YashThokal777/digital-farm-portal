-- Create database and use it
CREATE DATABASE IF NOT EXISTS farm_portal;
USE farm_portal;

-- Import the schema
SOURCE backend/database/schema.sql;
