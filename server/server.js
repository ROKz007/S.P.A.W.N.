require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const { createApp } = require('./app');

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
        socket.on('send_message', (data) => {
            io.emit('new_message', { user: data.user || 'ANONYMOUS', content: data.content, time: new Date().toLocaleTimeString() });
        });

        socket.on('sos_beacon', (data) => {
            io.emit('sos_received', { user: data.user, city: data.city, message: 'EMERGENCY: SOS Beacon activated!' });
        });
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => console.log(`S.P.A.W.N. online with sockets on port ${PORT}`));
} else {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`S.P.A.W.N. online (sockets disabled) on port ${PORT}`));
}
