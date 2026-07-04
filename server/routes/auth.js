const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { authLimiter } = require('../middleware/rateLimit');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Register with email + password
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Заполните все поля' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль минимум 6 символов' });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email уже зарегистрирован' });
    }

    const user = await User.create({ email, password, displayName });

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '30d' });
    res.cookie('token', token, config.cookie);

    res.json({ user: { id: user.id, email: user.email, displayName: user.display_name } });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: 'Ошибка сервера: ' + (e.message || e.toString()) });
  }
});

// Login with email + password
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Заполните все поля' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const valid = await User.verifyPassword(user, password);
    if (!valid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    await User.updateLastLogin(user.id);

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '30d' });
    res.cookie('token', token, config.cookie);

    res.json({ user: { id: user.id, email: user.email, displayName: user.display_name } });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// VK OAuth — redirect to VK
router.get('/vk', (req, res) => {
  if (!config.vk.appID) {
    return res.status(400).json({ error: 'VK OAuth не настроен' });
  }
  const vkUrl = `https://oauth.vk.com/authorize?client_id=${config.vk.appID}&display=page&redirect_uri=${encodeURIComponent(config.vk.callbackURL)}&scope=email&response_type=code&v=5.131`;
  res.redirect(vkUrl);
});

// VK OAuth callback
router.get('/vk/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect('/login?error=vk_denied');
    }

    // Exchange code for access token
    const tokenUrl = `https://oauth.vk.com/access_token?client_id=${config.vk.appID}&client_secret=${config.vk.appSecret}&redirect_uri=${encodeURIComponent(config.vk.callbackURL)}&code=${code}`;
    const tokenResp = await fetch(tokenUrl);
    const tokenData = await tokenResp.json();

    if (tokenData.error || !tokenData.access_token) {
      return res.redirect('/login?error=vk_failed');
    }

    // Get user info from VK
    const userUrl = `https://api.vk.com/method/users.get?user_ids=${tokenData.user_id}&fields=photo_100&access_token=${tokenData.access_token}&v=5.131`;
    const userResp = await fetch(userUrl);
    const userData = await userResp.json();

    if (!userData.response || !userData.response.length) {
      return res.redirect('/login?error=vk_failed');
    }

    const vkUser = userData.response[0];
    const vkId = String(vkUser.id);

    // Find or create user
    let user = await User.findByVkId(vkId);
    if (!user) {
      // Check if email from VK is linked to existing account
      const email = tokenData.email;
      if (email) {
        user = await User.findByEmail(email);
      }

      if (user) {
        // Link VK to existing account
        const { query } = require('../db');
        await query(`UPDATE users SET vk_id = $1 WHERE id = $2`, [vkId, user.id]);
      } else {
        // Create new user
        user = await User.create({
          vkId,
          displayName: `${vkUser.first_name} ${vkUser.last_name}`,
          avatarUrl: vkUser.photo_100,
          email: tokenData.email || null,
        });
      }
    }

    await User.updateLastLogin(user.id);

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '30d' });
    res.cookie('token', token, config.cookie);

    res.redirect('/dashboard');
  } catch (e) {
    console.error('VK OAuth error:', e);
    res.redirect('/login?error=server');
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAsync(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      hasVk: !!user.vk_id,
    });
  } catch (e) {
    console.error('Get me error:', e);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
