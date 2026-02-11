// src/controllers/transactionController.js
const { Transaction, Category } = require('../models');
const { Op } = require('sequelize');
const { calculateAIInsights } = require('../services/aiService');

exports.createTransaction = async (req, res, next) => {
    try {
        const { categoryId, type, amount, description, transactionDate, receiptImageUrl } = req.body;
        const userId = req.user.id;

        // Validate category belongs to user
        const category = await Category.findOne({ where: { id: categoryId, user_id: userId } });
        if (!category) {
            return res.status(400).json({ error: 'Invalid category' });
        }

        const transaction = await Transaction.create({
            user_id: userId,
            category_id: categoryId,
            type,
            amount,
            description,
            transaction_date: transactionDate,
            receipt_image_url: receiptImageUrl
        });

        // Trigger AI insight recalculation
        calculateAIInsights(userId).catch(console.error);

        res.status(201).json({ success: true, data: transaction });
    } catch (error) {
        next(error);
    }
};

exports.getTransactions = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate, categoryId, type } = req.query;

        const whereClause = { user_id: userId };
        if (startDate && endDate) {
            whereClause.transaction_date = { [Op.between]: [startDate, endDate] };
        }
        if (categoryId) {
            whereClause.category_id = categoryId;
        }
        if (type) {
            whereClause.type = type;
        }

        const transactions = await Transaction.findAll({
            where: whereClause,
            include: [{ model: Category, attributes: ['name', 'emoji'] }],
            order: [['transaction_date', 'DESC']],
            limit: 1000
        });

        res.json({ success: true, data: transactions });
    } catch (error) {
        next(error);
    }
};