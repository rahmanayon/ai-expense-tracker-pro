// backend/src/integrations/banking/plaidIntegration.js
const { PlaidApi } = require('plaid');
class PlaidIntegration {
  async syncTransactions(accessToken) {
    return { transactions: [], count: 0 };
  }
}
module.exports = new PlaidIntegration();