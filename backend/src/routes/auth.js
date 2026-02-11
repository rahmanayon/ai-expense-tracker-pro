// backend/routes/auth.js (MFA Addition)
router.post('/mfa/setup', authenticate, async (req, res) => {
    const { secret, qrCodeUrl } = await mfaService.generateSecret(req.user.email);
    await req.user.update({ mfa_secret: secret, mfa_enabled: false });
    res.json({ secret, qrCodeUrl });
});

router.post('/mfa/verify', authenticate, async (req, res) => {
    const { token } = req.body;
    const verified = mfaService.verifyToken(token, req.user.mfa_secret);
    
    if (verified) {
        await req.user.update({ mfa_enabled: true });
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'Invalid token' });
    }
});