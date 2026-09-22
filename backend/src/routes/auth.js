const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');
const mfaService = require('../services/mfaService');
const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

// Register
router.post('/register', [
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').notEmpty(),
    body('lastName').notEmpty()
], validate, async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Email already exists' });
        }
        const user = await User.create({ email, password, firstName, lastName });
        const token = user.generateAuthToken();
        res.status(201).json({ success: true, data: { user, token } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Login
router.post('/login', [
    body('email').isEmail(),
    body('password').exists()
], validate, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user || !(await user.validatePassword(password))) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
        const token = user.generateAuthToken();
        res.json({ success: true, data: { user, token } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// MFA routes
router.post('/mfa/setup', authenticate, async (req, res) => {
    try {
        const { secret, qrCodeUrl } = await mfaService.generateSecret(req.user.email);
        await req.user.update({ twoFactorSecret: secret, twoFactorEnabled: false });
        res.json({ secret, qrCodeUrl });
    } catch (error) {
        res.status(500).json({ error: 'MFA setup failed' });
    }
});

router.post('/mfa/verify', authenticate, async (req, res) => {
    try {
        const { token } = req.body;
        const verified = mfaService.verifyToken(token, req.user.twoFactorSecret);
        if (verified) {
            await req.user.update({ twoFactorEnabled: true });
            res.json({ success: true });
        } else {
            res.status(400).json({ error: 'Invalid token' });
        }
    } catch (error) {
        res.status(500).json({ error: 'MFA verification failed' });
    }
});

module.exports = router;