// backend/tests/performance/load.test.js
const autocannon = require('autocannon');

describe('Performance Tests', () => {
  const API_URL = 'http://localhost:3001';
  const AUTH_TOKEN = 'your-test-token';

  it('should handle high load on dashboard endpoint', async () => {
    const result = await autocannon({
      url: `${API_URL}/api/dashboard`,
      connections: 100,
      duration: 30,
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    expect(result.errors).toBe(0);
    expect(result.timeouts).toBe(0);
    expect(result.requests.average).toBeGreaterThan(100);
    expect(result.latency.average).toBeLessThan(100);
  });

  it('should handle high load on transaction creation', async () => {
    const result = await autocannon({
      url: `${API_URL}/api/transactions`,
      connections: 50,
      duration: 30,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify({
        categoryId: 1,
        type: 'expense',
        amount: 50.00,
        transactionDate: '2026-01-12'
      })
    });
    expect(result.errors).toBeLessThan(5);
    expect(result.timeouts).toBe(0);
    expect(result.requests.average).toBeGreaterThan(50);
  });

  it('should maintain performance under memory pressure', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    const largeTransactions = Array.from({ length: 1000 }, (_, i) => ({
      categoryId: 1,
      type: 'expense',
      amount: Math.random() * 1000,
      description: 'x'.repeat(500),
      transactionDate: '2026-01-12',
      tags: Array.from({ length: 10 }, () => 'tag-' + Math.random()),
      metadata: {
        largeData: 'x'.repeat(10000)
      }
    }));
    const promises = largeTransactions.map(transaction =>
      fetch(`${API_URL}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        body: JSON.stringify(transaction)
      })
    );
    await Promise.all(promises);
    if (global.gc) global.gc();
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024;
    expect(memoryIncrease).toBeLessThan(100);
  });
});