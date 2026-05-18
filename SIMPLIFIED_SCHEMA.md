# Simplified Database Schema

Here is a high-level overview of the core tables in the Digital Farm Portal database.

**1. Users**
-   `user_id` (PK)
-   `username` (unique)
-   `email` (unique)
-   `password`
-   `role` (e.g., 'farm_manager', 'farm_worker')
-   `created_at`
-   `updated_at`

**2. Farms**
-   `farm_id` (PK)
-   `farm_name`
-   `location`
-   `owner_id` (FK to Users)
-   `created_at`
-   `updated_at`

**3. Animals**
-   `animal_id` (PK)
-   `farm_id` (FK to Farms)
-   `tag_number` (unique within a farm)
-   `species`
-   `status` (e.g., 'healthy', 'sick')
-   `birth_date`
-   `created_at`
-   `updated_at`

**4. Health_Records**
-   `record_id` (PK)
-   `animal_id` (FK to Animals)
-   `record_type` (e.g., 'vaccination', 'treatment')
-   `description`
-   `recorded_by` (FK to Users)
-   `record_date`
-   `created_at`
-   `updated_at`

**5. Inventory_Medicine**
-   `medicine_id` (PK)
-   `farm_id` (FK to Farms)
-   `medicine_name`
-   `quantity`
-   `expiry_date`
-   `created_at`
-   `updated_at`

**6. Biosecurity_Visitors**
-   `visitor_id` (PK)
-   `farm_id` (FK to Farms)
-   `visitor_name`
-   `purpose`
-   `entry_time`
-   `exit_time`
-   `created_at`
-   `updated_at`
