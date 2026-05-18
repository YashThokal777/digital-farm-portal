const express = require('express');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get dashboard data based on user role
router.get('/', verifyToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const userId = req.user.id;
        const userRole = req.user.role;

        let dashboardData = {};

        if (userRole === 'system_admin') {
            // System admin dashboard - overview of entire system
            const [farmStats] = await db.execute(`
                SELECT COUNT(*) as total_farms,
                       SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_farms
                FROM farms
            `);

            const [userStats] = await db.execute(`
                SELECT role, COUNT(*) as count
                FROM users
                WHERE is_active = TRUE
                GROUP BY role
            `);

            const [animalStats] = await db.execute(`
                SELECT species, COUNT(*) as count
                FROM animals a
                JOIN farms f ON a.farm_id = f.id
                WHERE f.is_active = TRUE
                GROUP BY species
            `);

            dashboardData = {
                farms: farmStats[0],
                users: userStats,
                animals: animalStats,
                role: 'system_admin'
            };

        } else if (userRole === 'farm_owner') {
            // Farm owner dashboard - portfolio overview
            const [farms] = await db.execute(`
                SELECT f.*, COUNT(DISTINCT a.id) as animal_count,
                       COUNT(DISTINCT fs.id) as staff_count
                FROM farms f
                LEFT JOIN animals a ON f.id = a.farm_id
                LEFT JOIN farm_staff fs ON f.id = fs.farm_id AND fs.is_active = TRUE
                WHERE f.owner_id = ? AND f.is_active = TRUE
                GROUP BY f.id
            `, [userId]);

            const [totalStats] = await db.execute(`
                SELECT COUNT(DISTINCT f.id) as total_farms,
                       COUNT(DISTINCT a.id) as total_animals,
                       COUNT(DISTINCT fs.id) as total_staff
                FROM farms f
                LEFT JOIN animals a ON f.id = a.farm_id
                LEFT JOIN farm_staff fs ON f.id = fs.farm_id AND fs.is_active = TRUE
                WHERE f.owner_id = ? AND f.is_active = TRUE
            `, [userId]);

            dashboardData = {
                farms,
                stats: totalStats[0],
                role: 'farm_owner'
            };

        } else if (userRole === 'farm_manager') {
            // Farm manager dashboard - operational overview
            const [assignedFarms] = await db.execute(`
                SELECT DISTINCT f.*, COUNT(DISTINCT a.id) as animal_count
                FROM farms f
                JOIN farm_staff fs ON f.id = fs.farm_id
                LEFT JOIN animals a ON f.id = a.farm_id
                WHERE fs.user_id = ? AND fs.is_active = TRUE AND f.is_active = TRUE
                GROUP BY f.id
            `, [userId]);

            const [pendingTasks] = await db.execute(`
                SELECT COUNT(*) as count
                FROM biosecurity_tasks bt
                JOIN farm_staff fs ON bt.farm_id = fs.farm_id
                WHERE fs.user_id = ? AND fs.is_active = TRUE AND bt.status = 'pending'
            `, [userId]);

            const [recentHealth] = await db.execute(`
                SELECT hr.*, a.tag_number, f.name as farm_name
                FROM health_records hr
                JOIN animals a ON hr.animal_id = a.id
                JOIN farms f ON a.farm_id = f.id
                JOIN farm_staff fs ON f.id = fs.farm_id
                WHERE fs.user_id = ? AND fs.is_active = TRUE
                ORDER BY hr.record_date DESC
                LIMIT 5
            `, [userId]);

            dashboardData = {
                farms: assignedFarms,
                pending_tasks: pendingTasks[0].count,
                recent_health: recentHealth,
                role: 'farm_manager'
            };

        } else if (userRole === 'farm_worker') {
            // Farm worker dashboard - task-focused
            const [myTasks] = await db.execute(`
                SELECT bt.*, f.name as farm_name
                FROM biosecurity_tasks bt
                JOIN farms f ON bt.farm_id = f.id
                WHERE bt.assigned_to = ? AND bt.status IN ('pending', 'in_progress')
                ORDER BY bt.scheduled_date ASC
            `, [userId]);

            const [completedToday] = await db.execute(`
                SELECT COUNT(*) as count
                FROM biosecurity_tasks
                WHERE completed_by = ? AND DATE(completed_date) = CURDATE()
            `, [userId]);

            const [assignedFarms] = await db.execute(`
                SELECT DISTINCT f.*
                FROM farms f
                JOIN farm_staff fs ON f.id = fs.farm_id
                WHERE fs.user_id = ? AND fs.is_active = TRUE AND f.is_active = TRUE
            `, [userId]);

            dashboardData = {
                my_tasks: myTasks,
                completed_today: completedToday[0].count,
                farms: assignedFarms,
                role: 'farm_worker'
            };
        }

        res.json(dashboardData);

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Get alerts and notifications
router.get('/alerts', verifyToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const userId = req.user.id;
        const userRole = req.user.role;

        let alerts = [];

        // Low stock alerts
        const [lowStock] = await db.execute(`
            SELECT i.*, f.name as farm_name
            FROM inventory i
            JOIN farms f ON i.farm_id = f.id
            WHERE i.quantity <= i.minimum_stock
            ${userRole !== 'system_admin' ? 'AND (f.owner_id = ? OR EXISTS (SELECT 1 FROM farm_staff fs WHERE fs.farm_id = f.id AND fs.user_id = ? AND fs.is_active = TRUE))' : ''}
            ORDER BY i.updated_at DESC
        `, userRole !== 'system_admin' ? [userId, userId] : []);

        alerts = alerts.concat(lowStock.map(item => ({
            type: 'low_stock',
            message: `Low stock alert: ${item.item_name} at ${item.farm_name}`,
            severity: 'warning',
            data: item
        })));

        // Overdue tasks
        const [overdueTasks] = await db.execute(`
            SELECT bt.*, f.name as farm_name
            FROM biosecurity_tasks bt
            JOIN farms f ON bt.farm_id = f.id
            WHERE bt.status = 'pending' AND bt.scheduled_date < CURDATE()
            ${userRole !== 'system_admin' ? 'AND (f.owner_id = ? OR EXISTS (SELECT 1 FROM farm_staff fs WHERE fs.farm_id = f.id AND fs.user_id = ? AND fs.is_active = TRUE))' : ''}
            ORDER BY bt.scheduled_date ASC
        `, userRole !== 'system_admin' ? [userId, userId] : []);

        alerts = alerts.concat(overdueTasks.map(task => ({
            type: 'overdue_task',
            message: `Overdue task: ${task.description} at ${task.farm_name}`,
            severity: 'error',
            data: task
        })));

        // Expiring inventory
        const [expiring] = await db.execute(`
            SELECT i.*, f.name as farm_name
            FROM inventory i
            JOIN farms f ON i.farm_id = f.id
            WHERE i.expiry_date IS NOT NULL AND i.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
            ${userRole !== 'system_admin' ? 'AND (f.owner_id = ? OR EXISTS (SELECT 1 FROM farm_staff fs WHERE fs.farm_id = f.id AND fs.user_id = ? AND fs.is_active = TRUE))' : ''}
            ORDER BY i.expiry_date ASC
        `, userRole !== 'system_admin' ? [userId, userId] : []);

        alerts = alerts.concat(expiring.map(item => ({
            type: 'expiring_item',
            message: `Item expiring soon: ${item.item_name} at ${item.farm_name} (${item.expiry_date})`,
            severity: 'warning',
            data: item
        })));

        res.json({
            alerts,
            total: alerts.length
        });

    } catch (error) {
        console.error('Alerts error:', error);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

module.exports = router;
