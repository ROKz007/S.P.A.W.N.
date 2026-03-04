const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static(__dirname));
const port = 3000;

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'shacks@5275',
  database: 'MAP_DATA'
});

// Connect to MySQL
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint to submit location data
app.post('/submit-location', (req, res) => {
  const { latitude, longitude, intensity } = req.body;

  if (latitude && longitude && intensity) {
    const query = 'INSERT INTO locations (latitude, longitude, intensity) VALUES (?, ?, ?)';
    connection.query(query, [latitude, longitude, intensity], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        res.status(500).json({ message: 'Error inserting data' });
        return;
      }
      res.status(200).json({ message: 'Location data submitted successfully' });
    });
  } else {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
