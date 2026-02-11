// backend/src/routes/exports.js
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const exportController = require('../controllers/exportController');
const { authenticate, requireFeature } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Export data
router.post('/',
  authenticate,
  requireFeature('exports'),
  [
    body('format').isIn(['csv', 'excel', 'xlsx', 'pdf', 'json', 'ofx', 'qfx', 'qif']),
    body('dataType').isIn(['transactions', 'budgets', 'investments', 'categories', 'all']),
    body('filters').optional().isObject(),
    body('options').optional().isObject()
  ],
  validate,
  asyncHandler(exportController.exportData.bind(exportController))
);

// Get export status (for async exports)
router.get('/:exportId/status',
  authenticate,
  asyncHandler(async (req, res) => {
    const { exportId } = req.params;
    
    const exportLog = await ExportLog.findOne({
      where: { id: exportId, userId: req.user.id }
    });

    if (!exportLog) {
      return res.status(404).json({ success: false, error: 'Export not found' });
    }

    res.json({
      success: true,
      data: {
        exportId,
        status: exportLog.status,
        progress: exportLog.progress,
        downloadUrl: exportLog.status === 'completed' 
          ? `/api/exports/${exportId}/download` 
          : null,
        expiresAt: exportLog.expiresAt
      }
    });
  })
);

// Download export file
router.get('/:exportId/download',
  authenticate,
  asyncHandler(async (req, res) => {
    const { exportId } = req.params;
    
    const exportLog = await ExportLog.findOne({
      where: { 
        id: exportId, 
        userId: req.user.id,
        status: 'completed'
      }
    });

    if (!exportLog) {
      return res.status(404).json({ success: false, error: 'Export not found or expired' });
    }

    if (new Date() > exportLog.expiresAt) {
      return res.status(410).json({ success: false, error: 'Export has expired' });
    }

    const fileStream = await exportController.getExportFileStream(exportId);
    
    res.setHeader('Content-Type', exportLog.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportLog.filename}"`);
    res.setHeader('Content-Length', exportLog.fileSize);
    
    fileStream.pipe(res);
  })
);

module.exports = router;