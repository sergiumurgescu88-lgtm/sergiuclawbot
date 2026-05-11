const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Database = require('better-sqlite3');
const db = new Database('/var/www/agentulmeu.online/data/agentulmeu.db');

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BASE_URL || 'https://agentulmeu.online'}/api/auth/google/callback`
);

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me-in-pm2';

// 1. Redirect to Google
router.get('/google', (req, res) => {
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'consent'
  });
  res.redirect(authUrl);
});

// 2. Callback Google
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.redirect('/wizard?auth=error');

    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const p = ticket.getPayload();

    let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(p.sub);
    if (!user) {
      const id = crypto.randomUUID();
      db.prepare('INSERT INTO users (id, google_id, email, name, avatar) VALUES (?, ?, ?, ?, ?)').run(
        id, p.sub, p.email, p.name, p.picture
      );
      user = { id, email: p.email, name: p.name };
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.redirect(`${process.env.BASE_URL || 'https://agentulmeu.online'}/wizard?auth=success&token=${token}`);
  } catch (err) {
    console.error('[Auth Google] Error:', err.message);
    res.redirect('/wizard?auth=error');
  }
});

// 3. Profil utilizator
router.get('/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Neautentificat' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    const user = db.prepare('SELECT id, email, name, avatar FROM users WHERE id = ?').get(decoded.userId);
    if (!user) return res.status(404).json({ error: 'Utilizator inexistent' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ error: 'Token invalid' });
  }
});

// 4. Leagă sesiunea wizard de cont
router.post('/link-session', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Neautentificat' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId necesar' });
    db.prepare('UPDATE sessions SET user_id = ? WHERE id = ?').run(decoded.userId, sessionId);
    res.json({ success: true, message: 'Sesiune legata de cont' });
  } catch (err) {
    res.status(401).json({ error: 'Token invalid' });
  }
});

module.exports = router;
