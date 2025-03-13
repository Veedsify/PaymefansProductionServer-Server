// socketManager.js
let io;
const {createAdapter} = require("@socket.io/redis-adapter");
const redis = require("./redis-store");
const {createClient} = require("redis");
const {ADMIN_PANEL_URL, VERIFICATION_URL, APP_URL, LIVESTREAM_PORT} = process.env;
const pubClient = createClient({url: "redis://localhost:6379"});
const subClient = pubClient.duplicate();
const {Server} = require('socket.io');

module.exports = {
    init: async (server) => {
        // Connect to Redis before initializing Socket.IO with the adapter
        await pubClient.connect();
        await subClient.connect();

        io = new Server(server, {
            cors: {
                origin: [VERIFICATION_URL, ADMIN_PANEL_URL, LIVESTREAM_PORT, APP_URL],
                methods: ["GET", "POST"],
            },
            adapter: createAdapter(pubClient, subClient),
        });

        // Optional: Handle Redis connection errors
        pubClient.on('error', (err) => console.error('Redis Pub Error:', err));
        subClient.on('error', (err) => console.error('Redis Sub Error:', err));

        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }
};