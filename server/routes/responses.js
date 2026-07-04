const express = require('express');
const Invitation = require('../models/Invitation');
const Response = require('../models/Response');
const { respondLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Submit a response (public, no auth — from the invitation page)
router.post('/:invitationId', respondLimiter, async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { responseId, clickedYes, selectedDate, feedbackText } = req.body;

    // Verify invitation exists
    const inv = await Invitation.findById(invitationId);
    if (!inv || !inv.is_active) {
      return res.status(404).json({ error: 'Приглашение не найдено' });
    }

    // Validate responseId
    if (!responseId || typeof responseId !== 'string' || responseId.length > 32 || !/^[a-zA-Z0-9_-]+$/.test(responseId)) {
      return res.status(400).json({ error: 'Неверный responseId' });
    }

    // Validate selectedDate format if provided
    if (selectedDate !== undefined && selectedDate !== null && selectedDate !== '') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
        return res.status(400).json({ error: 'Неверный формат даты' });
      }
    }

    // Validate feedbackText length
    if (feedbackText !== undefined && feedbackText !== null && feedbackText.length > 1000) {
      return res.status(400).json({ error: 'Текст слишком длинный (макс. 1000 символов)' });
    }

    // Check if response already exists (update) or create new
    const existing = await Response.findByInvitationId(invitationId);
    const found = existing.find(r => r.id === responseId);

    if (found) {
      await Response.update(responseId, { clickedYes, selectedDate, feedbackText });
    } else {
      await Response.create({
        id: responseId,
        invitationId,
        clickedYes: clickedYes || false,
        selectedDate,
        feedbackText,
      });
    }

    res.json({ ok: true });
  } catch (e) {
    console.error('Response error:', e);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
