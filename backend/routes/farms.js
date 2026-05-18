const express = require('express');
const { verifyToken, requireRole, requireFarmAccess, auditLog } = require('../middleware/auth');

const router = express.Router();

// Get all farms (role-based access)
router.get('/', verifyToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const userId = req.user.id;
        const userRole = req.user.role;

        let query;
        let params;

        if (userRole === 'system_admin') {
            // System admin can see all farms
            query = `
                SELECT f.*, u.first_name, u.last_name, u.username as owner_username
                FROM farms f
                JOIN users u ON f.owner_id = u.id
                WHERE f.is_active = TRUE
                ORDER BY f.created_at DESC
            `;
            params = [];
        } else if (userRole === 'farm_owner') {
            // Farm owner can see their own farms
            query = `
                SELECT f.*, u.first_name, u.last_name, u.username as owner_username
                FROM farms f
                JOIN users u ON f.owner_id = u.id
                WHERE f.owner_id = ? AND f.is_active = TRUE
                ORDER BY f.created_at DESC
            `;
            params = [userId];
        } else {
            // Managers and workers can see farms they're assigned to
            query = `
                SELECT DISTINCT f.*, u.first_name, u.last_name, u.username as owner_username
                FROM farms f
                JOIN users u ON f.owner_id = u.id
                JOIN farm_staff fs ON f.id = fs.farm_id
                WHERE fs.user_id = ? AND fs.is_active = TRUE AND f.is_active = TRUE
                ORDER BY f.created_at DESC
            `;
            params = [userId];
        }

        const [farms] = await db.execute(query, params);

        res.json({
            farms,
            total: farms.length
        });

    } catch (error) {
        console.error('Get farms error:', error);
        res.status(500).json({ error: 'Failed to fetch farms' });
    }
});

// Get single farm by ID
router.get('/:id', verifyToken, requireFarmAccess, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const farmId = req.params.id;

        const [farms] = await db.execute(`
            SELECT f.*, u.first_name, u.last_name, u.username as owner_username,
                   COUNT(DISTINCT a.id) as animal_count,
                   COUNT(DISTINCT fs.id) as staff_count
            FROM farms f
            JOIN users u ON f.owner_id = u.id
            LEFT JOIN animals a ON f.id = a.farm_id
            LEFT JOIN farm_staff fs ON f.id = fs.farm_id AND fs.is_active = TRUE
            WHERE f.id = ? AND f.is_active = TRUE
            GROUP BY f.id
        `, [farmId]);

        if (farms.length === 0) {
            return res.status(404).json({ error: 'Farm not found' });
        }

        // Get farm staff details
        const [staff] = await db.execute(`
            SELECT fs.*, u.first_name, u.last_name, u.username, u.role
            FROM farm_staff fs
            JOIN users u ON fs.user_id = u.id
            WHERE fs.farm_id = ? AND fs.is_active = TRUE
            ORDER BY fs.assigned_date DESC
        `, [farmId]);

        const farm = farms[0];
        farm.staff = staff;

        res.json({ farm });

    } catch (error) {
        console.error('Get farm error:', error);
        res.status(500).json({ error: 'Failed to fetch farm details' });
    }
});

