import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { run, get } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'chatbot_default_secret_key_2026';
  return jwt.sign({ userId }, secret, { expiresIn: '30d' });
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const emailClean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existingUser = await get('SELECT id FROM users WHERE email = ?', [emailClean]);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = randomUUID();

    await run(
      `INSERT INTO users (id, name, email, password_hash, theme_preference, accent_color)
       VALUES (?, ?, ?, ?, 'default', '#E5B6F2')`,
      [userId, name.trim(), emailClean, passwordHash]
    );

    const token = generateToken(userId);
    const user = {
      id: userId,
      name: name.trim(),
      email: emailClean,
      theme_preference: 'default',
      accent_color: '#E5B6F2'
    };

    res.status(201).json({
      message: 'Account created successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// POST /api/auth/register (Alias for /signup)
router.post('/register', (req, res, next) => {
  req.url = '/signup';
  router.handle(req, res, next);
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const emailClean = email.trim().toLowerCase();
    const user = await get('SELECT * FROM users WHERE email = ?', [emailClean]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        theme_preference: user.theme_preference,
        accent_color: user.accent_color
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in. Please try again.' });
  }
});

// POST /api/auth/guest (Instant guest account for demo & testing)
router.post('/guest', async (req, res) => {
  try {
    const guestId = randomUUID();
    const guestName = `Guest_${guestId.slice(0, 5)}`;
    const guestEmail = `guest_${guestId.slice(0, 8)}@demo.local`;
    const dummyPassword = randomUUID();
    const salt = await bcrypt.genSalt(6);
    const passwordHash = await bcrypt.hash(dummyPassword, salt);

    await run(
      `INSERT INTO users (id, name, email, password_hash, theme_preference, accent_color)
       VALUES (?, ?, ?, ?, 'default', '#E5B6F2')`,
      [guestId, guestName, guestEmail, passwordHash]
    );

    const token = generateToken(guestId);
    res.json({
      message: 'Guest session initialized',
      user: {
        id: guestId,
        name: guestName,
        email: guestEmail,
        theme_preference: 'default',
        accent_color: '#E5B6F2'
      },
      token
    });
  } catch (error) {
    console.error('Guest creation error:', error);
    res.status(500).json({ error: 'Failed to create guest session.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { theme_preference, accent_color } = req.body;
    const updates = [];
    const params = [];

    if (theme_preference) {
      updates.push('theme_preference = ?');
      params.push(theme_preference);
    }
    if (accent_color) {
      updates.push('accent_color = ?');
      params.push(accent_color);
    }

    if (updates.length > 0) {
      params.push(req.user.id);
      await run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const updatedUser = await get(
      'SELECT id, name, email, theme_preference, accent_color FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ message: 'Preferences updated', user: updatedUser });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ error: 'Failed to update preferences.' });
  }
});

export default router;
