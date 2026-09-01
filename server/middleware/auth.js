import jwt from 'jsonwebtoken';
import { get } from '../db.js';

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.trim().length > 0) {
    return secret.trim();
  }
  return 'nexus_ai_secure_auth_session_jwt_secret_2026_key';
};

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required. Please log in.' });
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);

    const user = await get('SELECT id, name, email, theme_preference, accent_color FROM users WHERE id = ?', [decoded.userId]);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User session expired or user not found.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Your session has expired. Please log in again.' });
    }
    return res.status(403).json({ success: false, error: 'Invalid authentication token.' });
  }
};
