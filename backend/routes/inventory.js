const express = require('express');
const { verifyToken, auditLog } = require('../middleware/auth');

const router = express.Router();

// Get feed inventory
router.get('/feed', verifyToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { farm_id, low_stock } = req.query;

        let query = `
            SELECT f.*, farms.name as farm_name
            FROM feed_inventory f
            JOIN farms ON f.farm_id = farms.id
            WHERE 1=1
        `;
        let params = [];

        if (farm_id) {
            query += ' AND f.farm_id = ?';
            params.push(farm_id);
        }

        if (low_stock === 'true') {
            query += ' AND f.quantity_kg <= f.minimum_stock';
        }

        query += ' ORDER BY f.created_at DESC';

        const [items] = await db.execute(query, params);

        res.json({
            items,
            total: items.length
        });

    } catch (error) {
        console.error('Get feed inventory error:', error);
        res.status(500).json({ error: 'Failed to fetch feed inventory' });
    }
});

// Get medicine inventory
router.get('/medicine', verifyToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { farm_id, low_stock } = req.query;

        let query = `
            SELECT m.*, farms.name as farm_name
            FROM medicine_inventory m
            JOIN farms ON m.farm_id = farms.id
            WHERE 1=1
        `;
        let params = [];

        if (farm_id) {
            query += ' AND m.farm_id = ?';
            params.push(farm_id);
        }

        if (low_stock === 'true') {
            query += ' AND m.quantity <= m.minimum_stock';
        }

        query += ' ORDER BY m.created_at DESC';

        const [items] = await db.execute(query, params);

        res.json({
            items,
            total: items.length
        });

    } catch (error) {
        console.error('Get medicine inventory error:', error);
        res.status(500).json({ error: 'Failed to fetch medicine inventory' });
    }
});

// Get equipment inventory
router.get('/equipment', verifyToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { farm_id } = req.query;

        let query = `
            SELECT e.*, farms.name as farm_name
            FROM equipment_inventory e
            JOIN farms ON e.farm_id = farms.id
            WHERE 1=1
        `;
        let params = [];

        if (farm_id) {
            query += ' AND e.farm_id = ?';
            params.push(farm_id);
        }

        query += ' ORDER BY e.created_at DESC';

        const [items] = await db.execute(query, params);

        res.json({
            items,
            total: items.length
        });

    } catch (error) {
        console.error('Get equipment inventory error:', error);
        res.status(500).json({ error: 'Failed to fetch equipment inventory' });
    }
});

