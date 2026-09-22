// backend/src/monitoring/metrics.js
const client = require('prom-client');

// Create a Registry
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics
const transactionCounter = new client.Counter({
    name: 'transaction_created_total',
    help: 'Total number of transactions created',
    labelNames: ['type', 'currency']
});
register.registerMetric(transactionCounter);

const responseTimeHistogram = new client.Histogram({
    name: 'http_response_time_seconds',
    help: 'Duration of HTTP responses in seconds',
    buckets: [0.1, 0.5, 1, 2, 5]
});
register.registerMetric(responseTimeHistogram);

module.exports = { register, transactionCounter, responseTimeHistogram };