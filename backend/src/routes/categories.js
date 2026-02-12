const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, name: 'Groceries', emoji: '🍎' }
        ]
    });
});

module.exports = router;
