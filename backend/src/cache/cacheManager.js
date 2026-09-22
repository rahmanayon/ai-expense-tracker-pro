// backend/src/cache/cacheManager.js
const Redis = require('ioredis');
class CacheManager {
  constructor() { this.redis = new Redis(); }
  async get(key) { return await this.redis.get(key); }
  async set(key, val, ttl) { await this.redis.setex(key, ttl, val); }
}
module.exports = new CacheManager();