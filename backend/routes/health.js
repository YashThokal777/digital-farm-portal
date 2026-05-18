const express = require('express');
const { verifyToken, auditLog } = require('../middleware/auth');

const router = express.Router();

// Get health records for an animal
router.get('/animal/:id', verifyToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const animalId = req.params.id;

        const [records] = await db.execute(`
            SELECT hr.*, a.tag_number, a.species, f.name as farm_name,
                   u.first_name, u.last_name
            FROM health_records hr
            JOIN animals a ON hr.animal_id = a.id
            JOIN farms f ON a.farm_id = f.id
            JOIN users u ON hr.recorded_by = u.id
            WHERE hr.animal_id = ?
            ORDER BY hr.record_date DESC
        `, [animalId]);

        res.json({
            records,
            total: records.length
        });

    } catch (error) {
        console.error('Get health records error:', error);
        res.status(500).json({ error: 'Failed to fetch health records' });
    }
});

// Add new health record
router.post('/animal/:id', verifyToken, auditLog('HEALTH_RECORD_CREATE'), async (req, res) => {
    try {
        const animalId = req.params.id;
        const {
            record_type, description, treatment, medication, 
            dosage, veterinarian, cost, next_checkup_date
        } = req.body;

        if (!record_type || !description) {
            return res.status(400).json({ 
                error: 'Record type and description are required' 
            });
        }

        const validTypes = ['vaccination', 'treatment', 'checkup', 'illness', 'injury'];
        if (!validTypes.includes(record_type)) {
            return res.status(400).json({ 
                error: 'Invalid record type. Must be one of: ' + validTypes.join(', ') 
            });
        }

        const db = req.app.locals.db;
        const recordedBy = req.user.id;

        const [result] = await db.execute(`
            INSERT INTO health_records 
            (animal_id, record_type, description, treatment, medication, dosage, 
             veterinarian, cost, next_checkup_date, recorded_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [animalId, record_type, description, treatment, medication, dosage, 
            veterinarian, cost, next_checkup_date, recordedBy]);

        res.status(201).json({
            message: 'Health record created successfully',
            record: {
                id: result.insertId,
                animal_id: animalId,
                record_type,
                description,
                treatment,
                medication,
                dosage,
                veterinarian,
                cost,
                next_checkup_date,
                recorded_by: recordedBy
            }
        });

    } catch (error) {
        console.error('Create health record error:', error);
        res.status(500).json({ error: 'Failed to create health record' });
    }
});

// Get all health records (with filtering)
router.get('/', verifyToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { farm_id, record_type, start_date, end_date } = req.query;

        let query = `
            SELECT hr.*, a.tag_number, a.species, f.name as farm_name,
                   u.first_name, u.last_name
            FROM health_records hr
            JOIN animals a ON hr.animal_id = a.id
            JOIN farms f ON a.farm_id = f.id
            JOIN users u ON hr.recorded_by = u.id
            WHERE 1=1
        `;
        let params = [];

        if (farm_id) {
            query += ' AND f.id = ?';
            params.push(farm_id);
        }

        if (record_type) {
            query += ' AND hr.record_type = ?';
            params.push(record_type);
        }

        if (start_date) {
            query += ' AND hr.record_date >= ?';
            params.push(start_date);
        }

        if (end_date) {
            query += ' AND hr.record_date <= ?';
            params.push(end_date);
        }

        query += ' ORDER BY hr.record_date DESC';

        const [records] = await db.execute(query, params);

        res.json({
            records,
            total: records.length
        });

    } catch (error) {
        console.error('Get health records error:', error);
        res.status(500).json({ error: 'Failed to fetch health records' });
    }
});

module.exports = router;
