const crypto = require('crypto');

// Generate a random CSRF token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Set CSRF token in cookie (readable by JS) and make it available via header
function csrfMiddleware(req, res, next) {
  // Only set token for safe methods
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    let token = req.cookies.csrf_token;
    if (!token) {
      token = generateToken();
      res.cookie('csrf_token', token, {
        httpOnly: false, // JS needs to read this
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
    }
    // Expose token via response header for AJAX
    res.setHeader('X-CSRF-Token', token);
    return next();
  }

  // Validate token for unsafe methods
  const cookieToken = req.cookies.csrf_token;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'CSRF токен невалиден' });
  }

  next();
}

module.exports = { csrfMiddleware };
