const express = require('express');
const { verifyToken, auditLog } = require('../middleware/auth');

const router = express.Router();

// Get visitors
router.get('/visitors', verifyToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { farm_id, date } = req.query;

        let query = `
            SELECT v.*, f.name as farm_name, u.first_name, u.last_name
            FROM visitors v
            JOIN farms f ON v.farm_id = f.id
            LEFT JOIN users u ON v.approved_by = u.id
            WHERE 1=1
        `;
        let params = [];

        if (farm_id) {
            query += ' AND v.farm_id = ?';
            params.push(farm_id);
        }

        if (date) {
            query += ' AND DATE(v.entry_time) = ?';
            params.push(date);
        }

        query += ' ORDER BY v.entry_time DESC';

        const [visitors] = await db.execute(query, params);

        res.json({
            visitors,
            total: visitors.length
        });

    } catch (error) {
        console.error('Get visitors error:', error);
        res.status(500).json({ error: 'Failed to fetch visitors' });
    }
});

// Register visitor
router.post('/visitors', verifyToken, auditLog('VISITOR_REGISTER'), async (req, res) => {
    try {
        const {
            farm_id, visitor_name, company, purpose, contact_number,
            temperature, health_declaration, areas_visited, escort_person,
            vehicle_number, notes
        } = req.body;

        if (!farm_id || !visitor_name || !purpose) {
            return res.status(400).json({ 
                error: 'Farm ID, visitor name, and purpose are required' 
            });
        }

        const db = req.app.locals.db;
        const approvedBy = req.user.id;

        const [result] = await db.execute(`
            INSERT INTO visitors 
            (farm_id, visitor_name, company, purpose, contact_number, temperature,
             health_declaration, areas_visited, escort_person, vehicle_number, 
             approved_by, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [farm_id, visitor_name, company, purpose, contact_number, temperature,
            health_declaration, areas_visited, escort_person, vehicle_number, 
            approvedBy, notes]);

        res.status(201).json({
            message: 'Visitor registered successfully',
            visitor: {
                id: result.insertId,
                farm_id,
                visitor_name,
                company,
                purpose,
                entry_time: new Date()
            }
        });

    } catch (error) {
        console.error('Register visitor error:', error);
        res.status(500).json({ error: 'Failed to register visitor' });
    }
});

// Check out visitor
router.put('/visitors/:id/checkout', verifyToken, auditLog('VISITOR_CHECKOUT'), async (req, res) => {
    try {
        const visitorId = req.params.id;
        const { disinfection_done, notes } = req.body;

        const db = req.app.locals.db;

        const [result] = await db.execute(`
            UPDATE visitors 
            SET exit_time = CURRENT_TIMESTAMP, disinfection_done = ?, notes = ?
            WHERE id = ?
        `, [disinfection_done, notes, visitorId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Visitor not found' });
        }

        res.json({ message: 'Visitor checked out successfully' });

    } catch (error) {
        console.error('Checkout visitor error:', error);
        res.status(500).json({ error: 'Failed to checkout visitor' });
    }
});

// Get environmental data
router.get('/environmental', verifyToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { farm_id, area, date } = req.query;

        let query = `
            SELECT ed.*, f.name as farm_name, u.first_name, u.last_name
            FROM environmental_data ed
            JOIN farms f ON ed.farm_id = f.id
            JOIN users u ON ed.recorded_by = u.id
            WHERE 1=1
        `;
        let params = [];

        if (farm_id) {
            query += ' AND ed.farm_id = ?';
            params.push(farm_id);
        }

        if (area) {
            query += ' AND ed.area = ?';
            params.push(area);
        }

        if (date) {
            query += ' AND DATE(ed.recorded_at) = ?';
            params.push(date);
        }

        query += ' ORDER BY ed.recorded_at DESC';

        const [data] = await db.execute(query, params);

        res.json({
            data,
            total: data.length
        });

    } catch (error) {
        console.error('Get environmental data error:', error);
        res.status(500).json({ error: 'Failed to fetch environmental data' });
    }
});

// Record environmental data
router.post('/environmental', verifyToken, auditLog('ENVIRONMENTAL_RECORD'), async (req, res) => {
    try {
        const {
            farm_id, area, temperature, humidity, air_quality_index,
            water_ph, feed_quality_score, notes
        } = req.body;

        if (!farm_id || !area) {
            return res.status(400).json({ 
                error: 'Farm ID and area are required' 
            });
        }

        const db = req.app.locals.db;
        const recordedBy = req.user.id;

        const [result] = await db.execute(`
            INSERT INTO environmental_data 
            (farm_id, area, temperature, humidity, air_quality_index, 
             water_ph, feed_quality_score, recorded_by, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [farm_id, area, temperature, humidity, air_quality_index, 
            water_ph, feed_quality_score, recordedBy, notes]);

        res.status(201).json({
            message: 'Environmental data recorded successfully',
            data: {
                id: result.insertId,
                farm_id,
                area,
                temperature,
                humidity,
                air_quality_index,
                water_ph,
                feed_quality_score,
                recorded_by: recordedBy
            }
        });

    } catch (error) {
        console.error('Record environmental data error:', error);
        res.status(500).json({ error: 'Failed to record environmental data' });
    }
});

// Get biosecurity tasks
router.get('/tasks', verifyToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { farm_id, status, assigned_to } = req.query;

        let query = `
            SELECT bt.*, f.name as farm_name, 
                   u1.first_name as assigned_first_name, u1.last_name as assigned_last_name,
                   u2.first_name as completed_first_name, u2.last_name as completed_last_name
            FROM biosecurity_tasks bt
            JOIN farms f ON bt.farm_id = f.id
            LEFT JOIN users u1 ON bt.assigned_to = u1.id
            LEFT JOIN users u2 ON bt.completed_by = u2.id
            WHERE 1=1
        `;
        let params = [];

        if (farm_id) {
            query += ' AND bt.farm_id = ?';
            params.push(farm_id);
        }

        if (status) {
            query += ' AND bt.status = ?';
            params.push(status);
        }

        if (assigned_to) {
            query += ' AND bt.assigned_to = ?';
            params.push(assigned_to);
        }

        query += ' ORDER BY bt.scheduled_date DESC';

        const [tasks] = await db.execute(query, params);

        res.json({
            tasks,
            total: tasks.length
        });

    } catch (error) {
        console.error('Get biosecurity tasks error:', error);
        res.status(500).json({ error: 'Failed to fetch biosecurity tasks' });
    }
});

