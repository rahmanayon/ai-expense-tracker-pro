// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid token.' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

// Password encryption
const bcrypt = require('bcrypt');
exports.hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
};