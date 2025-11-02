const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getUserByEmail, createUser, ensureAdmin } = require('./store.cjs');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const ORIGIN = process.env.ORIGIN || 'http://localhost:8080';

const app = express();
app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow localhost on any port for development
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }
    // Allow the configured origin
    if (origin === ORIGIN) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

function signSession(user) {
  return jwt.sign({ uid: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const token = req.cookies['session'];
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const existing = getUserByEmail(email);
  if (existing) return res.status(409).json({ error: 'email already exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = createUser({ email, password_hash: hash, role: 'user', name });
  const token = signSession(user);
  res.cookie('session', token, { httpOnly: true, sameSite: 'lax' });
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name || undefined, isAdmin: false } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const emailTrimmed = email.trim().toLowerCase();
  const row = getUserByEmail(emailTrimmed);
  if (!row) {
    console.log(`[LOGIN] User not found for email: ${emailTrimmed}`);
    return res.status(401).json({ error: 'invalid credentials' });
  }
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) {
    console.log(`[LOGIN] Password mismatch for email: ${emailTrimmed}`);
    return res.status(401).json({ error: 'invalid credentials' });
  }
  console.log(`[LOGIN] Success for email: ${emailTrimmed}, role: ${row.role}`);
  const user = { id: row.id, email: row.email, role: row.role, name: row.name };
  const token = signSession(user);
  res.cookie('session', token, { httpOnly: true, sameSite: 'lax' });
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name || undefined, isAdmin: user.role === 'admin' } });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('session');
  res.json({ ok: true });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.get('/', (req, res) => {
  res.json({ message: 'API server running. Frontend at http://localhost:8080', endpoints: ['/api/auth/login', '/api/auth/register', '/api/auth/me', '/api/auth/logout'] });
});

// Seed admin if not present
ensureAdmin('ashish29133@gmail.com', '123#Ashish');

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});

