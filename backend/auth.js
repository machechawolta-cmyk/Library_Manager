const crypto = require('crypto');
const sessions = new Map(); // token -> user (in memory; cleared when the server restarts)

exports.createSession = (user) => {
  const token = crypto.randomUUID();
  sessions.set(token, user);
  return token;
};

exports.requireAuth = (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const user = sessions.get(token);
  if (!user) return res.status(401).json({ error: 'Please log in' });
  req.user = user;
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
  next();
};
