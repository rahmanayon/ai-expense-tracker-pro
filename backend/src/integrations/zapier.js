// backend/src/integrations/zapier.js
const express = require('express');
class ZapierIntegration {
  constructor() { this.router = express.Router(); this.setup(); }
  setup() { this.router.post('/hooks/new-transaction', (req, res) => res.json({ success: true })); }
}
module.exports = new ZapierIntegration();