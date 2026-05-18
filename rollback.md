# Database Transactions and Rollback - SQL Snippets

## Overview
This document contains SQL transaction and rollback examples used in the Digital Farm Portal for maintaining data consistency.

## 1. Inventory Transaction with Rollback

### Node.js Implementation
```javascript
// Create inventory transaction with rollback protection
router.post('/transactions', verifyToken, async (req, res) => {
    const connection = await req.app.locals.db.getConnection();
    
    try {
        // Start transaction
        await connection.beginTransaction();

        // Record transaction
        const [result] = await connection.execute(`
            INSERT INTO inventory_transactions 
            (farm_id, item_type, item_id, transaction_type, quantity, unit, performed_by, reference_number, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [farm_id, item_type, item_id, transaction_type, quantity, unit, performedBy, reference_number, notes]);

        // Update inventory with validation
        const [updateResult] = await connection.execute(`
            UPDATE medicine_inventory 
            SET quantity = quantity - ? 
            WHERE id = ? AND quantity >= ?
        `, [Math.abs(quantity), item_id, Math.abs(quantity)]);
        
        // Check if update affected any rows (validates sufficient quantity)
        if (updateResult.affectedRows === 0) {
            throw new Error('Insufficient inventory quantity');
        }

        // Commit transaction
        await connection.commit();
        res.json({ success: true, transaction_id: result.insertId });

    } catch (error) {
        // Rollback transaction on error
        await connection.rollback();
        res.status(400).json({ error: 'Transaction failed and rolled back' });
    } finally {
        connection.release();
    }
});
```

### Raw SQL Equivalent
```sql
-- Start transaction
START TRANSACTION;

-- Record the transaction
INSERT INTO inventory_transactions 
(farm_id, item_type, item_id, transaction_type, quantity, unit, performed_by, reference_number, notes)
VALUES (1, 'medicine', 5, 'usage', 10, 'pieces', 2, 'REF001', 'Daily medication');

-- Update inventory with validation
UPDATE medicine_inventory 
SET quantity = quantity - 10 
WHERE id = 5 AND quantity >= 10;

-- Check if update was successful
-- If affected rows = 0, rollback
-- If affected rows > 0, commit

-- On success:
COMMIT;

-- On failure:
ROLLBACK;
```

## 2. Farm Creation with Staff Assignment

### Node.js Implementation
```javascript
// Create farm with staff assignment (atomic operation)
router.post('/', verifyToken, async (req, res) => {
    const connection = await req.app.locals.db.getConnection();
    
    try {
        // Start transaction
        await connection.beginTransaction();

        // Create farm
        const [farmResult] = await connection.execute(`
            INSERT INTO farms (name, location, farm_type, owner_id, area_hectares, established_date, license_number)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [name, location, farm_type, ownerId, area_hectares, established_date, license_number]);

        // Assign manager to farm (if applicable)
        if (userRole === 'farm_manager') {
            await connection.execute(`
                INSERT INTO farm_staff (farm_id, user_id, role)
                VALUES (?, ?, 'manager')
            `, [farmResult.insertId, userId]);
        }

        // Commit transaction
        await connection.commit();
        res.json({ success: true, farm_id: farmResult.insertId });

    } catch (error) {
        // Rollback transaction on error
        await connection.rollback();
        res.status(500).json({ error: 'Farm creation failed and rolled back' });
    } finally {
        connection.release();
    }
});
```

### Raw SQL Equivalent
```sql
-- Start transaction
START TRANSACTION;

-- Create farm
INSERT INTO farms (name, location, farm_type, owner_id, area_hectares, established_date, license_number)
VALUES ('Green Valley Farm', 'Maharashtra', 'poultry', 1, 5.2, '2024-01-15', 'PF-2024-001');

-- Get the farm ID (in real SQL, you'd use LAST_INSERT_ID())
SET @farm_id = LAST_INSERT_ID();

-- Assign staff to farm
INSERT INTO farm_staff (farm_id, user_id, role)
VALUES (@farm_id, 2, 'manager');

-- On success:
COMMIT;

-- On failure:
ROLLBACK;
```

## 3. Health Record with Medication Usage

### Combined Operation Example
```javascript
// Add health record and update medicine inventory atomically
const connection = await db.getConnection();

try {
    await connection.beginTransaction();

    // Create health record
    const [healthResult] = await connection.execute(`
        INSERT INTO health_records 
        (animal_id, record_type, description, medication, dosage, recorded_by)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [animal_id, 'treatment', description, medication, dosage, user_id]);

    // Update medicine inventory if medication was used
    if (medication && dosage) {
        const [medicineUpdate] = await connection.execute(`
            UPDATE medicine_inventory 
            SET quantity = quantity - ? 
            WHERE medicine_name = ? AND quantity >= ?
        `, [dosage_quantity, medication, dosage_quantity]);

        if (medicineUpdate.affectedRows === 0) {
            throw new Error('Insufficient medication in inventory');
        }
    }

    await connection.commit();
} catch (error) {
    await connection.rollback();
    throw error;
} finally {
    connection.release();
}
```

## 4. Transaction Best Practices

### Connection Management
```javascript
// Always use try-catch-finally pattern
const connection = await db.getConnection();
try {
    await connection.beginTransaction();
    // ... database operations
    await connection.commit();
} catch (error) {
    await connection.rollback();
    throw error;
} finally {
    connection.release(); // Always release connection
}
```

### Error Handling
```javascript
// Specific error handling for different scenarios
try {
    // ... transaction logic
} catch (error) {
    await connection.rollback();
    
    if (error.message.includes('Insufficient')) {
        res.status(400).json({ error: 'Insufficient resources' });
    } else if (error.code === 'ER_DUP_ENTRY') {
        res.status(409).json({ error: 'Duplicate entry' });
    } else {
        res.status(500).json({ error: 'Transaction failed' });
    }
}
```

## 5. Testing Transaction Rollback

### Test Case Example
```javascript
// Test that rollback works correctly
describe('Inventory Transaction Rollback', () => {
    test('should rollback when insufficient inventory', async () => {
        // Setup: Create medicine with quantity 5
        await db.execute(`
            INSERT INTO medicine_inventory (medicine_name, quantity) 
            VALUES ('Test Medicine', 5)
        `);

        // Attempt to use 10 units (should fail)
        const response = await request(app)
            .post('/api/inventory/transactions')
            .send({
                item_type: 'medicine',
                item_id: 1,
                transaction_type: 'usage',
                quantity: 10
            })
            .expect(400);

        // Verify inventory unchanged
        const [inventory] = await db.execute(
            'SELECT quantity FROM medicine_inventory WHERE id = 1'
        );
        expect(inventory[0].quantity).toBe(5);

        // Verify no transaction record created
        const [transactions] = await db.execute(
            'SELECT COUNT(*) as count FROM inventory_transactions'
        );
        expect(transactions[0].count).toBe(0);
    });
});
```

## 6. Benefits of Transaction Usage

1. **Data Consistency**: Ensures all related operations succeed or fail together
2. **Inventory Protection**: Prevents negative inventory quantities
3. **Audit Trail Integrity**: Transaction logs match actual inventory changes
4. **Error Recovery**: Automatic rollback on any failure
5. **Concurrent Access**: Proper isolation between simultaneous operations

## 7. Common Rollback Scenarios

- **Insufficient Inventory**: When trying to use more than available
- **Foreign Key Violations**: When referenced records don't exist
- **Business Rule Violations**: When operations violate farm management rules
- **Network/Database Errors**: When connection issues occur mid-transaction
- **Validation Failures**: When data doesn't meet required constraints
