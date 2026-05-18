const jwt = require('jsonwebtoken');

// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user details from database
        const db = req.app.locals.db;
        const [users] = await db.execute(
            'SELECT id, username, role, first_name, last_name, is_active FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0 || !users[0].is_active) {
            return res.status(401).json({ error: 'Invalid token or user inactive.' });
        }

        req.user = users[0];
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ error: 'Invalid token.' });
    }
};

// Role-based authorization middleware
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Access denied. Insufficient permissions.',
                required: allowedRoles,
                current: req.user.role
            });
        }

        next();
    };
};

// Farm access middleware - checks if user has access to specific farm
const requireFarmAccess = async (req, res, next) => {
    try {
        const farmId = req.params.farmId || req.body.farm_id || req.query.farm_id;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (!farmId) {
            return res.status(400).json({ error: 'Farm ID is required.' });
        }

        const db = req.app.locals.db;

        // System admin has access to all farms
        if (userRole === 'system_admin') {
            return next();
        }

        // Check if user is farm owner
        const [ownedFarms] = await db.execute(
            'SELECT id FROM farms WHERE id = ? AND owner_id = ?',
            [farmId, userId]
        );

        if (ownedFarms.length > 0) {
            return next();
        }

        // Check if user is assigned to this farm as manager or worker
        const [staffAssignments] = await db.execute(
            'SELECT id FROM farm_staff WHERE farm_id = ? AND user_id = ? AND is_active = TRUE',
            [farmId, userId]
        );

        if (staffAssignments.length > 0) {
            return next();
        }

        return res.status(403).json({ 
            error: 'Access denied. You do not have permission to access this farm.' 
        });

    } catch (error) {
        console.error('Farm access check error:', error);
        res.status(500).json({ error: 'Error checking farm access.' });
    }
};

// Audit logging middleware
const auditLog = (action) => {
    return async (req, res, next) => {
        try {
            const originalSend = res.send;
            
            res.send = function(data) {
                // Log the action after successful response
                if (res.statusCode < 400) {
                    logAuditEntry(req, action, data);
                }
                originalSend.call(this, data);
            };

            next();
        } catch (error) {
            console.error('Audit logging error:', error);
            next();
        }
    };
};

async function logAuditEntry(req, action, responseData) {
    try {
        const db = req.app.locals.db;
        const userId = req.user?.id || null;
        const ipAddress = req.ip || req.connection?.remoteAddress || null;
        const userAgent = req.get('User-Agent') || null;

        await db.execute(
            `INSERT INTO audit_log (user_id, action, table_name, record_id, new_values, ip_address, user_agent) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                action,
                req.route?.path || req.path,
                req.params?.id || null,
                JSON.stringify(req.body || {}),
                ipAddress,
                userAgent
            ]
        );
    } catch (error) {
        console.error('Failed to log audit entry:', error);
    }
}

module.exports = {
    verifyToken,
    requireRole,
    requireFarmAccess,
    auditLog
};
