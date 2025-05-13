const jwt = require('jsonwebtoken');

const SECRET_KEY = 'your_secret_key'; // Use process.env.SECRET_KEY in production

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    //req.user = decoded;
    req.user = { userId: decoded.userId }; // ✅ Important fix
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};