const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        success: true,
        data: {
            summary: {
                totalExpenses: 80.00,
                totalIncome: 2000.00
            }
        }
    });
});

module.exports = router;
