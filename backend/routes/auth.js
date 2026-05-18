const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken, auditLog } = require('../middleware/auth');

const router = express.Router();

// User registration
router.post('/register', auditLog('USER_REGISTER'), async (req, res) => {
    try {
        const { username, email, password, role, first_name, last_name, phone } = req.body;

        // Validation
        if (!username || !password || !role) {
            return res.status(400).json({ 
                error: 'Username, password, and role are required' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'Password must be at least 6 characters long' 
            });
        }

        const validRoles = ['system_admin', 'farm_owner', 'farm_manager', 'farm_worker'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ 
                error: 'Invalid role. Must be one of: ' + validRoles.join(', ') 
            });
        }

        const db = req.app.locals.db;

        // Check if username already exists
        const [existingUsers] = await db.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                error: 'Username or email already exists' 
            });
        }

        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const [result] = await db.execute(
            `INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [username, email, password_hash, role, first_name, last_name, phone]
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: result.insertId,
                username,
                email,
                role,
                first_name,
                last_name
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// User login
router.post('/login', auditLog('USER_LOGIN'), async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                error: 'Username and password are required' 
            });
        }

        const db = req.app.locals.db;

        // Get user from database
        const [users] = await db.execute(
            `SELECT id, username, email, password_hash, role, first_name, last_name, 
                    is_active, failed_login_attempts 
             FROM users WHERE username = ?`,
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Check if account is locked (more than 5 failed attempts)
        if (user.failed_login_attempts >= 5) {
            return res.status(423).json({ 
                error: 'Account locked due to too many failed login attempts. Contact administrator.' 
            });
        }

        if (!user.is_active) {
            return res.status(401).json({ error: 'Account is inactive' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            // Increment failed login attempts
            await db.execute(
                'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?',
                [user.id]
            );

            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Reset failed login attempts and update last login
        await db.execute(
            'UPDATE users SET failed_login_attempts = 0, last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        // Create session record
        const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
        await db.execute(
            `INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                user.id,
                token,
                req.ip || req.connection.remoteAddress,
                req.get('User-Agent'),
                expiresAt
            ]
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Token verification
router.get('/verify', verifyToken, (req, res) => {
    res.json({
        valid: true,
        user: {
            id: req.user.id,
            username: req.user.username,
            role: req.user.role,
            first_name: req.user.first_name,
            last_name: req.user.last_name
        }
    });
});

// User logout
router.post('/logout', verifyToken, auditLog('USER_LOGOUT'), async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        const db = req.app.locals.db;

        // Deactivate session
        await db.execute(
            'UPDATE user_sessions SET is_active = FALSE WHERE session_token = ?',
            [token]
        );

        res.json({ message: 'Logout successful' });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        
        const [users] = await db.execute(
            `SELECT id, username, email, role, first_name, last_name, phone, 
                    last_login, created_at 
             FROM users WHERE id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: users[0] });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update user profile
router.put('/profile', verifyToken, auditLog('USER_PROFILE_UPDATE'), async (req, res) => {
    try {
        const { email, first_name, last_name, phone } = req.body;
        const db = req.app.locals.db;

        await db.execute(
            `UPDATE users SET email = ?, first_name = ?, last_name = ?, phone = ?, 
                            updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [email, first_name, last_name, phone, req.user.id]
        );

        res.json({ message: 'Profile updated successfully' });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Change password
router.put('/change-password', verifyToken, auditLog('PASSWORD_CHANGE'), async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({ 
                error: 'Current password and new password are required' 
            });
        }

        if (new_password.length < 6) {
            return res.status(400).json({ 
                error: 'New password must be at least 6 characters long' 
            });
        }

        const db = req.app.locals.db;

        // Get current password hash
        const [users] = await db.execute(
            'SELECT password_hash FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(current_password, users[0].password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const saltRounds = 10;
        const new_password_hash = await bcrypt.hash(new_password, saltRounds);

        // Update password
        await db.execute(
            'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [new_password_hash, req.user.id]
        );

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

module.exports = router;