// Add feed inventory
router.post('/feed', verifyToken, auditLog('FEED_CREATE'), async (req, res) => {
    try {
        const {
            farm_id, feed_type, brand, batch_number, quantity_kg, unit_price,
            purchase_date, expiry_date, supplier, minimum_stock, location, notes
        } = req.body;

        if (!farm_id || !feed_type || !quantity_kg) {
            return res.status(400).json({ 
                error: 'Farm ID, feed type, and quantity are required' 
            });
        }

        const db = req.app.locals.db;

        const [result] = await db.execute(`
            INSERT INTO feed_inventory 
            (farm_id, feed_type, brand, batch_number, quantity_kg, unit_price, 
             purchase_date, expiry_date, supplier, minimum_stock, location, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [farm_id, feed_type, brand, batch_number, quantity_kg, unit_price, 
            purchase_date, expiry_date, supplier, minimum_stock || 100, location, notes]);

        res.status(201).json({
            message: 'Feed inventory created successfully',
            item: {
                id: result.insertId,
                farm_id, feed_type, brand, quantity_kg, unit_price,
                purchase_date, expiry_date, supplier, minimum_stock, location, notes
            }
        });

    } catch (error) {
        console.error('Create feed inventory error:', error);
        res.status(500).json({ error: 'Failed to create feed inventory' });
    }
});

// Add medicine inventory
router.post('/medicine', verifyToken, auditLog('MEDICINE_CREATE'), async (req, res) => {
    try {
        const {
            farm_id, medicine_name, medicine_type, brand, batch_number, quantity, unit,
            unit_price, purchase_date, expiry_date, supplier, minimum_stock, 
            storage_requirements, prescription_required, notes
        } = req.body;

        if (!farm_id || !medicine_name || !medicine_type || !quantity) {
            return res.status(400).json({ 
                error: 'Farm ID, medicine name, type, and quantity are required' 
            });
        }

        const validTypes = ['antibiotic', 'vaccine', 'vitamin', 'dewormer', 'antiseptic', 'other'];
        if (!validTypes.includes(medicine_type)) {
            return res.status(400).json({ 
                error: 'Invalid medicine type. Must be one of: ' + validTypes.join(', ') 
            });
        }

        const db = req.app.locals.db;

        const [result] = await db.execute(`
            INSERT INTO medicine_inventory 
            (farm_id, medicine_name, medicine_type, brand, batch_number, quantity, unit,
             unit_price, purchase_date, expiry_date, supplier, minimum_stock, 
             storage_requirements, prescription_required, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [farm_id, medicine_name, medicine_type, brand, batch_number, quantity, unit || 'pieces',
            unit_price, purchase_date, expiry_date, supplier, minimum_stock || 10, 
            storage_requirements, prescription_required || false, notes]);

        res.status(201).json({
            message: 'Medicine inventory created successfully',
            item: {
                id: result.insertId,
                farm_id, medicine_name, medicine_type, brand, quantity, unit,
                purchase_date, expiry_date, supplier, minimum_stock, notes
            }
        });

    } catch (error) {
        console.error('Create medicine inventory error:', error);
        res.status(500).json({ error: 'Failed to create medicine inventory' });
    }
});

// Add equipment inventory
router.post('/equipment', verifyToken, auditLog('EQUIPMENT_CREATE'), async (req, res) => {
    try {
        const {
            farm_id, equipment_name, equipment_type, brand, model, serial_number,
            purchase_date, warranty_expiry, condition_status, location, purchase_price, supplier, notes
        } = req.body;

        if (!farm_id || !equipment_name || !equipment_type) {
            return res.status(400).json({ 
                error: 'Farm ID, equipment name, and type are required' 
            });
        }

        const validTypes = ['feeding', 'cleaning', 'medical', 'maintenance', 'monitoring', 'other'];
        if (!validTypes.includes(equipment_type)) {
            return res.status(400).json({ 
                error: 'Invalid equipment type. Must be one of: ' + validTypes.join(', ') 
            });
        }

        const db = req.app.locals.db;

        const [result] = await db.execute(`
            INSERT INTO equipment_inventory 
            (farm_id, equipment_name, equipment_type, brand, model, serial_number,
             purchase_date, warranty_expiry, condition_status, location, purchase_price, supplier, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [farm_id, equipment_name, equipment_type, brand, model, serial_number,
            purchase_date, warranty_expiry, condition_status || 'good', location, purchase_price, supplier, notes]);

        res.status(201).json({
            message: 'Equipment inventory created successfully',
            item: {
                id: result.insertId,
                farm_id, equipment_name, equipment_type, brand, model,
                purchase_date, condition_status, location, purchase_price, notes
            }
        });

    } catch (error) {
        console.error('Create equipment inventory error:', error);
        res.status(500).json({ error: 'Failed to create equipment inventory' });
    }
});

// Get inventory alerts
router.get('/alerts', verifyToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { farm_id, status } = req.query;

        let query = `
            SELECT a.*, farms.name as farm_name
            FROM inventory_alerts a
            JOIN farms ON a.farm_id = farms.id
            WHERE 1=1
        `;
        let params = [];

        if (farm_id) {
            query += ' AND a.farm_id = ?';
            params.push(farm_id);
        }

        if (status) {
            query += ' AND a.status = ?';
            params.push(status);
        }

        query += ' ORDER BY a.severity DESC, a.created_at DESC';

        const [alerts] = await db.execute(query, params);

        res.json({
            alerts,
            total: alerts.length
        });

    } catch (error) {
        console.error('Get inventory alerts error:', error);
        res.status(500).json({ error: 'Failed to fetch inventory alerts' });
    }
});

// Create inventory transaction
router.post('/transactions', verifyToken, auditLog('INVENTORY_TRANSACTION'), async (req, res) => {
    const connection = await req.app.locals.db.getConnection();
    
    try {
        const {
            farm_id, item_type, item_id, transaction_type, quantity, unit, reference_number, notes
        } = req.body;

        if (!farm_id || !item_type || !item_id || !transaction_type || !quantity) {
            return res.status(400).json({ 
                error: 'Farm ID, item type, item ID, transaction type, and quantity are required' 
            });
        }

        const validItemTypes = ['feed', 'medicine', 'equipment'];
        const validTransactionTypes = ['purchase', 'usage', 'waste', 'transfer', 'adjustment'];
        
        if (!validItemTypes.includes(item_type)) {
            return res.status(400).json({ 
                error: 'Invalid item type. Must be one of: ' + validItemTypes.join(', ') 
            });
        }

        if (!validTransactionTypes.includes(transaction_type)) {
            return res.status(400).json({ 
                error: 'Invalid transaction type. Must be one of: ' + validTransactionTypes.join(', ') 
            });
        }

        const performedBy = req.user.id;

        // Start transaction
        await connection.beginTransaction();

        // Record transaction
        const [result] = await connection.execute(`
            INSERT INTO inventory_transactions 
            (farm_id, item_type, item_id, transaction_type, quantity, unit, performed_by, reference_number, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [farm_id, item_type, item_id, transaction_type, quantity, unit, performedBy, reference_number, notes]);

        // Update inventory quantity based on transaction type
        let updateQuery = '';
        let updateParams = [];
        
        if (item_type === 'feed') {
            if (transaction_type === 'purchase' || transaction_type === 'adjustment') {
                updateQuery = 'UPDATE feed_inventory SET quantity_kg = quantity_kg + ? WHERE id = ? AND quantity_kg >= 0';
            } else if (transaction_type === 'usage' || transaction_type === 'waste') {
                updateQuery = 'UPDATE feed_inventory SET quantity_kg = quantity_kg - ? WHERE id = ? AND quantity_kg >= ?';
                updateParams = [Math.abs(quantity), item_id, Math.abs(quantity)];
            }
            if (transaction_type === 'purchase' || transaction_type === 'adjustment') {
                updateParams = [Math.abs(quantity), item_id];
            }
        } else if (item_type === 'medicine') {
            if (transaction_type === 'purchase' || transaction_type === 'adjustment') {
                updateQuery = 'UPDATE medicine_inventory SET quantity = quantity + ? WHERE id = ? AND quantity >= 0';
            } else if (transaction_type === 'usage' || transaction_type === 'waste') {
                updateQuery = 'UPDATE medicine_inventory SET quantity = quantity - ? WHERE id = ? AND quantity >= ?';
                updateParams = [Math.abs(quantity), item_id, Math.abs(quantity)];
            }
            if (transaction_type === 'purchase' || transaction_type === 'adjustment') {
                updateParams = [Math.abs(quantity), item_id];
            }
        }

        if (updateQuery) {
            const [updateResult] = await connection.execute(updateQuery, updateParams);
            
            // Check if update affected any rows (validates sufficient quantity)
            if (updateResult.affectedRows === 0) {
                throw new Error('Insufficient inventory quantity or invalid item ID');
            }
        }

        // Commit transaction
        await connection.commit();

        res.status(201).json({
            message: 'Inventory transaction recorded successfully',
            transaction_id: result.insertId
        });

    } catch (error) {
        // Rollback transaction on error
        await connection.rollback();
        console.error('Create inventory transaction error:', error);
        
        if (error.message.includes('Insufficient inventory')) {
            res.status(400).json({ error: 'Insufficient inventory quantity available' });
        } else {
            res.status(500).json({ error: 'Failed to record inventory transaction' });
        }
    } finally {
        connection.release();
    }
});

// Generate low stock alerts
router.post('/check-alerts', verifyToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { farm_id } = req.body;

        // Check feed inventory for low stock
        const [lowFeedStock] = await db.execute(`
            SELECT id, feed_type, quantity_kg, minimum_stock, farm_id
            FROM feed_inventory 
            WHERE quantity_kg <= minimum_stock
            ${farm_id ? 'AND farm_id = ?' : ''}
        `, farm_id ? [farm_id] : []);

        // Check medicine inventory for low stock
        const [lowMedicineStock] = await db.execute(`
            SELECT id, medicine_name, quantity, minimum_stock, farm_id
            FROM medicine_inventory 
            WHERE quantity <= minimum_stock
            ${farm_id ? 'AND farm_id = ?' : ''}
        `, farm_id ? [farm_id] : []);

        // Check for expiring items (within 30 days)
        const [expiringFeed] = await db.execute(`
            SELECT id, feed_type, expiry_date, farm_id
            FROM feed_inventory 
            WHERE expiry_date <= DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY)
            AND expiry_date > CURRENT_DATE
            ${farm_id ? 'AND farm_id = ?' : ''}
        `, farm_id ? [farm_id] : []);

        const [expiringMedicine] = await db.execute(`
            SELECT id, medicine_name, expiry_date, farm_id
            FROM medicine_inventory 
            WHERE expiry_date <= DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY)
            AND expiry_date > CURRENT_DATE
            ${farm_id ? 'AND farm_id = ?' : ''}
        `, farm_id ? [farm_id] : []);

        let alertsCreated = 0;

        // Create alerts for low feed stock
        for (const item of lowFeedStock) {
            await db.execute(`
                INSERT IGNORE INTO inventory_alerts 
                (farm_id, alert_type, item_type, item_id, item_name, alert_message, severity)
                VALUES (?, 'low_stock', 'feed', ?, ?, ?, 'medium')
            `, [item.farm_id, item.id, item.feed_type, 
                `Low stock alert: ${item.feed_type} (${item.quantity_kg}kg remaining, minimum: ${item.minimum_stock}kg)`]);
            alertsCreated++;
        }

        // Create alerts for low medicine stock
        for (const item of lowMedicineStock) {
            await db.execute(`
                INSERT IGNORE INTO inventory_alerts 
                (farm_id, alert_type, item_type, item_id, item_name, alert_message, severity)
                VALUES (?, 'low_stock', 'medicine', ?, ?, ?, 'high')
            `, [item.farm_id, item.id, item.medicine_name, 
                `Low stock alert: ${item.medicine_name} (${item.quantity} remaining, minimum: ${item.minimum_stock})`]);
            alertsCreated++;
        }

        // Create alerts for expiring feed
        for (const item of expiringFeed) {
            await db.execute(`
                INSERT IGNORE INTO inventory_alerts 
                (farm_id, alert_type, item_type, item_id, item_name, alert_message, severity)
                VALUES (?, 'expiry_warning', 'feed', ?, ?, ?, 'medium')
            `, [item.farm_id, item.id, item.feed_type, 
                `Expiry warning: ${item.feed_type} expires on ${item.expiry_date}`]);
            alertsCreated++;
        }

        // Create alerts for expiring medicine
        for (const item of expiringMedicine) {
            await db.execute(`
                INSERT IGNORE INTO inventory_alerts 
                (farm_id, alert_type, item_type, item_id, item_name, alert_message, severity)
                VALUES (?, 'expiry_warning', 'medicine', ?, ?, ?, 'high')
            `, [item.farm_id, item.id, item.medicine_name, 
                `Expiry warning: ${item.medicine_name} expires on ${item.expiry_date}`]);
            alertsCreated++;
        }

        res.json({
            message: `Alert check completed. ${alertsCreated} new alerts created.`,
            alerts_created: alertsCreated,
            low_feed_stock: lowFeedStock.length,
            low_medicine_stock: lowMedicineStock.length,
            expiring_feed: expiringFeed.length,
            expiring_medicine: expiringMedicine.length
        });

    } catch (error) {
        console.error('Check alerts error:', error);
        res.status(500).json({ error: 'Failed to check inventory alerts' });
    }
});

module.exports = router;
