// backend/src/controllers/health.js
const db = require('../models');
const redis = require('../config/redis');

exports.checkHealth = async (req, res) => {
    const status = {
        uptime: process.uptime(),
        timestamp: Date.now(),
        services: {
            database: 'unknown',
            redis: 'unknown'
        }
    };

    try {
        await db.sequelize.authenticate();
        status.services.database = 'up';
    } catch (e) {
        status.services.database = 'down';
    }

    try {
        await redis.ping();
        status.services.redis = 'up';
    } catch (e) {
        status.services.redis = 'down';
    }

    const statusCode = Object.values(status.services).every(s => s === 'up') ? 200 : 503;
    res.status(statusCode).json(status);
};