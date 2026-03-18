// backend/src/middleware/compression.js
const compression = require('compression');
module.exports = compression({
  filter: (req, res) => req.headers['x-no-compression'] ? false : compression.filter(req, res),
  threshold: 1024
});