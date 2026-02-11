// backend/src/__tests__/integration/transaction-flow.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createTestServer } from '../utils/test-server';
import { createTestUser, createTestCategory } from '../utils/factories';
import { db } from '../utils/test-database';
import type { FastifyInstance } from 'fastify';

describe('Transaction Flow Integration Tests', () => {
  let app: FastifyInstance;
  let authToken: string;
  let userId: string;
  let categoryId: number;

  beforeAll(async () => {
    app = await createTestServer();
    await db.migrate.latest();
  });

  afterAll(async () => {
    await app.close();
    await db.destroy();
  });

  beforeEach(async () => {
    await db.seed.run();
    
    const user = await createTestUser();
    userId = user.id;
    authToken = await app.jwt.sign({ userId: user.id });
    
    const category = await createTestCategory({ tenantId: user.tenantId });
    categoryId = category.id;
  });

  describe('POST /api/transactions', () => {
    it('should create a transaction with valid data', async () => {
      const transactionData = {
        categoryId,
        type: 'expense' as const,
        amount: '99.99',
        description: 'Grocery shopping',
        transactionDate: '2026-01-15'
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/transactions',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: transactionData
      });

      expect(response.statusCode).toBe(201);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.amount).toBe('99.99');
      expect(body.data.type).toBe('expense');
      
      // Verify database state
      const dbTransaction = await db('transactions')
        .where({ id: body.data.id })
        .first();
      
      expect(dbTransaction).toBeDefined();
      expect(dbTransaction.user_id).toBe(userId);
    });

    it('should trigger budget alert when threshold exceeded', async () => {
      // Create budget with low threshold
      await db('budgets').insert({
        user_id: userId,
        category_id: categoryId,
        amount: 100,
        alert_threshold: 80,
        period_type: 'monthly'
      });

      // Create transaction that exceeds threshold
      const response = await app.inject({
        method: 'POST',
        url: '/api/transactions',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: {
          categoryId,
          type: 'expense',
          amount: '90.00',
          transactionDate: '2026-01-15'
        }
      });

      expect(response.statusCode).toBe(201);

      // Verify alert was created
      const alert = await db('notifications')
        .where({ user_id: userId, type: 'budget_alert' })
        .first();
      
      expect(alert).toBeDefined();
      expect(alert.data.percentage).toBeGreaterThan(80);
    });

    it('should handle concurrent transaction creation', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => 
        app.inject({
          method: 'POST',
          url: '/api/transactions',
          headers: { Authorization: `Bearer ${authToken}` },
          payload: {
            categoryId,
            type: 'expense',
            amount: (10 + i).toString(),
            transactionDate: '2026-01-15'
          }
        })
      );

      const responses = await Promise.all(requests);
      
      // All should succeed
      responses.forEach(response => {
        expect(response.statusCode).toBe(201);
      });

      // Verify all created in database
      const count = await db('transactions')
        .where({ user_id: userId })
        .count('id as count')
        .first();
      
      expect(count?.count).toBe('10');
    });
  });

  describe('GET /api/transactions', () => {
    it('should return paginated results with metadata', async () => {
      // Create 25 test transactions
      await db('transactions').insert(
        Array.from({ length: 25 }, (_, i) => ({
          user_id: userId,
          category_id: categoryId,
          type: 'expense',
          amount: 10 + i,
          transaction_date: '2026-01-15',
          created_at: new Date()
        }))
      );

      const response = await app.inject({
        method: 'GET',
        url: '/api/transactions?page=1&limit=10',
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.data.transactions).toHaveLength(10);
      expect(body.meta.total).toBe(25);
      expect(body.meta.totalPages).toBe(3);
      expect(body.meta.page).toBe(1);
    });

    it('should filter by date range correctly', async () => {
      // Create transactions on different dates
      await db('transactions').insert([
        { user_id: userId, category_id: categoryId, type: 'expense', amount: 10, transaction_date: '2026-01-01' },
        { user_id: userId, category_id: categoryId, type: 'expense', amount: 20, transaction_date: '2026-01-15' },
        { user_id: userId, category_id: categoryId, type: 'expense', amount: 30, transaction_date: '2026-01-31' }
      ]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/transactions?startDate=2026-01-10&endDate=2026-01-20',
        headers: { Authorization: `Bearer ${authToken}` }
      });

      const body = JSON.parse(response.body);
      expect(body.data.transactions).toHaveLength(1);
      expect(body.data.transactions[0].amount).toBe('20.00');
    });
  });
});