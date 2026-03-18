// backend/tests/integration/api.test.js
const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../src/models');
const bcrypt = require('bcrypt');

describe('API Integration Tests', () => {
  let authToken;
  let userId;
  let server;

  beforeAll(async () => {
    server = app.listen(0);
    await sequelize.sync({ force: true });
    // Seed default categories
    const { Category } = require('../../src/models');
    await Category.create({ id: 1, name: 'General' });
  });

  afterAll(async () => {
    await sequelize.close();
    server.close();
  });

  describe('Complete user flow', () => {
    it('should handle complete user registration and transaction flow', async () => {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'integration@test.com',
          password: 'TestPassword123!',
          firstName: 'Integration',
          lastName: 'Test'
        })
        .expect(201);

      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.data.user.email).toBe('integration@test.com');

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'integration@test.com',
          password: 'TestPassword123!'
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.token).toBeDefined();

      authToken = loginResponse.body.data.token;
      userId = loginResponse.body.data.user.id;

      const categoriesResponse = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(categoriesResponse.body.success).toBe(true);
      expect(categoriesResponse.body.data.length).toBeGreaterThan(0);

      const categoryId = categoriesResponse.body.data[0].id;

      const transactions = [
        {
          categoryId,
          type: 'expense',
          amount: 50.00,
          description: 'Grocery shopping',
          transactionDate: '2026-01-10'
        },
        {
          categoryId,
          type: 'expense',
          amount: 30.00,
          description: 'Lunch',
          transactionDate: '2026-01-11'
        },
        {
          categoryId,
          type: 'income',
          amount: 2000.00,
          description: 'Salary',
          transactionDate: '2026-01-12'
        }
      ];

      for (const transaction of transactions) {
        const response = await request(app)
          .post('/api/transactions')
          .set('Authorization', `Bearer ${authToken}`)
          .send(transaction);

        if (response.status !== 201) {
          console.error('Transaction creation failed:', JSON.stringify(response.body, null, 2));
        }
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      }

      const dashboardResponse = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(dashboardResponse.body.success).toBe(true);
      expect(dashboardResponse.body.data.summary).toBeDefined();
      expect(dashboardResponse.body.data.summary.totalExpenses).toBe(80.00);
      expect(dashboardResponse.body.data.summary.totalIncome).toBe(2000.00);

      const budgetResponse = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categoryId,
          amount: 500.00,
          period: 'monthly'
        })
        .expect(201);

      expect(budgetResponse.body.success).toBe(true);

      const budgetStatusResponse = await request(app)
        .get('/api/budgets/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(budgetStatusResponse.body.success).toBe(true);
      expect(budgetStatusResponse.body.data[0].spent).toBe(80.00);
      expect(budgetStatusResponse.body.data[0].budgeted).toBe(500.00);

      const aiInsightsResponse = await request(app)
        .get('/api/ai/insights')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(aiInsightsResponse.body.success).toBe(true);
      expect(aiInsightsResponse.body.data.insights).toBeDefined();
      expect(aiInsightsResponse.body.data.insights.length).toBeGreaterThan(0);
    });
  });

  describe('Concurrent operations', () => {
    beforeAll(async () => {
      if (!authToken) {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            email: `concurrent-${Date.now()}@test.com`,
            password: 'TestPassword123!',
            firstName: 'Concurrent',
            lastName: 'Test'
          });
        authToken = res.body.data.token;
        userId = res.body.data.user.id;
      }
    });

    it('should handle concurrent transaction creation', async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/transactions')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              categoryId: 1,
              type: 'expense',
              amount: 10.00 + i,
              transactionDate: '2026-01-12'
            })
        );
      }
      const responses = await Promise.all(promises);
      responses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.amount).toBe(10.00 + index);
      });
    });
  });

  describe('Error handling', () => {
    beforeAll(async () => {
      if (!authToken) {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            email: `error-${Date.now()}@test.com`,
            password: 'TestPassword123!',
            firstName: 'Error',
            lastName: 'Test'
          });
        if (res.status !== 201) {
          console.error('Error block registration failed:', res.body);
        }
        authToken = res.body?.data?.token;
        userId = res.body?.data?.user?.id;
      }
    });

    it('should handle database connection errors gracefully', async () => {
      const { Transaction } = require('../../src/models');
      const originalFind = Transaction.findAndCountAll;
      Transaction.findAndCountAll = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Internal Server Error');
      Transaction.findAndCountAll = originalFind;
    });

    it('should handle validation errors properly', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categoryId: 'invalid',
          type: 'invalid-type',
          amount: -100,
          transactionDate: 'invalid-date'
        })
        .expect(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });
});