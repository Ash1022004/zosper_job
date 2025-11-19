const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(process.cwd(), 'server');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');
const OTP_TTL_MS = 5 * 60 * 1000;

const pendingOtps = new Map();

function normalizeEmail(email = '') {
  return String(email).toLowerCase().trim();
}

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return data;
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function getAllUsers() {
  return readJson(USERS_FILE, []);
}

function saveAllUsers(users) {
  writeJson(USERS_FILE, users);
}

function getUserByEmail(email) {
  const emailLower = normalizeEmail(email);
  return getAllUsers().find(u => normalizeEmail(u.email) === emailLower) || null;
}

function getUserByMobile(mobile) {
  const mobileNormalized = normalizeMobile(mobile);
  if (!mobileNormalized) return null;
  return getAllUsers().find(u => normalizeMobile(u.mobile) === mobileNormalized) || null;
}

function createUser({ email, password_hash, role, name, mobile }) {
  const users = getAllUsers();
  const id = users.length ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;
  const user = { id, email, password_hash, role: role || 'user', name: name || null, mobile: mobile || null };
  users.push(user);
  saveAllUsers(users);
  return { id: user.id, email: user.email, role: user.role, name: user.name, mobile: user.mobile };
}

function ensureAdmin(email, password) {
  const u = getUserByEmail(email);
  if (u && u.role === 'admin') return; // Admin exists, don't recreate
  if (u) {
    // User exists but not admin, update to admin
    const users = getAllUsers();
    // FIX: Normalize email case for comparison to match getUserByEmail behavior
    const emailNormalized = normalizeEmail(email);
    const user = users.find(us => normalizeEmail(us.email) === emailNormalized);
    if (user) {
      const hash = bcrypt.hashSync(password, 10);
      user.password_hash = hash;
      user.role = 'admin';
      saveAllUsers(users);
      return;
    }
  }
  // Create new admin
  const hash = bcrypt.hashSync(password, 10);
  createUser({ email, password_hash: hash, role: 'admin' });
}

// Analytics functions
function getAnalytics() {
  return readJson(ANALYTICS_FILE, {
    logins: [],
    applications: [],
    pageViews: []
  });
}

function saveAnalytics(analytics) {
  writeJson(ANALYTICS_FILE, analytics);
}

function trackLogin(userId, email) {
  const analytics = getAnalytics();
  analytics.logins.push({
    userId,
    email,
    timestamp: new Date().toISOString()
  });
  saveAnalytics(analytics);
}

function trackApplication(userId, email, jobId, jobTitle, company) {
  const analytics = getAnalytics();
  analytics.applications.push({
    userId,
    email,
    jobId,
    jobTitle,
    company,
    timestamp: new Date().toISOString()
  });
  saveAnalytics(analytics);
}

function trackPageView(userId, email, page) {
  const analytics = getAnalytics();
  analytics.pageViews.push({
    userId,
    email,
    page,
    timestamp: new Date().toISOString()
  });
  saveAnalytics(analytics);
}

function createOtpForEmail(rawEmail) {
  const email = normalizeEmail(rawEmail);
  if (!email) {
    throw new Error('Invalid email for OTP generation');
  }
  const code = (Math.floor(100000 + Math.random() * 900000)).toString();
  const expiresAt = Date.now() + OTP_TTL_MS;
  pendingOtps.set(email, { code, expiresAt, attempts: 0 });
  return { code, expiresAt };
}

function verifyOtpForEmail(rawEmail, submittedCode) {
  const email = normalizeEmail(rawEmail);
  const code = String(submittedCode || '').trim();
  if (!email || code.length === 0) return false;
  const record = pendingOtps.get(email);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    pendingOtps.delete(email);
    return false;
  }
  if (record.code !== code) {
    record.attempts = (record.attempts || 0) + 1;
    if (record.attempts >= 5) {
      pendingOtps.delete(email);
    }
    return false;
  }
  pendingOtps.delete(email);
  return true;
}

