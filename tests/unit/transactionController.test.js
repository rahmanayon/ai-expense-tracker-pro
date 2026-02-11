// tests/unit/transactionController.test.js
const request = require('supertest');
const app = require('../src/app');
const { Transaction, Category, User } = require('../src/models');
const bcrypt = require('bcrypt');

describe('Transaction Controller', () => {
    let token;
    let userId;
    let categoryId;

    beforeAll(async () => {
        # Create test user
        const hashedPassword = await bcrypt.hash('test123', 10);
        const user = await User.create({
            email: 'test@example.com',
            password_hash: hashedPassword,
            full_name: 'Test User'
        });
        userId = user.id;

        # Create test category
        const category = await Category.create({
            name: 'Test Groceries',
            emoji: '🛒',
            type: 'expense',
            user_id: userId
        });
        categoryId = category.id;

        // Login to get token
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'test123' });
        
        token = res.body.token;
    });

    afterAll(async () => {
        await Transaction.destroy({ where: { user_id: userId } });
        await Category.destroy({ where: { id: categoryId } });
        await User.destroy({ where: { id: userId } });
    });

    describe('POST /api/transactions', () => {
        it('should create a new transaction', async () => {
            const res = await request(app)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    categoryId: categoryId,
                    type: 'expense',
                    amount: 99.99,
                    description: 'Test grocery purchase',
                    transactionDate: '2026-01-12'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.data.amount).toBe(99.99);
            expect(res.body.data.description).toBe('Test grocery purchase');
        });

        it('should reject invalid category', async () => {
            const res = await request(app)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    categoryId: 99999, // Non-existent
                    type: 'expense',
                    amount: 50.00
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toContain('Invalid category');
        });
    });

    describe('GET /api/transactions', () => {
        it('should fetch transactions with filters', async () => {
            const res = await request(app)
                .get('/api/transactions?startDate=2026-01-01&endDate=2026-01-31')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });
    });
});