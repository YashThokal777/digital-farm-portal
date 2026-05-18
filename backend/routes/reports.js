const express = require('express');
const { verifyToken, auditLog } = require('../middleware/auth');

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', verifyToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { farm_id } = req.query;

        let farmFilter = '';
        let params = [];
        
        if (farm_id) {
            farmFilter = 'WHERE farm_id = ?';
            params = [farm_id];
        }

        // Get inventory summary
        const [feedSummary] = await db.execute(`
            SELECT 
                COUNT(*) as total_items,
                SUM(quantity_kg) as total_quantity,
                SUM(CASE WHEN quantity_kg <= minimum_stock THEN 1 ELSE 0 END) as low_stock_items,
                SUM(CASE WHEN expiry_date <= DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY) AND expiry_date > CURRENT_DATE THEN 1 ELSE 0 END) as expiring_items
            FROM feed_inventory ${farmFilter}
        `, params);

        const [medicineSummary] = await db.execute(`
            SELECT 
                COUNT(*) as total_items,
                SUM(quantity) as total_quantity,
                SUM(CASE WHEN quantity <= minimum_stock THEN 1 ELSE 0 END) as low_stock_items,
                SUM(CASE WHEN expiry_date <= DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY) AND expiry_date > CURRENT_DATE THEN 1 ELSE 0 END) as expiring_items
            FROM medicine_inventory ${farmFilter}
        `, params);

        const [equipmentSummary] = await db.execute(`
            SELECT 
                COUNT(*) as total_items,
                SUM(CASE WHEN condition_status = 'excellent' THEN 1 ELSE 0 END) as excellent_condition,
                SUM(CASE WHEN condition_status = 'good' THEN 1 ELSE 0 END) as good_condition,
                SUM(CASE WHEN condition_status IN ('fair', 'poor', 'needs_repair') THEN 1 ELSE 0 END) as needs_attention
            FROM equipment_inventory ${farmFilter}
        `, params);

        // Get animal health summary
        const [animalSummary] = await db.execute(`
            SELECT 
                COUNT(*) as total_animals,
                SUM(CASE WHEN health_status = 'healthy' THEN 1 ELSE 0 END) as healthy_animals,
                SUM(CASE WHEN health_status = 'sick' THEN 1 ELSE 0 END) as sick_animals,
                SUM(CASE WHEN health_status = 'under_treatment' THEN 1 ELSE 0 END) as under_treatment
            FROM animals ${farmFilter}
        `, params);

        // Get biosecurity summary
        const [biosecuritySummary] = await db.execute(`
            SELECT 
                COUNT(*) as total_tasks,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
                SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_tasks
            FROM biosecurity_tasks ${farmFilter}
        `, params);

        // Get recent alerts
        const [recentAlerts] = await db.execute(`
            SELECT * FROM inventory_alerts 
            ${farmFilter} 
            ORDER BY created_at DESC 
            LIMIT 10
        `, params);

        // Get monthly trends (last 6 months)
        const [monthlyTrends] = await db.execute(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as total_transactions,
                SUM(CASE WHEN transaction_type = 'purchase' THEN quantity ELSE 0 END) as purchases,
                SUM(CASE WHEN transaction_type = 'usage' THEN quantity ELSE 0 END) as usage
            FROM inventory_transactions 
            WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
            ${farm_id ? 'AND farm_id = ?' : ''}
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        `, farm_id ? [farm_id] : []);

        res.json({
            inventory: {
                feed: feedSummary[0],
                medicine: medicineSummary[0],
                equipment: equipmentSummary[0]
            },
            animals: animalSummary[0],
            biosecurity: biosecuritySummary[0],
            alerts: recentAlerts,
            trends: monthlyTrends
        });

    } catch (error) {
        console.error('Dashboard analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
    }
});

// Get inventory reports
router.get('/inventory', verifyToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { farm_id, period = 'monthly', type = 'all' } = req.query;

        let dateFilter = '';
        let farmFilter = '';
        let params = [];

        if (period === 'daily') {
            dateFilter = 'AND DATE(created_at) = CURRENT_DATE';
        } else if (period === 'weekly') {
            dateFilter = 'AND created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)';
        } else if (period === 'monthly') {
            dateFilter = 'AND created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)';
        }

        if (farm_id) {
            farmFilter = 'WHERE farm_id = ?';
            params.push(farm_id);
        }

        // Feed inventory report
        const [feedReport] = await db.execute(`
            SELECT 
                feed_type,
                SUM(quantity_kg) as total_quantity,
                AVG(unit_price) as avg_price,
                COUNT(*) as batch_count,
                SUM(quantity_kg * unit_price) as total_value
            FROM feed_inventory 
            ${farmFilter}
            GROUP BY feed_type
            ORDER BY total_value DESC
        `, params);

        // Medicine inventory report
        const [medicineReport] = await db.execute(`
            SELECT 
                medicine_type,
                COUNT(*) as item_count,
                SUM(quantity) as total_quantity,
                AVG(unit_price) as avg_price,
                SUM(quantity * unit_price) as total_value
            FROM medicine_inventory 
            ${farmFilter}
            GROUP BY medicine_type
            ORDER BY total_value DESC
        `, params);

        // Equipment report
        const [equipmentReport] = await db.execute(`
            SELECT 
                equipment_type,
                COUNT(*) as item_count,
                AVG(purchase_price) as avg_price,
                SUM(purchase_price) as total_value,
                condition_status
            FROM equipment_inventory 
            ${farmFilter}
            GROUP BY equipment_type, condition_status
            ORDER BY total_value DESC
        `, params);

        // Transaction summary
        const [transactionSummary] = await db.execute(`
            SELECT 
                item_type,
                transaction_type,
                COUNT(*) as transaction_count,
                SUM(quantity) as total_quantity,
                DATE(transaction_date) as date
            FROM inventory_transactions 
            WHERE 1=1 ${dateFilter}
            ${farm_id ? 'AND farm_id = ?' : ''}
            GROUP BY item_type, transaction_type, DATE(transaction_date)
            ORDER BY date DESC
        `, farm_id ? [farm_id] : []);

        res.json({
            period,
            feed: feedReport,
            medicine: medicineReport,
            equipment: equipmentReport,
            transactions: transactionSummary
        });

    } catch (error) {
        console.error('Inventory report error:', error);
        res.status(500).json({ error: 'Failed to generate inventory report' });
    }
});

// Get health analytics
router.get('/health', verifyToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { farm_id, period = 'monthly' } = req.query;

        let dateFilter = '';
        let farmFilter = '';
        let params = [];

        if (period === 'weekly') {
            dateFilter = 'AND DATE(recorded_date) >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)';
        } else if (period === 'monthly') {
            dateFilter = 'AND DATE(recorded_date) >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)';
        }

        if (farm_id) {
            farmFilter = 'AND h.farm_id = ?';
            params.push(farm_id);
        }

        // Health trends
        const [healthTrends] = await db.execute(`
            SELECT 
                DATE(h.recorded_date) as date,
                h.health_status,
                COUNT(*) as count,
                a.species
            FROM health_records h
            JOIN animals a ON h.animal_id = a.id
            WHERE 1=1 ${dateFilter} ${farmFilter}
            GROUP BY DATE(h.recorded_date), h.health_status, a.species
            ORDER BY date DESC
        `, params);

        // Treatment summary
        const [treatmentSummary] = await db.execute(`
            SELECT 
                h.treatment,
                COUNT(*) as usage_count,
                a.species,
                AVG(DATEDIFF(h.next_checkup, h.recorded_date)) as avg_recovery_days
            FROM health_records h
            JOIN animals a ON h.animal_id = a.id
            WHERE h.treatment IS NOT NULL ${dateFilter} ${farmFilter}
            GROUP BY h.treatment, a.species
            ORDER BY usage_count DESC
        `, params);

        // Vaccination schedule
        const [vaccinationSchedule] = await db.execute(`
            SELECT 
                h.treatment as vaccine_name,
                COUNT(*) as animals_vaccinated,
                DATE(h.recorded_date) as vaccination_date,
                a.species
            FROM health_records h
            JOIN animals a ON h.animal_id = a.id
            WHERE h.treatment LIKE '%vaccine%' OR h.treatment LIKE '%vaccination%'
            ${dateFilter} ${farmFilter}
            GROUP BY h.treatment, DATE(h.recorded_date), a.species
            ORDER BY vaccination_date DESC
        `, params);

        res.json({
            period,
            health_trends: healthTrends,
            treatments: treatmentSummary,
            vaccinations: vaccinationSchedule
        });

    } catch (error) {
        console.error('Health analytics error:', error);
        res.status(500).json({ error: 'Failed to generate health analytics' });
    }
});

// Get biosecurity compliance report
router.get('/biosecurity', verifyToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { farm_id, period = 'monthly' } = req.query;

        let dateFilter = '';
        let farmFilter = '';
        let params = [];

        if (period === 'daily') {
            dateFilter = 'AND DATE(created_at) = CURRENT_DATE';
        } else if (period === 'weekly') {
            dateFilter = 'AND created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)';
        } else if (period === 'monthly') {
            dateFilter = 'AND created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)';
        }

        if (farm_id) {
            farmFilter = 'AND farm_id = ?';
            params.push(farm_id);
        }

        // Task completion rates
        const [taskCompletion] = await db.execute(`
            SELECT 
                task_type,
                COUNT(*) as total_tasks,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                ROUND((SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as completion_rate
            FROM biosecurity_tasks 
            WHERE 1=1 ${dateFilter} ${farmFilter}
            GROUP BY task_type
            ORDER BY completion_rate DESC
        `, params);

        // Visitor tracking
        const [visitorStats] = await db.execute(`
            SELECT 
                DATE(entry_time) as date,
                COUNT(*) as total_visitors,
                AVG(TIMESTAMPDIFF(MINUTE, entry_time, exit_time)) as avg_visit_duration,
                SUM(CASE WHEN health_declaration = 1 THEN 1 ELSE 0 END) as health_declarations
            FROM visitors 
            WHERE 1=1 ${dateFilter} ${farmFilter}
            GROUP BY DATE(entry_time)
            ORDER BY date DESC
        `, params);

        // Environmental monitoring
        const [environmentalData] = await db.execute(`
            SELECT 
                DATE(recorded_at) as date,
                AVG(temperature) as avg_temperature,
                AVG(humidity) as avg_humidity,
                AVG(air_quality_index) as avg_air_quality,
                COUNT(*) as readings_count
            FROM environmental_data 
            WHERE 1=1 ${dateFilter} ${farmFilter}
            GROUP BY DATE(recorded_at)
            ORDER BY date DESC
        `, params);

        // Calculate compliance score
        const totalTasks = taskCompletion.reduce((sum, task) => sum + task.total_tasks, 0);
        const completedTasks = taskCompletion.reduce((sum, task) => sum + task.completed_tasks, 0);
        const complianceScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        res.json({
            period,
            compliance_score: complianceScore,
            task_completion: taskCompletion,
            visitor_stats: visitorStats,
            environmental_data: environmentalData
        });

    } catch (error) {
        console.error('Biosecurity report error:', error);
        res.status(500).json({ error: 'Failed to generate biosecurity report' });
    }
});

// Generate comprehensive farm report
router.get('/comprehensive', verifyToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { farm_id, period = 'monthly' } = req.query;

        if (!farm_id) {
            return res.status(400).json({ error: 'Farm ID is required for comprehensive report' });
        }

        // Get farm details
        const [farmDetails] = await db.execute(
            'SELECT * FROM farms WHERE id = ?',
            [farm_id]
        );

        if (farmDetails.length === 0) {
            return res.status(404).json({ error: 'Farm not found' });
        }

        // Get all analytics for the farm
        const [dashboardData, inventoryData, healthData, biosecurityData] = await Promise.all([
            axios.get(`/api/reports/dashboard?farm_id=${farm_id}`),
            axios.get(`/api/reports/inventory?farm_id=${farm_id}&period=${period}`),
            axios.get(`/api/reports/health?farm_id=${farm_id}&period=${period}`),
            axios.get(`/api/reports/biosecurity?farm_id=${farm_id}&period=${period}`)
        ].map(promise => promise.catch(error => ({ data: null, error: error.message }))));

        const report = {
            farm: farmDetails[0],
            period,
            generated_at: new Date().toISOString(),
            dashboard: dashboardData.data,
            inventory: inventoryData.data,
            health: healthData.data,
            biosecurity: biosecurityData.data
        };

        // Store report in database
        await db.execute(`
            INSERT INTO farm_reports 
            (farm_id, report_type, report_category, report_date, data, summary, generated_by)
            VALUES (?, ?, ?, CURRENT_DATE, ?, ?, ?)
        `, [
            farm_id,
            period,
            'comprehensive',
            JSON.stringify(report),
            `Comprehensive ${period} report for ${farmDetails[0].name}`,
            req.user.id
        ]);

        res.json(report);

    } catch (error) {
        console.error('Comprehensive report error:', error);
        res.status(500).json({ error: 'Failed to generate comprehensive report' });
    }
});

module.exports = router;
