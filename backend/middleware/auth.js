const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretcampuspasskey';

module.exports = function(req, res, next) {
  const header = req.header('Authorization');
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No valid token provided.' });
  }

  const token = header.slice(7); // Remove 'Bearer '
  if (!token) {
    return res.status(401).json({ message: 'Access denied. Token is empty.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ message: 'Session expired or invalid token. Please login again.' });
  }
};
