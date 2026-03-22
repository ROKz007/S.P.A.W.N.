module.exports = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Access denied. Higher clearance required.' 
    });
  }
  next();
};