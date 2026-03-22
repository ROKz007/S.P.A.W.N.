require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');

// Middlewares
const authMiddleware = require('./middleware/authMiddleware');
const adminMiddleware = require('./middleware/adminMiddleware');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());
app.use(express.static('client')); // Serve static client files

// 1. Initialize Supabase Client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Service role bypasses RLS for server-side logic
);

// --- WEBSOCKET LOGIC (Real-time Comms) ---
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
            message: "EMERGENCY: SOS Beacon activated!"
        });
    });

    socket.on('disconnect', () => console.log('Survivor unlinked'));
});

// --- AUTHENTICATION ---
app.post('/api/auth/signup', async (req, res) => {
    const { callsign, password, region } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { data, error } = await supabase
            .from('users')
            .insert([{ callsign, password_hash: hashedPassword, region }])
            .select()
            .single();

        if (error) throw error;

        const token = jwt.sign(
            { userId: data.id, callsign, role: data.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.status(201).json({ token, user: data });
    } catch (err) {
        res.status(409).json({ error: 'Callsign taken or database error.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { callsign, password } = req.body;
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('callsign', callsign)
            .single();

        if (error || !user) return res.status(401).json({ error: 'Invalid credentials.' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });

        const token = jwt.sign(
            { userId: user.id, callsign: user.callsign, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ error: 'Server error during login.' });
    }
});

// --- TRADE ROUTES ---
app.get('/api/trades', async (req, res) => {
    const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: 'DB_ERROR' });
    res.json(data);
});

app.post('/api/trades', authMiddleware, async (req, res) => {
    const { item_name, category, description, contact_info, location } = req.body;
    const { error } = await supabase
        .from('trades')
        .insert([{
            user_id: req.user.userId,
            item_name,
            category,
            description,
            contact_info,
            location
        }]);

    if (error) return res.status(500).json({ error: 'Failed to post trade.' });
    res.status(201).json({ message: 'Trade posted.' });
});

// --- HEATMAP & ADMIN ROUTES ---
app.get('/api/heatmap', async (req, res) => {
    const { data, error } = await supabase
        .from('heatmap_locations')
        .select('city, latitude, longitude, intensity');

    if (error) return res.status(500).json({ error: 'DB_ERROR' });
    res.json(data);
});

app.post('/api/heatmap/inject', authMiddleware, adminMiddleware, async (req, res) => {
    const { city, intensity } = req.body;
    const { error } = await supabase
        .from('heatmap_locations')
        .update({ intensity })
        .eq('city', city);

    if (error) return res.status(500).json({ error: 'Update failed' });
    res.json({ success: true });
});

app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { count: userCount, error: userError } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: tradeCount, error: tradeError } = await supabase.from('trades').select('*', { count: 'exact', head: true }).eq('status', 'open');
        
        if (userError || tradeError) throw new Error('Failed to fetch stats');
        
        res.json({
            survivorsOnline: userCount || 0,
            activeTrades: tradeCount || 0
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Failed to fetch stats', survivorsOnline: 0, activeTrades: 0 });
    }
});

app.post('/api/admin/broadcast', authMiddleware, adminMiddleware, (req, res) => {
    const { message } = req.body;
    io.emit('new_message', { user: 'SYSTEM', content: `BROADCAST: ${message}`, system: true });
    res.json({ success: true });
});

// --- ERROR HANDLING ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "INTERNAL_ERROR" });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`S.P.A.W.N. Command Center online on port ${PORT}`));