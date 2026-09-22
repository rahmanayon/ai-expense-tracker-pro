// backend/src/middleware/tenant.js
const { Tenant, UserTenant } = require('../models');

class TenantMiddleware {
  async resolveTenant(req, res, next) {
    try {
      const tenantIdentifier = req.headers['x-tenant-id'] || req.query.tenant;
      if (!tenantIdentifier) return res.status(400).json({ error: 'Tenant required' });
      const tenant = await Tenant.findOne({ where: { id: tenantIdentifier, isActive: true } });
      if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
      req.tenant = tenant;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Tenant resolution failed' });
    }
  }
}

module.exports = new TenantMiddleware();