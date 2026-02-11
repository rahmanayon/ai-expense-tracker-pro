// backend/middleware/cache.js
const redis = require('redis');
const client = redis.createClient();

client.on('error', (err) => console.error('Redis Error:', err));

const cacheMiddleware = (duration) => async (req, res, next) => {
    const key = `__expres__${req.originalUrl}`;

    try {
        const cached = await client.get(key);
        if (cached) {
            return res.json(JSON.parse(cached));
        }

        // Override res.json to cache response
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            client.setEx(key, duration, JSON.stringify(body));
            return originalJson(body);
        };

        next();
    } catch (error) {
        next();
    }
};

module.exports = cacheMiddleware;

// Apply in routes
app.get('/api/dashboard/summary', 
    authenticate, 
    cacheMiddleware(300), // 5 minutes cache
    dashboardController.getSummary
);