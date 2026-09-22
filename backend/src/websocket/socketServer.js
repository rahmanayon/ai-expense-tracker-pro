// backend/src/websocket/socketServer.js
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

class SocketServer {
    constructor(server) {
        this.io = socketIo(server, {
            cors: {
                origin: process.env.FRONTEND_URL,
                methods: ["GET", "POST"]
            }
        });

        this.io.use((socket, next) => {
            if (socket.handshake.auth && socket.handshake.auth.token) {
                jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET, (err, decoded) => {
                    if (err) return next(new Error('Authentication error'));
                    socket.userId = decoded.id;
                    next();
                });
            } else {
                next(new Error('Authentication error'));
            }
        });

        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.userId}`);
            socket.join(`user_${socket.userId}`);

            socket.on('disconnect', () => {
                console.log('User disconnected');
            });
        });
    }

    notifyUser(userId, event, data) {
        this.io.to(`user_${userId}`).emit(event, data);
    }
}

module.exports = SocketServer;