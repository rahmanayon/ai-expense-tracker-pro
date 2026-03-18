// backend/src/cache/enterpriseCache.js
const NodeCache = require('node-cache');
const Redis = require('ioredis');

class EnterpriseCacheManager {
  constructor() {
    // L1: In-memory cache (NodeCache)
    this.l1Cache = new NodeCache({
      stdTTL: 60, // 1 minute
      checkperiod: 120,
      useClones: false,
      maxKeys: 10000
    });

    // L2: Redis distributed cache
    this.l2Cache = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      db: 0,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3
    });

    // L3: CDN cache (CloudFront)
    this.cdnEnabled = process.env.CDN_ENABLED === 'true';

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.l1Cache.on('expired', (key, value) => {
      // Promote to L2 on expiration if frequently accessed
      this.promoteToL2(key, value);
    });

    this.l2Cache.on('connect', () => {
      console.log('L2 cache (Redis) connected');
    });

    this.l2Cache.on('error', (err) => {
      console.error('L2 cache error:', err);
      // Fallback to L1 only
    });
  }

  async get(key, fetchFunction, options = {}) {
    const {
      l1TTL = 60,
      l2TTL = 300,
      tags = [],
      staleWhileRevalidate = false
    } = options;

    // Try L1 cache first
    let value = this.l1Cache.get(key);
    if (value !== undefined) {
      this.recordHit('L1', key);
      return value;
    }

    // Try L2 cache
    try {
      const l2Value = await this.l2Cache.get(key);
      if (l2Value !== null) {
        value = JSON.parse(l2Value);
        // Promote to L1
        this.l1Cache.set(key, value, l1TTL);
        this.recordHit('L2', key);
        return value;
      }
    } catch (error) {
      console.error('L2 cache read error:', error);
    }

    // Cache miss - fetch from source
    this.recordMiss(key);
    value = await fetchFunction();

    // Populate caches
    this.set(key, value, { l1TTL, l2TTL, tags });

    return value;
  }

  async set(key, value, options = {}) {
    const {
      l1TTL = 60,
      l2TTL = 300,
      tags = [],
    } = options;

    // Set L1
    this.l1Cache.set(key, value, l1TTL);

    // Set L2
    try {
      await this.l2Cache.setex(key, l2TTL, JSON.stringify(value));
      
      // Add to tag indexes for cache invalidation
      for (const tag of tags) {
        await this.l2Cache.sadd(`tag:${tag}`, key);
      }
    } catch (error) {
      console.error('L2 cache write error:', error);
    }

    // Invalidate CDN if enabled
    if (this.cdnEnabled) {
      await this.invalidateCDN(key);
    }
  }

  async invalidateByTag(tag) {
    // Get all keys with this tag
    const keys = await this.l2Cache.smembers(`tag:${tag}`);
    
    // Delete from L1 and L2
    for (const key of keys) {
      this.l1Cache.del(key);
      await this.l2Cache.del(key);
    }
    
    // Clean up tag set
    await this.l2Cache.del(`tag:${tag}`);
    
    console.log(`Invalidated ${keys.length} cache entries for tag: ${tag}`);
  }

  async invalidatePattern(pattern) {
    const stream = this.l2Cache.scanStream({
      match: pattern,
      count: 100
    });

    const keys = [];
    stream.on('data', (resultKeys) => {
      keys.push(...resultKeys);
    });

    await new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    if (keys.length > 0) {
      // Delete from L1
      keys.forEach(key => this.l1Cache.del(key));
      
      // Delete from L2 in batches
      const pipeline = this.l2Cache.pipeline();
      keys.forEach(key => pipeline.del(key));
      await pipeline.exec();
    }

    return keys.length;
  }

  recordHit(level, key) {
    // Send metrics to monitoring
  }

  recordMiss(key) {
    // Send metrics to monitoring
  }

  // Cache warming for predictable hot data
  async warmCache(tenantId, userId) {
    const warmingTasks = [
      this.warmDashboardData(tenantId, userId),
      this.warmRecentTransactions(tenantId, userId),
      this.warmBudgetData(tenantId, userId),
      this.warmCategoryData(tenantId)
    ];

    const results = await Promise.allSettled(warmingTasks);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`Cache warming completed: ${successful}/${warmingTasks.length} tasks successful`);
  }

  async warmDashboardData(tenantId, userId) {
    const key = `dashboard:${tenantId}:${userId}`;
    const data = await this.fetchDashboardData(tenantId, userId);
    await this.set(key, data, { l1TTL: 300, l2TTL: 600, tags: ['dashboard', `user:${userId}`] });
  }

  // Get cache statistics
  async getStats() {
    const l1Stats = this.l1Cache.getStats();
    const l2Info = await this.l2Cache.info('stats');
    
    return {
      l1: {
        hits: l1Stats.hits,
        misses: l1Stats.misses,
        keys: this.l1Cache.keys().length,
        hitRate: l1Stats.hits / (l1Stats.hits + l1Stats.misses)
      },
      l2: {
        // Parse Redis INFO output
      }
    };
  }
}

module.exports = new EnterpriseCacheManager();