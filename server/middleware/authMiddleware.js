const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Look for the token in the 'Authorization' header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'No protocol token found.' });
  }

  try {
    // Verify the token using your secret key from the .env file
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user info (id, callsign, role) to the request
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token', message: 'Transmission corrupted or expired.' });
  }
};