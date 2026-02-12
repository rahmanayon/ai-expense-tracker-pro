const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { Transaction, Category, sequelize } = require('../models');
const { authenticate } = require('../middleware/auth');
const { logger } = require('../config/server');
const { Op } = require('sequelize');

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// Get transactions with pagination and filtering
router.get('/',
    authenticate,
    [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601(),
        query('categoryId').optional().isInt(),
        query('type').optional().isIn(['income', 'expense']),
        query('minAmount').optional().isFloat({ min: 0 }),
        query('maxAmount').optional().isFloat({ min: 0 })
    ],
    validate,
    async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;

            const whereClause = { userId: req.user.id };

            // Apply filters
            if (req.query.startDate && req.query.endDate) {
                whereClause.transactionDate = {
                    [Op.between]: [req.query.startDate, req.query.endDate]
                };
            }

            if (req.query.categoryId) {
                whereClause.categoryId = req.query.categoryId;
            }

            if (req.query.type) {
                whereClause.type = req.query.type;
            }

            if (req.query.minAmount || req.query.maxAmount) {
                whereClause.amount = {};
                if (req.query.minAmount) {
                    whereClause.amount[Op.gte] = req.query.minAmount;
                }
                if (req.query.maxAmount) {
                    whereClause.amount[Op.lte] = req.query.maxAmount;
                }
            }

            const { count, rows: transactions } = await Transaction.findAndCountAll({
                where: whereClause,
                include: [{ model: Category, attributes: ['id', 'name', 'emoji'] }],
                order: [['transactionDate', 'DESC'], ['createdAt', 'DESC']],
                limit,
                offset
            });

            // Calculate summary statistics
            const summaryArr = await Transaction.findAll({
                where: whereClause,
                attributes: [
                    'type',
                    [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
                    [sequelize.fn('AVG', sequelize.col('amount')), 'average'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                group: ['type'],
                raw: true
            });

            res.json({
                success: true,
                data: {
                    transactions,
                    pagination: {
                        page,
                        limit,
                        total: count,
                        pages: Math.ceil(count / limit)
                    },
                    summary: summaryArr.reduce((acc, stat) => {
                        acc[stat.type] = {
                            total: parseFloat(stat.total),
                            average: parseFloat(stat.average),
                            count: parseInt(stat.count)
                        };
                        return acc;
                    }, {})
                }
            });

            // Log successful request
            if (logger) {
                logger.info('Transactions retrieved', {
                    userId: req.user.id,
                    page,
                    limit,
                    filters: req.query
                });
            }

        } catch (error) {
            if (logger) {
                logger.error('Error retrieving transactions', {
                    userId: req.user.id,
                    error: error.message,
                    stack: error.stack
                });
            }
            next(error);
        }
    }
);

// Create new transaction
router.post('/',
    authenticate,
    [
        body('categoryId').isInt({ min: 1 }),
        body('type').isIn(['income', 'expense']),
        body('amount').isFloat({ min: 0.01, max: 999999.99 }),
        body('description').optional().isLength({ max: 500 }),
        body('transactionDate').isISO8601(),
        body('receiptImageUrl').optional().isURL(),
        body('tags').optional().isArray(),
        body('isRecurring').optional().isBoolean(),
        body('recurringPattern').optional().isIn(['daily', 'weekly', 'monthly', 'yearly']),
        body('recurringEndDate').optional().isISO8601()
    ],
    validate,
    async (req, res, next) => {
        try {
            const {
                categoryId,
                type,
                amount,
                description,
                transactionDate,
                receiptImageUrl,
                tags,
                isRecurring,
                recurringPattern,
                recurringEndDate,
                splitTransactions
            } = req.body;

            // Verify category belongs to user (or is default)
            const category = await Category.findOne({
                where: { id: categoryId } // Simplified for now
            });

            if (!category) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid category'
                });
            }

            // Create transaction
            const transaction = await Transaction.create({
                userId: req.user.id,
                categoryId,
                type,
                amount,
                description,
                transactionDate,
                receiptImageUrl,
                tags,
                isRecurring,
                recurringPattern,
                recurringEndDate,
                splitTransactions
            });

            // Emit real-time update
            if (req.io) {
                req.io.to(`user_${req.user.id}`).emit('transaction:created', transaction);
            }

            res.status(201).json({
                success: true,
                data: transaction
            });

        } catch (error) {
            if (logger) {
                logger.error('Error creating transaction', {
                    userId: req.user.id,
                    error: error.message,
                    stack: error.stack
                });
            }
            next(error);
        }
    }
);

module.exports = router;
