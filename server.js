require('dotenv').config(); 
const express = require('express');
const mysql = require('mysql2'); 
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const authMiddleware = require('./middleware/authMiddleware'); // Import Step 3 middleware
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server);
const cron = require('node-cron');
const adminMiddleware = require('./middleware/adminMiddleware');

const app = express();
app.use(express.static(__dirname));
const port = process.env.PORT || 3000;

const connection = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'spawn_db'
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// WebSocket logic
io.on('connection', (socket) => {
    console.log('New survivor linked to the network');

    // Handle incoming chat messages
    socket.on('send_message', (data) => {
        // Broadcast to everyone
        io.emit('new_message', {
            user: data.user,
            content: data.content,
            time: new Date().toLocaleTimeString()
        });
    });

    // Handle SOS Beacons
    socket.on('sos_beacon', (data) => {
        io.emit('sos_received', {
            user: data.user,
            city: data.city,
            message: "EMERGENCY: SOS Beacon activated!"
        });
    });

    socket.on('disconnect', () => {
        console.log('Survivor unlinked');
    });
});

// --- AUTHENTICATION ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
  const { callsign, password, region } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const query = 'INSERT INTO users (callsign, password_hash, region) VALUES (?, ?, ?)';
    connection.query(query, [callsign, hashedPassword, region], (err, result) => {
      if (err) return res.status(409).json({ error: 'Callsign taken.' });
      const token = jwt.sign({ userId: result.insertId, callsign, role: 'survivor' }, process.env.JWT_SECRET, { expiresIn: '24h' });
      res.status(201).json({ token, user: { id: result.insertId, callsign, region } });
    });
  } catch (error) { res.status(500).json({ error: 'Server error.' }); }
});

app.post('/api/auth/login', (req, res) => {
  const { callsign, password } = req.body;
  const query = 'SELECT * FROM users WHERE callsign = ?';
  connection.query(query, [callsign], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: 'Invalid credentials.' });
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });
    const token = jwt.sign({ userId: user.id, callsign: user.callsign, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, callsign: user.callsign, role: user.role } });
  });
});

// --- ADMIN ROUTES ---
app.get('/api/admin/stats', authMiddleware, adminMiddleware, (req, res) => {
    const queries = {
        users: 'SELECT COUNT(*) as count FROM users',
        trades: 'SELECT COUNT(*) as count FROM trades WHERE status = "open"',
        reports: 'SELECT COUNT(*) as count FROM hazard_reports WHERE status = "pending"'
    };

    // Note: For simplicity, this is a nested callback; in production, use PROMISE.ALL
    connection.query(queries.users, (err, uRes) => {
        connection.query(queries.trades, (err, tRes) => {
            connection.query(queries.reports, (err, rRes) => {
                res.json({
                    survivorsOnline: uRes[0].count,
                    activeTrades: tRes[0].count,
                    pendingThreats: rRes[0].count
                });
            });
        });
    });
});

// --- HEATMAP ROUTES ---
app.get('/api/heatmap', (req, res) => {
    const query = 'SELECT city, latitude, longitude, intensity FROM heatmap_locations';
    connection.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'DB_ERROR' });
        res.json(results);
    });
});

// --- TRADE ROUTES ---
app.get('/api/trades', (req, res) => {
    const query = 'SELECT * FROM trades WHERE status = "open" ORDER BY created_at DESC';
    connection.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'DB_ERROR' });
        res.json(results);
    });
});

app.post('/api/trades', authMiddleware, (req, res) => {
    const { item_name, category, description, contact, location } = req.body;
    const query = 'INSERT INTO trades (user_id, item_name, category, description, contact, location) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(query, [req.user.userId, item_name, category, description, contact, location], (err) => {
        if (err) return res.status(500).json({ error: 'DB_ERROR' });
        res.status(201).json({ message: 'Trade posted.' });
    });
});


// --- CRON JOB: Expire old trades every hour ---
cron.schedule('0 * * * *', () => {
    const query = `
        UPDATE trades 
        SET status = 'expired' 
        WHERE status = 'open' AND expires_at < NOW()
    `;
    connection.query(query, (err, result) => {
        if (err) console.error('Error in trade expiry job:', err);
        else if (result.affectedRows > 0) {
            console.log(`System: ${result.affectedRows} trades marked as expired.`);
        }
    });
});

// --- HAZARD REPORT ROUTES ---
app.post('/api/heatmap/report', authMiddleware, (req, res) => {
    const { city, hazard_type, description } = req.body;
    const query = 'INSERT INTO hazard_reports (user_id, city, hazard_type, description) VALUES (?, ?, ?, ?)';
    
    connection.query(query, [req.user.userId, city, hazard_type, description], (err) => {
        if (err) return res.status(500).json({ error: 'VALIDATION_ERROR' });
        res.status(201).json({ message: 'Hazard report submitted for verification.', status: 'pending' });
    });
});

// --- Standard ERROR HANDLING ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred in the S.P.A.W.N. network.",
        statusCode: 500
    });
});

// --- START SERVER ---
server.listen(port, () => {
    console.log(`S.P.A.W.N. Command Center online on port ${port}`);
});