// Create biosecurity task
router.post('/tasks', verifyToken, auditLog('BIOSECURITY_TASK_CREATE'), async (req, res) => {
    try {
        const {
            farm_id, task_type, area, description, assigned_to, scheduled_date
        } = req.body;

        if (!farm_id || !task_type || !area || !description || !scheduled_date) {
            return res.status(400).json({ 
                error: 'Farm ID, task type, area, description, and scheduled date are required' 
            });
        }

        const validTypes = ['cleaning', 'disinfection', 'maintenance', 'inspection'];
        if (!validTypes.includes(task_type)) {
            return res.status(400).json({ 
                error: 'Invalid task type. Must be one of: ' + validTypes.join(', ') 
            });
        }

        // Handle assigned_to field - use current user if not provided or empty
        const assignedUserId = assigned_to && assigned_to !== '' ? assigned_to : req.user.id;

        const db = req.app.locals.db;

        const [result] = await db.execute(`
            INSERT INTO biosecurity_tasks 
            (farm_id, task_type, area, description, assigned_to, scheduled_date)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [farm_id, task_type, area, description, assignedUserId, scheduled_date]);

        res.status(201).json({
            message: 'Biosecurity task created successfully',
            task: {
                id: result.insertId,
                farm_id,
                task_type,
                area,
                description,
                assigned_to,
                scheduled_date,
                status: 'pending'
            }
        });

    } catch (error) {
        console.error('Create biosecurity task error:', error);
        res.status(500).json({ error: 'Failed to create biosecurity task' });
    }
});

// Complete biosecurity task
router.put('/tasks/:id/complete', verifyToken, auditLog('BIOSECURITY_TASK_COMPLETE'), async (req, res) => {
    try {
        const taskId = req.params.id;
        const { verification_photo, notes } = req.body;
        const completedBy = req.user.id;

        console.log('Task completion request:', { taskId, completedBy, verification_photo, notes });

        if (!taskId || !completedBy) {
            return res.status(400).json({ error: 'Task ID and user ID are required' });
        }

        const db = req.app.locals.db;

        // Handle undefined values by setting them to null
        const safeVerificationPhoto = verification_photo || null;
        const safeNotes = notes || 'Task completed';

        const [result] = await db.execute(`
            UPDATE biosecurity_tasks 
            SET status = 'completed', completed_by = ?, completed_date = CURRENT_TIMESTAMP,
                verification_photo = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [completedBy, safeVerificationPhoto, safeNotes, taskId]);

        console.log('Update result:', result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Biosecurity task not found' });
        }

        res.json({ message: 'Biosecurity task completed successfully' });

    } catch (error) {
        console.error('Complete biosecurity task error:', error);
        res.status(500).json({ error: 'Failed to complete biosecurity task' });
    }
});

module.exports = router;
