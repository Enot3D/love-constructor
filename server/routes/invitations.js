const express = require('express');
const config = require('../config');
const Invitation = require('../models/Invitation');
const Response = require('../models/Response');
const { authMiddleware } = require('../middleware/auth');
const { publishLimiter } = require('../middleware/rateLimit');

const router = express.Router();

function generateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Publish a new invitation (auth required)
router.post('/', authMiddleware, publishLimiter, async (req, res) => {
  try {
    const { html, title, girlName } = req.body;
    if (!html || typeof html !== 'string') {
      return res.status(400).json({ error: 'HTML обязателен' });
    }

    // Validate and sanitize
    const cleanTitle = title ? String(title).replace(/<[^>]*>/g, '').slice(0, 200) : 'Приглашение';
    const cleanGirlName = girlName ? String(girlName).replace(/<[^>]*>/g, '').slice(0, 100) : null;

    const id = generateId();
    const senderToken = generateId() + generateId();

    await Invitation.create({
      id,
      userId: req.userId,
      title: cleanTitle,
      girlName: cleanGirlName,
      html,
      senderToken,
    });

    const inviteLink = `${config.siteUrl}/view.html?id=${id}`;
    const trackerLink = `${config.siteUrl}/track.html?id=${id}&token=${senderToken}`;

    res.json({ id, inviteLink, trackerLink, senderToken });
  } catch (e) {
    console.error('Publish error:', e);
    res.status(500).json({ error: 'Ошибка публикации' });
  }
});

// List user's invitations (auth required)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const invitations = await Invitation.findByUserId(req.userId);

    // Add response stats to each invitation
    const withStats = await Promise.all(
      invitations.map(async (inv) => {
        const stats = await Invitation.getResponseStats(inv.id);
        return { ...inv, stats };
      })
    );

    res.json(withStats);
  } catch (e) {
    console.error('List invitations error:', e);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Get invitation details (auth required, must own)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const inv = await Invitation.findById(req.params.id);
    if (!inv || inv.user_id !== req.userId) {
      return res.status(404).json({ error: 'Приглашение не найдено' });
    }
    const responses = await Response.findByInvitationId(inv.id);
    const stats = await Invitation.getResponseStats(inv.id);
    res.json({ ...inv, responses, stats });
  } catch (e) {
    console.error('Get invitation error:', e);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Delete invitation (soft delete, auth required)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Invitation.delete(req.params.id, req.userId);
    res.json({ ok: true });
  } catch (e) {
    console.error('Delete invitation error:', e);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Delete a specific response (auth required, must own invitation)
router.delete('/:id/responses/:responseId', authMiddleware, async (req, res) => {
  try {
    const inv = await Invitation.findById(req.params.id);
    if (!inv || inv.user_id !== req.userId) {
      return res.status(404).json({ error: 'Приглашение не найдено' });
    }

    const response = await Response.findById(req.params.responseId);
    if (!response || response.invitation_id !== req.params.id) {
      return res.status(404).json({ error: 'Ответ не найден' });
    }

    await Response.deleteById(req.params.responseId);
    res.json({ ok: true });
  } catch (e) {
    console.error('Delete response error:', e);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Update a specific response (auth required, must own invitation)
router.put('/:id/responses/:responseId', authMiddleware, async (req, res) => {
  try {
    const inv = await Invitation.findById(req.params.id);
    if (!inv || inv.user_id !== req.userId) {
      return res.status(404).json({ error: 'Приглашение не найдено' });
    }

    const response = await Response.findById(req.params.responseId);
    if (!response || response.invitation_id !== req.params.id) {
      return res.status(404).json({ error: 'Ответ не найден' });
    }

    const { clickedYes, selectedDate, feedbackText } = req.body;

    // Validate selectedDate format if provided
    if (selectedDate !== undefined && selectedDate !== null && selectedDate !== '') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
        return res.status(400).json({ error: 'Неверный формат даты' });
      }
    }

    // Validate feedbackText length
    if (feedbackText !== undefined && feedbackText.length > 1000) {
      return res.status(400).json({ error: 'Текст слишком длинный (макс. 1000 символов)' });
    }

    await Response.update(req.params.responseId, { clickedYes, selectedDate, feedbackText });
    res.json({ ok: true });
  } catch (e) {
    console.error('Update response error:', e);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Get public invitation HTML (no auth needed — for view.html)
router.get('/:id/public', async (req, res) => {
  try {
    const inv = await Invitation.findById(req.params.id);
    if (!inv || !inv.is_active) {
      return res.status(404).json({ error: 'Приглашение не найдено' });
    }
    res.json({ html: inv.html, title: inv.title });
  } catch (e) {
    console.error('Get public invitation error:', e);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Get responses for tracker (token auth, not JWT)
router.get('/:id/responses', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(401).json({ error: 'Токен обязателен' });
    }

    const inv = await Invitation.findById(req.params.id);
    if (!inv || inv.sender_token !== token) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const responses = await Response.findByInvitationId(inv.id);
    const stats = await Invitation.getResponseStats(inv.id);
    res.json({ responses, stats, title: inv.title });
  } catch (e) {
    console.error('Get responses error:', e);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
