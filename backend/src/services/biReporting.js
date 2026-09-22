// backend/src/services/biReporting.js
const { sequelize } = require('../models');
class BIReportingService {
  async generateExecutiveSummary(tenantId) {
    const data = await sequelize.query('SELECT SUM(amount) FROM transactions WHERE tenant_id = ?', { replacements: [tenantId] });
    return { total: data[0] };
  }
}
module.exports = new BIReportingService();