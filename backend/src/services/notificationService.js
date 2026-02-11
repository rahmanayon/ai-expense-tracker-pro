// backend/src/services/notificationService.js
const admin = require('firebase-admin');
const { User } = require('../models');

class NotificationService {
    constructor() {
        admin.initializeApp({
            credential: admin.credential.cert(process.env.FIREBASE_CREDENTIALS)
        });
    }

    async sendPushNotification(userId, title, body) {
        const user = await User.findByPk(userId);
        if (!user.fcm_token) return;

        const message = {
            notification: { title, body },
            token: user.fcm_token
        };

        try {
            await admin.messaging().send(message);
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }
}

module.exports = new NotificationService();