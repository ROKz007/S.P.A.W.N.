require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const { createApp } = require('./app');

let server = null;
let io = null;

// Feature flag: enable sockets when ENABLE_SOCKETS env var is 'true',
// or by default during non-production (development) runs.
const ENABLE_SOCKETS = process.env.ENABLE_SOCKETS
    ? process.env.ENABLE_SOCKETS === 'true'
    : (process.env.NODE_ENV !== 'production');

// Create express app instance (routes are configured inside createApp)
const app = createApp();

if (ENABLE_SOCKETS) {
    server = http.createServer(app);
    io = new Server(server, { cors: { origin: '*' } });
    // Attach io to app so routes can access it via app.get('io')
    app.set('io', io);
}

if (!ENABLE_SOCKETS) {
    console.info('Socket.IO disabled (ENABLE_SOCKETS=false). Real-time features are inactive.');
}

const PORT = process.env.PORT || 3000;
if (ENABLE_SOCKETS && server) {
    // Initialize socket handlers
    io.on('connection', (socket) => {
        console.log('New survivor linked to the network');

        socket.on('send_message', (data) => {
            io.emit('new_message', {
                user: data.user || 'ANONYMOUS',
                content: data.content,
                time: new Date().toLocaleTimeString()
            });
        });

        socket.on('sos_beacon', (data) => {
            io.emit('sos_received', {
                user: data.user,
                city: data.city,
                message: 'EMERGENCY: SOS Beacon activated!'
            });
        });

        socket.on('disconnect', () => console.log('Survivor unlinked'));
    });

    server.listen(PORT, () => console.log(`S.P.A.W.N. Command Center online with sockets on port ${PORT}`));
} else {
    // Start express without a persistent socket server — compatible with serverless/platforms like Vercel
    app.listen(PORT, () => console.log(`S.P.A.W.N. Command Center online (sockets disabled) on port ${PORT}`));
}
