const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set');
  process.exit(1);
}
if (JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET must be at least 32 characters for cryptographic strength');
  process.exit(1);
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function requireLandlord(req, res, next) {
  if (req.user.role !== 'landlord') {
    return res.status(403).json({ error: 'Landlord access required' });
  }
  next();
}

module.exports = { authenticateToken, requireLandlord, JWT_SECRET };
