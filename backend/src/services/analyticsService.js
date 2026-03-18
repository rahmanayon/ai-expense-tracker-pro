// backend/src/services/analyticsService.js
const { sequelize } = require('../models');
const { Op } = require('sequelize');
const { logger } = require('../config/server');

class AnalyticsService {
  async getUserAnalytics(userId, startDate, endDate) {
    try {
      const spendingTrends = await sequelize.query(`
        SELECT 
          DATE_TRUNC('day', transaction_date) as date,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
          COUNT(*) as transaction_count
        FROM transactions
        WHERE user_id = :userId
          AND transaction_date BETWEEN :startDate AND :endDate
        GROUP BY DATE_TRUNC('day', transaction_date)
        ORDER BY date
      `, {
        replacements: { userId, startDate, endDate },
        type: sequelize.QueryTypes.SELECT
      });

      const categoryBreakdown = await sequelize.query(`
        SELECT 
          c.name,
          c.emoji,
          SUM(t.amount) as total_amount,
          COUNT(*) as transaction_count
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = :userId
          AND t.type = 'expense'
          AND t.transaction_date BETWEEN :startDate AND :endDate
        GROUP BY c.id, c.name, c.emoji
        ORDER BY total_amount DESC
      `, {
        replacements: { userId, startDate, endDate },
        type: sequelize.QueryTypes.SELECT
      });

      return { spendingTrends, categoryBreakdown };
    } catch (error) {
      logger.error('Analytics failed:', error);
      throw new Error('Failed to generate analytics');
    }
  }
}

module.exports = new AnalyticsService();