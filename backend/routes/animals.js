const express = require('express');
const { verifyToken, requireFarmAccess, auditLog } = require('../middleware/auth');

const router = express.Router();

// Get all animals (filtered by user's farm access)
router.get('/', verifyToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const userId = req.user.id;
        const userRole = req.user.role;
        const farmId = req.query.farm_id;

        let query;
        let params;

        if (farmId) {
            // Get animals for specific farm (with access check)
            if (userRole === 'system_admin') {
                query = `
                    SELECT a.*, f.name as farm_name
                    FROM animals a
                    JOIN farms f ON a.farm_id = f.id
                    WHERE a.farm_id = ?
                    ORDER BY a.created_at DESC
                `;
                params = [farmId];
            } else {
                query = `
                    SELECT DISTINCT a.*, f.name as farm_name
                    FROM animals a
                    JOIN farms f ON a.farm_id = f.id
                    LEFT JOIN farm_staff fs ON f.id = fs.farm_id
                    WHERE a.farm_id = ? AND (
                        f.owner_id = ? OR 
                        (fs.user_id = ? AND fs.is_active = TRUE)
                    )
                    ORDER BY a.created_at DESC
                `;
                params = [farmId, userId, userId];
            }
        } else {
            // Get all animals user has access to
            if (userRole === 'system_admin') {
                query = `
                    SELECT a.*, f.name as farm_name
                    FROM animals a
                    JOIN farms f ON a.farm_id = f.id
                    WHERE f.is_active = TRUE
                    ORDER BY a.created_at DESC
                `;
                params = [];
            } else {
                query = `
                    SELECT DISTINCT a.*, f.name as farm_name
                    FROM animals a
                    JOIN farms f ON a.farm_id = f.id
                    LEFT JOIN farm_staff fs ON f.id = fs.farm_id
                    WHERE f.is_active = TRUE AND (
                        f.owner_id = ? OR 
                        (fs.user_id = ? AND fs.is_active = TRUE)
                    )
                    ORDER BY a.created_at DESC
                `;
                params = [userId, userId];
            }
        }

        const [animals] = await db.execute(query, params);

        res.json({
            animals,
            total: animals.length
        });

    } catch (error) {
        console.error('Get animals error:', error);
        res.status(500).json({ error: 'Failed to fetch animals' });
    }
});

// Get single animal by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const animalId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        let query;
        let params;

        if (userRole === 'system_admin') {
            query = `
                SELECT a.*, f.name as farm_name, f.location as farm_location
                FROM animals a
                JOIN farms f ON a.farm_id = f.id
                WHERE a.id = ?
            `;
            params = [animalId];
        } else {
            query = `
                SELECT DISTINCT a.*, f.name as farm_name, f.location as farm_location
                FROM animals a
                JOIN farms f ON a.farm_id = f.id
                LEFT JOIN farm_staff fs ON f.id = fs.farm_id
                WHERE a.id = ? AND (
                    f.owner_id = ? OR 
                    (fs.user_id = ? AND fs.is_active = TRUE)
                )
            `;
            params = [animalId, userId, userId];
        }

        const [animals] = await db.execute(query, params);

        if (animals.length === 0) {
            return res.status(404).json({ error: 'Animal not found or access denied' });
        }

        res.json({ animal: animals[0] });

    } catch (error) {
        console.error('Get animal error:', error);
        res.status(500).json({ error: 'Failed to fetch animal details' });
    }
});

// Create new animal
router.post('/', verifyToken, auditLog('ANIMAL_CREATE'), async (req, res) => {
    try {
        const {
            farm_id, tag_number, species, breed, gender, 
            birth_date, weight, location, notes
        } = req.body;

        if (!farm_id || !tag_number || !species || !gender) {
            return res.status(400).json({ 
                error: 'Farm ID, tag number, species, and gender are required' 
            });
        }

        const validSpecies = ['chicken', 'pig', 'cow', 'goat', 'sheep'];
        if (!validSpecies.includes(species)) {
            return res.status(400).json({ 
                error: 'Invalid species. Must be one of: ' + validSpecies.join(', ') 
            });
        }

        const validGenders = ['male', 'female'];
        if (!validGenders.includes(gender)) {
            return res.status(400).json({ 
                error: 'Invalid gender. Must be male or female' 
            });
        }

        const db = req.app.locals.db;

        // Check if tag number already exists for this farm
        const [existing] = await db.execute(
            'SELECT id FROM animals WHERE farm_id = ? AND tag_number = ?',
            [farm_id, tag_number]
        );

        if (existing.length > 0) {
            return res.status(400).json({ 
                error: 'Tag number already exists for this farm' 
            });
        }

        const [result] = await db.execute(`
            INSERT INTO animals (farm_id, tag_number, species, breed, gender, birth_date, weight, location, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [farm_id, tag_number, species, breed, gender, birth_date, weight, location, notes]);

        res.status(201).json({
            message: 'Animal created successfully',
            animal: {
                id: result.insertId,
                farm_id,
                tag_number,
                species,
                breed,
                gender,
                birth_date,
                weight,
                location,
                notes
            }
        });

    } catch (error) {
        console.error('Create animal error:', error);
        res.status(500).json({ error: 'Failed to create animal' });
    }
});

// Update animal
router.put('/:id', verifyToken, auditLog('ANIMAL_UPDATE'), async (req, res) => {
    try {
        const animalId = req.params.id;
        const {
            tag_number, species, breed, gender, birth_date, 
            weight, health_status, location, notes
        } = req.body;

        const db = req.app.locals.db;

        const [result] = await db.execute(`
            UPDATE animals 
            SET tag_number = ?, species = ?, breed = ?, gender = ?, birth_date = ?,
                weight = ?, health_status = ?, location = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [tag_number, species, breed, gender, birth_date, weight, health_status, location, notes, animalId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Animal not found or no changes made' });
        }

        res.json({ message: 'Animal updated successfully' });

    } catch (error) {
        console.error('Update animal error:', error);
        res.status(500).json({ error: 'Failed to update animal' });
    }
});

// Delete animal
router.delete('/:id', verifyToken, auditLog('ANIMAL_DELETE'), async (req, res) => {
    try {
        const animalId = req.params.id;
        const db = req.app.locals.db;

        const [result] = await db.execute(
            'DELETE FROM animals WHERE id = ?',
            [animalId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Animal not found' });
        }

        res.json({ message: 'Animal deleted successfully' });

    } catch (error) {
        console.error('Delete animal error:', error);
        res.status(500).json({ error: 'Failed to delete animal' });
    }
});

module.exports = router;
