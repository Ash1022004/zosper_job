const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getUserByEmail, createUser, ensureAdmin, trackLogin, trackApplication, getAnalyticsSummary } = require('./store.cjs');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const ORIGIN = process.env.ORIGIN || 'http://localhost:8080';
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || ORIGIN.startsWith('https://');

// Support multiple origins (comma-separated)
const ALLOWED_ORIGINS = ORIGIN.split(',').map(o => o.trim()).filter(Boolean);

const app = express();
app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      console.log('[CORS] No origin header, allowing');
      return callback(null, true);
    }
    
    console.log(`[CORS] Request from origin: ${origin}`);
    console.log(`[CORS] Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
    
    // Allow localhost on any port for development
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      console.log('[CORS] Allowed: localhost');
      return callback(null, true);
    }
    
    // Check exact match with allowed origins
    if (ALLOWED_ORIGINS.includes(origin)) {
      console.log('[CORS] Allowed: exact match');
      return callback(null, true);
    }
    
    // Check if origin is a Vercel deployment (any *.vercel.app subdomain)
    if (origin.includes('.vercel.app')) {
      console.log('[CORS] Allowed: Vercel deployment');
      return callback(null, true);
    }
    
    // In production, allow any HTTPS origin (for flexibility during deployment)
    if (IS_PRODUCTION && origin.startsWith('https://')) {
      console.log('[CORS] Allowed: HTTPS origin in production');
      return callback(null, true);
    }
    
    // Check if origin matches base domain (for subdomain variations)
    for (const allowedOrigin of ALLOWED_ORIGINS) {
      try {
        const allowedUrl = new URL(allowedOrigin);
        const originUrl = new URL(origin);
        
        // Allow if same domain (e.g., www.example.com and example.com)
        if (allowedUrl.hostname === originUrl.hostname || 
            originUrl.hostname.endsWith('.' + allowedUrl.hostname) ||
            allowedUrl.hostname.endsWith('.' + originUrl.hostname)) {
          console.log(`[CORS] Allowed: domain match (${allowedUrl.hostname} vs ${originUrl.hostname})`);
          return callback(null, true);
        }
      } catch (e) {
        // Invalid URL format, skip
      }
    }
    
    console.log(`[CORS] ❌ REJECTED origin: ${origin}`);
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
  // Try to get token from cookie first
  let token = req.cookies['session'];
  
  // Fallback: try to get token from Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('[AUTH] Token found in Authorization header');
    }
  }
  
  console.log('[AUTH] Checking auth - cookies:', Object.keys(req.cookies), 'token present:', !!token);
  if (!token) {
    console.log('[AUTH] No token found in cookie or header');
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    console.log('[AUTH] Token verified - user:', req.user);
    next();
  } catch (e) {
    console.log('[AUTH] Token verification failed:', e.message);
    return res.status(401).json({ error: 'unauthorized' });
  }
}

function setAuthCookie(res, token) {
  const cookieOptions = {
    httpOnly: true,
    sameSite: IS_PRODUCTION ? 'none' : 'lax',
    secure: IS_PRODUCTION,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/', // Important: set path to root so cookie is available on all routes
    // DO NOT set domain - this allows cross-domain cookies to work
  };
  
  // For cross-domain cookies, explicitly set Access-Control-Allow-Credentials
  res.header('Access-Control-Allow-Credentials', 'true');
  
  res.cookie('session', token, cookieOptions);
  console.log('[AUTH] Cookie set with options:', { 
    sameSite: cookieOptions.sameSite, 
    secure: cookieOptions.secure, 
    path: cookieOptions.path,
    httpOnly: cookieOptions.httpOnly,
    maxAge: '7 days',
    isProduction: IS_PRODUCTION,
    domain: 'NOT SET (allows cross-domain)'
  });
  console.log('[AUTH] Request origin:', res.req?.headers?.origin);
  console.log('[AUTH] Response headers - Set-Cookie:', res.getHeader('Set-Cookie'));
}

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, mobile } = req.body || {};
  if (!email || !password || !name || !mobile) return res.status(400).json({ error: 'name, email, mobile and password required' });
  const mobileTrim = String(mobile).trim();
  if (!/^[0-9+\-()\s]{8,20}$/.test(mobileTrim)) {
    return res.status(400).json({ error: 'invalid mobile number' });
  }
  const existing = getUserByEmail(email);
  if (existing) return res.status(409).json({ error: 'email already exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = createUser({ email, password_hash: hash, role: 'user', name, mobile: mobileTrim });
  const token = signSession(user);
  setAuthCookie(res, token);
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name || undefined, mobile: user.mobile || undefined, isAdmin: false } });
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
  const user = { id: row.id, email: row.email, role: row.role, name: row.name, mobile: row.mobile };
  const token = signSession(user);
  setAuthCookie(res, token);
  // Track login for analytics
  if (row.role === 'user') {
    trackLogin(row.id, row.email);
  }
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name || undefined, mobile: user.mobile || undefined, isAdmin: user.role === 'admin', role: user.role } });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('session', { 
    httpOnly: true, 
    sameSite: IS_PRODUCTION ? 'none' : 'lax',
    secure: IS_PRODUCTION,
    path: '/'
  });
  res.json({ ok: true });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  // Ensure isAdmin is included in the response
  const userResponse = {
    user: {
      ...req.user,
      isAdmin: req.user.role === 'admin'
    }
  };
  console.log('[AUTH] /api/auth/me response:', userResponse);
  res.json(userResponse);
});

// Analytics endpoints
app.post('/api/analytics/application', authMiddleware, (req, res) => {
  const { jobId, jobTitle, company } = req.body || {};
  if (!jobId || !jobTitle || !company) {
    return res.status(400).json({ error: 'jobId, jobTitle, and company required' });
  }
  trackApplication(req.user.uid, req.user.email, jobId, jobTitle, company);
  res.json({ success: true });
});

app.get('/api/analytics/summary', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const summary = getAnalyticsSummary();
  res.json(summary);
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

