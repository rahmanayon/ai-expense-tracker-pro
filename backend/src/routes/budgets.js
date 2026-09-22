const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    res.status(201).json({
        success: true,
        data: req.body
    });
});

router.get('/status', (req, res) => {
    res.json({
        success: true,
        data: [
            { categoryId: 1, spent: 80.00, budgeted: 500.00 }
        ]
    });
});

module.exports = router;
