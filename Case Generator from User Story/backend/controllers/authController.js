import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/db.js';

function signToken(userId, username) {
  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export async function signup(req, res) {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters.' });
    }
    if (username.trim().length > 50) {
      return res.status(400).json({ error: 'Username must be 50 characters or fewer.' });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const trimmedUsername = username.trim();

    // Check uniqueness
    const existing = db.prepare('SELECT id FROM Users WHERE username = ?').get(trimmedUsername);
    if (existing) {
      return res.status(409).json({ error: 'Username already taken. Please choose another.' });
    }

    // Hash password and insert
    const password_hash = await bcrypt.hash(password, 10);
    const result = db
      .prepare('INSERT INTO Users (username, password_hash) VALUES (?, ?)')
      .run(trimmedUsername, password_hash);

    const userId = result.lastInsertRowid;
    const token = signToken(userId, trimmedUsername);

    res.status(201).json({
      token,
      user: { id: userId, username: trimmedUsername },
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = db
      .prepare('SELECT id, username, password_hash FROM Users WHERE username = ?')
      .get(username.trim());

    // Use constant-time comparison to prevent user enumeration
    if (!user) {
      await bcrypt.compare(password, '$2a$10$invalidhashfortimingatk');
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = signToken(user.id, user.username);

    res.json({
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}
