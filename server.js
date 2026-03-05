require('dotenv').config(); 
const express = require('express');
const mysql = require('mysql2'); 
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const authMiddleware = require('./middleware/authMiddleware'); // Import Step 3 middleware

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

app.listen(port, () => console.log(`S.P.A.W.N. Server online on port ${port}`));