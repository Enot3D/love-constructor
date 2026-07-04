const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const config = require('./server/config');
const { globalLimiter } = require('./server/middleware/rateLimit');
const { csrfMiddleware } = require('./server/middleware/csrf');

const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,  // We serve inline scripts
  crossOriginEmbedderPolicy: false,
  hsts: config.nodeEnv === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// CORS
app.use(cors({
  origin: config.siteUrl,
  credentials: true,
}));

// Global rate limiter
app.use(globalLimiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CSRF protection (after cookie parser)
app.use(csrfMiddleware);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// API routes
app.use('/api/auth', require('./server/routes/auth'));
app.use('/api/invitations', require('./server/routes/invitations'));
app.use('/api/respond', require('./server/routes/responses'));

// SPA fallback — serve index.html for non-API, non-file routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Эндпоинт не найден' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const message = config.nodeEnv === 'production' ? 'Ошибка сервера' : err.message;
  res.status(500).json({ error: message });
});

// Start server
app.listen(config.port, () => {
  console.log(`Love Constructor running on http://localhost:${config.port}`);
});
