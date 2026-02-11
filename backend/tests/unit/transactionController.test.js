// backend/tests/unit/transactionController.test.js
const request = require('supertest');
const app = require('../../src/app');
const { Transaction, Category, User } = require('../../src/models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('Transaction Controller', () => {
  let authToken;
  let userId;
  let categoryId;

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    const user = await User.create({
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User'
    });
    userId = user.id;
    authToken = jwt.sign({ id: userId }, process.env.JWT_SECRET);

    // Create test category
    const category = await Category.create({
      name: 'Test Groceries',
      emoji: '🛒',
      type: 'expense',
      userId
    });
    categoryId = category.id;
  });

  afterAll(async () => {
    await Transaction.destroy({ where: { userId } });
    await Category.destroy({ where: { id: categoryId } });
    await User.destroy({ where: { id: userId } });
  });

  describe('POST /api/transactions', () => {
    it('should create a new transaction with valid data', async () => {
      const transactionData = {
        categoryId,
        type: 'expense',
        amount: 99.99,
        description: 'Test grocery purchase',
        transactionDate: '2026-01-12'
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(99.99);
      expect(response.body.data.description).toBe('Test grocery purchase');
      expect(response.body.data.userId).toBe(userId);
    });

    it('should reject transaction with invalid category', async () => {
      const transactionData = {
        categoryId: 99999,
        type: 'expense',
        amount: 50.00,
        transactionDate: '2026-01-12'
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid category');
    });

    it('should reject transaction with negative amount', async () => {
      const transactionData = {
        categoryId,
        type: 'expense',
        amount: -50.00,
        transactionDate: '2026-01-12'
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject transaction with future date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      const transactionData = {
        categoryId,
        type: 'expense',
        amount: 50.00,
        transactionDate: futureDate.toISOString().split('T')[0]
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/transactions', () => {
    beforeEach(async () => {
      // Create test transactions
      await Transaction.bulkCreate([
        {
          userId,
          categoryId,
          type: 'expense',
          amount: 100.00,
          transactionDate: '2026-01-10'
        },
        {
          userId,
          categoryId,
          type: 'expense',
          amount: 200.00,
          transactionDate: '2026-01-11'
        },
        {
          userId,
          categoryId,
          type: 'income',
          amount: 1000.00,
          transactionDate: '2026-01-12'
        }
      ]);
    });

    afterEach(async () => {
      await Transaction.destroy({ where: { userId } });
    });

    it('should retrieve transactions with pagination', async () => {
      const response = await request(app)
        .get('/api/transactions?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toHaveLength(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
      expect(response.body.data.pagination.total).toBe(3);
    });

    it('should filter transactions by date range', async () => {
      const response = await request(app)
        .get('/api/transactions?startDate=2026-01-11&endDate=2026-01-12')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toHaveLength(2);
    });

    it('should filter transactions by type', async () => {
      const response = await request(app)
        .get('/api/transactions?type=income')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions.every(t => t.type === 'income')).toBe(true);
    });

    it('should calculate summary statistics', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.summary.expense).toBeDefined();
      expect(response.body.data.summary.income).toBeDefined();
      expect(response.body.data.summary.expense.total).toBe(300.00);
      expect(response.body.data.summary.income.total).toBe(1000.00);
    });
  });

  describe('Authorization', () => {
    it('should reject request without token', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send({
          categoryId,
          type: 'expense',
          amount: 50.00,
          transactionDate: '2026-01-12'
        })
        .expect(401);

      expect(response.body.error).toBe('Access denied. No token provided.');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          categoryId,
          type: 'expense',
          amount: 50.00,
          transactionDate: '2026-01-12'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid token.');
    });
  });

  describe('Rate limiting', () => {
    it('should enforce rate limiting on auth endpoints', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrong-password'
      };

      for (let i = 0; i < 6; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData);

        if (i < 5) {
          expect(response.status).toBe(401);
        } else {
          expect(response.status).toBe(429);
          expect(response.body.error).toContain('Too many authentication attempts');
        }
      }
    });
  });
});