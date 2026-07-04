require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  siteUrl: process.env.SITE_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',

  vk: {
    appID: process.env.VK_APP_ID || '',
    appSecret: process.env.VK_APP_SECRET || '',
    callbackURL: process.env.VK_CALLBACK_URL || 'http://localhost:3000/api/auth/vk/callback',
  },

  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  },
};