function normalizeMobile(mobile = '') {
  // Remove all non-digit characters except +
  let cleaned = String(mobile).trim();
  // If it doesn't start with +, assume it's a local number and might need country code
  // For now, just clean it and return
  return cleaned.replace(/[^\d+]/g, '');
}

// For mobile OTP, we'll use Twilio Verify API which handles OTP generation and verification
// So we don't need to store OTPs locally, but we can track verification sessions
const pendingMobileVerifications = new Map(); // mobile -> { verificationSid, expiresAt }

function createOtpForMobile(rawMobile) {
  const mobile = normalizeMobile(rawMobile);
  if (!mobile || mobile.length < 8) {
    throw new Error('Invalid mobile number for OTP generation');
  }
  // With Twilio Verify, we don't generate the code here
  // This function is kept for compatibility but the actual OTP is handled by Twilio
  const expiresAt = Date.now() + OTP_TTL_MS;
  return { mobile, expiresAt };
}

function verifyOtpForMobile(rawMobile, submittedCode) {
  // With Twilio Verify API, verification is done via API call, not locally
  // This function is kept for compatibility but actual verification happens in the endpoint
  const mobile = normalizeMobile(rawMobile);
  const code = String(submittedCode || '').trim();
  if (!mobile || code.length === 0) return false;
  // Actual verification will be done via Twilio API in the endpoint
  return false; // Always return false here, real verification in endpoint
}

function getAnalyticsSummary() {
  const analytics = getAnalytics();
  const users = getAllUsers();
  
  // Unique users who logged in
  const uniqueLoggedInUsers = new Set(analytics.logins.map(l => l.userId)).size;
  
  // Total logins
  const totalLogins = analytics.logins.length;
  
  // Applications by job
  const applicationsByJob = {};
  analytics.applications.forEach(app => {
    if (!applicationsByJob[app.jobId]) {
      applicationsByJob[app.jobId] = {
        jobId: app.jobId,
        jobTitle: app.jobTitle,
        company: app.company,
        count: 0,
        users: []
      };
    }
    applicationsByJob[app.jobId].count++;
    if (!applicationsByJob[app.jobId].users.includes(app.userId)) {
      applicationsByJob[app.jobId].users.push(app.userId);
    }
  });
  
  // User application history
  const userApplications = {};
  analytics.applications.forEach(app => {
    if (!userApplications[app.userId]) {
      userApplications[app.userId] = {
        userId: app.userId,
        email: app.email,
        applications: []
      };
    }
    userApplications[app.userId].applications.push({
      jobId: app.jobId,
      jobTitle: app.jobTitle,
      company: app.company,
      timestamp: app.timestamp
    });
  });
  
  // Recent logins (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentLogins = analytics.logins.filter(l => new Date(l.timestamp) >= thirtyDaysAgo);
  
  // Recent applications (last 30 days)
  const recentApplications = analytics.applications.filter(a => new Date(a.timestamp) >= thirtyDaysAgo);
  
  return {
    totalUsers: users.filter(u => u.role === 'user').length,
    uniqueLoggedInUsers,
    totalLogins,
    recentLogins: recentLogins.length,
    totalApplications: analytics.applications.length,
    recentApplications: recentApplications.length,
    applicationsByJob: Object.values(applicationsByJob).sort((a, b) => b.count - a.count),
    userApplications: Object.values(userApplications),
    loginHistory: analytics.logins.slice(-100).reverse(), // Last 100 logins
    applicationHistory: analytics.applications.slice(-100).reverse() // Last 100 applications
  };
}

module.exports = { 
  getUserByEmail,
  getUserByMobile,
  getAllUsers,
  createUser, 
  ensureAdmin,
  trackLogin,
  trackApplication,
  trackPageView,
  getAnalyticsSummary,
  createOtpForEmail,
  verifyOtpForEmail,
  normalizeMobile,
  createOtpForMobile,
  verifyOtpForMobile,
};

