// backend/src/services/mfaService.js
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

exports.generateSecret = async (email) => {
    const secret = speakeasy.generateSecret({ 
        length: 20,
        name: `ExpenseTracker (${email})`
    });
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    return { secret: secret.base32, qrCodeUrl };
};

exports.verifyToken = (token, secret) => {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token
    });
};