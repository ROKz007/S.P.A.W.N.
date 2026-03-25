require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const { createApp } = require('./app');
const jwt = require('jsonwebtoken');

let server = null;
let io = null;

// ENABLE_SOCKETS: read explicit env var, default to true for hosts that support sockets
const ENABLE_SOCKETS = typeof process.env.ENABLE_SOCKETS !== 'undefined'
    ? process.env.ENABLE_SOCKETS === 'true'
    : true;

const app = createApp();

if (ENABLE_SOCKETS) {
    server = http.createServer(app);
    io = new Server(server, { cors: { origin: '*' } });
    app.set('io', io);

    io.on('connection', (socket) => {
        // Validate token provided in handshake auth and attach user to socket
        try {
            const token = socket.handshake.auth && socket.handshake.auth.token;
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.user = decoded; // { id, callsign, role, region, ... }
            }
        } catch (e) {
            // Invalid token — keep socket but mark as unauthenticated
            socket.user = null;
        }

        // Simple presence tracking
        if (!global.__connectedUsers) global.__connectedUsers = new Map();
        if (socket.user && socket.user.callsign) {
            global.__connectedUsers.set(socket.id, { callsign: socket.user.callsign, region: socket.user.region });
            // Broadcast updated online list
            io.emit('user_online_update', Array.from(global.__connectedUsers.values()));
        }

        socket.on('send_message', (data) => {
            const sender = socket.user && socket.user.callsign ? socket.user.callsign : (data.user || 'ANONYMOUS');
            io.emit('new_message', { user: sender, content: data.content, time: new Date().toLocaleTimeString() });
        });

        socket.on('sos_beacon', async (data) => {
            const sender = socket.user && socket.user.callsign ? socket.user.callsign : (data.user || 'UNKNOWN');
            const userKey = (socket.user && socket.user.userId) ? `id:${socket.user.userId}` : `callsign:${sender}`;
            const city = (socket.user && socket.user.region) || data.city || 'UNKNOWN';

            if (!global.__lastSosByUser) global.__lastSosByUser = new Map();
            if (!global.__sosHistory) global.__sosHistory = [];

            const now = Date.now();
            const last = global.__lastSosByUser.get(userKey) || 0;
            const COOLDOWN = 60 * 1000; // 1 minute

            if (now - last < COOLDOWN) {
                const remaining = Math.ceil((COOLDOWN - (now - last)) / 1000);
                // Notify only the sender socket that they're rate-limited
                socket.emit('sos_rejected', { reason: 'cooldown', remaining });
                return;
            }

            // Accept SOS: record timestamp, push to history
            global.__lastSosByUser.set(userKey, now);
            const entry = { user: sender, city, message: data.message || 'EMERGENCY: SOS Beacon activated!', time: new Date().toISOString() };
            global.__sosHistory.unshift(entry);
            // keep a bounded history
            if (global.__sosHistory.length > 200) global.__sosHistory.length = 200;

            // Broadcast to all clients
            io.emit('sos_received', { user: sender, city: city, message: entry.message, time: entry.time });

            // Optionally persist to Supabase if available (store user_id reference)
            try {
                const supabase = app.get('supabase');
                if (supabase && socket.user && socket.user.userId) {
                    await supabase.from('sos_events').insert([{ user_id: socket.user.userId, city, message: entry.message }]);
                }
            } catch (e) {
                // ignore DB errors (table may not exist)
            }
        });

        socket.on('disconnect', () => {
            if (global.__connectedUsers && global.__connectedUsers.has(socket.id)) {
                global.__connectedUsers.delete(socket.id);
                io.emit('user_online_update', Array.from(global.__connectedUsers.values()));
            }
        });
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => console.log(`S.P.A.W.N. online with sockets on port ${PORT}`));
} else {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`S.P.A.W.N. online (sockets disabled) on port ${PORT}`));
}