// Create new farm (restricted to owners, managers, and admins)
router.post('/', verifyToken, requireRole(['system_admin', 'farm_owner', 'farm_manager']), auditLog('FARM_CREATE'), async (req, res) => {
    const connection = await req.app.locals.db.getConnection();
    
    try {
        const { name, location, farm_type, area_hectares, established_date, license_number } = req.body;

        if (!name || !farm_type) {
            return res.status(400).json({ 
                error: 'Farm name and type are required' 
            });
        }

        const validTypes = ['poultry', 'pig', 'cattle', 'mixed'];
        if (!validTypes.includes(farm_type)) {
            return res.status(400).json({ 
                error: 'Invalid farm type. Must be one of: ' + validTypes.join(', ') 
            });
        }

        const userId = req.user.id;
        const userRole = req.user.role;

        // Start transaction
        await connection.beginTransaction();

        // Determine owner_id based on user role
        let ownerId = userId;
        if (userRole === 'farm_manager') {
            // For managers, we need to specify who the owner is
            // For simplicity, we'll use the first farm_owner in the system
            const [owners] = await connection.execute(
                'SELECT id FROM users WHERE role = "farm_owner" AND is_active = TRUE LIMIT 1'
            );
            if (owners.length > 0) {
                ownerId = owners[0].id;
            }
        }

        // Create farm
        const [result] = await connection.execute(`
            INSERT INTO farms (name, location, farm_type, owner_id, area_hectares, established_date, license_number)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [name, location, farm_type, ownerId, area_hectares, established_date, license_number]);

        // If user is a manager, assign them to the farm
        if (userRole === 'farm_manager') {
            await connection.execute(`
                INSERT INTO farm_staff (farm_id, user_id, role)
                VALUES (?, ?, 'manager')
            `, [result.insertId, userId]);
        }

        // Commit transaction
        await connection.commit();

        res.status(201).json({
            message: 'Farm created successfully',
            farm: {
                id: result.insertId,
                name,
                location,
                farm_type,
                owner_id: ownerId,
                area_hectares,
                established_date,
                license_number
            }
        });

    } catch (error) {
        // Rollback transaction on error
        await connection.rollback();
        console.error('Create farm error:', error);
        res.status(500).json({ error: 'Failed to create farm' });
    } finally {
        connection.release();
    }
});

// Update farm
router.put('/:id', verifyToken, requireFarmAccess, auditLog('FARM_UPDATE'), async (req, res) => {
    try {
        const farmId = req.params.id;
        const { name, location, farm_type, area_hectares, established_date, license_number } = req.body;

        const db = req.app.locals.db;

        const [result] = await db.execute(`
            UPDATE farms 
            SET name = ?, location = ?, farm_type = ?, area_hectares = ?, 
                established_date = ?, license_number = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND is_active = TRUE
        `, [name, location, farm_type, area_hectares, established_date, license_number, farmId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Farm not found or no changes made' });
        }

        res.json({ message: 'Farm updated successfully' });

    } catch (error) {
        console.error('Update farm error:', error);
        res.status(500).json({ error: 'Failed to update farm' });
    }
});

// Delete farm (soft delete)
router.delete('/:id', verifyToken, requireRole(['system_admin', 'farm_owner']), auditLog('FARM_DELETE'), async (req, res) => {
    try {
        const farmId = req.params.id;
        const db = req.app.locals.db;

        const [result] = await db.execute(`
            UPDATE farms 
            SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [farmId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Farm not found' });
        }

        res.json({ message: 'Farm deleted successfully' });

    } catch (error) {
        console.error('Delete farm error:', error);
        res.status(500).json({ error: 'Failed to delete farm' });
    }
});

// Assign staff to farm
router.post('/:id/staff', verifyToken, requireRole(['system_admin', 'farm_owner', 'farm_manager']), auditLog('FARM_STAFF_ASSIGN'), async (req, res) => {
    try {
        const farmId = req.params.id;
        const { user_id, role } = req.body;

        if (!user_id || !role) {
            return res.status(400).json({ 
                error: 'User ID and role are required' 
            });
        }

        const validRoles = ['manager', 'worker'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ 
                error: 'Invalid role. Must be manager or worker' 
            });
        }

        const db = req.app.locals.db;

        // Check if user exists and has appropriate role
        const [users] = await db.execute(
            'SELECT id, role FROM users WHERE id = ? AND is_active = TRUE',
            [user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found or inactive' });
        }

        const userRole = users[0].role;
        if ((role === 'manager' && userRole !== 'farm_manager') || 
            (role === 'worker' && userRole !== 'farm_worker')) {
            return res.status(400).json({ 
                error: 'User role does not match assignment role' 
            });
        }

        // Check if assignment already exists
        const [existing] = await db.execute(
            'SELECT id FROM farm_staff WHERE farm_id = ? AND user_id = ?',
            [farmId, user_id]
        );

        if (existing.length > 0) {
            // Update existing assignment
            await db.execute(
                'UPDATE farm_staff SET role = ?, is_active = TRUE WHERE farm_id = ? AND user_id = ?',
                [role, farmId, user_id]
            );
        } else {
            // Create new assignment
            await db.execute(
                'INSERT INTO farm_staff (farm_id, user_id, role) VALUES (?, ?, ?)',
                [farmId, user_id, role]
            );
        }

        res.json({ message: 'Staff assigned successfully' });

    } catch (error) {
        console.error('Assign staff error:', error);
        res.status(500).json({ error: 'Failed to assign staff' });
    }
});

// Remove staff from farm
router.delete('/:id/staff/:userId', verifyToken, requireRole(['system_admin', 'farm_owner', 'farm_manager']), auditLog('FARM_STAFF_REMOVE'), async (req, res) => {
    try {
        const farmId = req.params.id;
        const userId = req.params.userId;
        const db = req.app.locals.db;

        const [result] = await db.execute(
            'UPDATE farm_staff SET is_active = FALSE WHERE farm_id = ? AND user_id = ?',
            [farmId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Staff assignment not found' });
        }

        res.json({ message: 'Staff removed successfully' });

    } catch (error) {
        console.error('Remove staff error:', error);
        res.status(500).json({ error: 'Failed to remove staff' });
    }
});

module.exports = router;
