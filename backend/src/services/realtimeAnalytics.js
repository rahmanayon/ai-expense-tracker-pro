// backend/src/services/realtimeAnalytics.js
const { EventEmitter } = require('events');
class RealtimeAnalytics extends EventEmitter {
  trackEvent(type, data) {
    this.emit('metric:update', { type, data, timestamp: Date.now() });
  }
}
module.exports = new RealtimeAnalytics();