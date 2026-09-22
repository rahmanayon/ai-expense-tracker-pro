const express = require('express');
const router = express.Router();

router.get('/insights', (req, res) => {
    res.json({
        success: true,
        data: {
            insights: [
                { id: 1, type: 'spending', message: 'You spent 10% more on groceries this month.' }
            ]
        }
    });
});

module.exports = router;
