require('express-async-errors');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');
const config = require('./server/config');
const { globalLimiter } = require('./server/middleware/rateLimit');
const { csrfMiddleware } = require('./server/middleware/csrf');
const { initDb } = require('./server/db');

const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Gzip compression — speeds up all responses
app.use(compression());

// Health check
app.get('/health', async (req, res) => {
  try {
    const { query } = require('./server/db');
    await query('SELECT 1');
    res.json({ status: 'ok', uptime: process.uptime() });
  } catch (e) {
    res.json({ status: 'ok', uptime: process.uptime(), db: 'error' });
  }
});
app.use(express.static(path.join(__dirname, 'public'), {
  index: 'index.html',
  maxAge: '1d',
}));

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  hsts: config.nodeEnv === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// CORS — allow all origins (Cloudflare handles this)
app.use(cors({
  origin: true,
  credentials: true,
}));

// Global rate limiter
app.use(globalLimiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CSRF protection — only for page forms, skip API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  csrfMiddleware(req, res, next);
});

// API routes
app.use('/api/auth', require('./server/routes/auth'));
app.use('/api/invitations', require('./server/routes/invitations'));
app.use('/api/respond', require('./server/routes/responses'));
app.use('/api/admin', require('./server/routes/admin'));

// SPA fallback for routes that aren't static files
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Эндпоинт не найден' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Ошибка сервера' });
});

// Start server
initDb().then(() => {
  app.listen(config.port, () => {
    console.log(`Love Constructor running on http://localhost:${config.port}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
