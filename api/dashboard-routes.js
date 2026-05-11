const express = require('express');
const router = express.Router();

router.get('/hermes-status', (req, res) => {
  res.json({
    success: true,
    status: 'offline',
    message: 'Agentul nu este încă instalat. Completează wizard-ul pentru a genera configurația.',
    uptime: 0,
    version: '1.0.0'
  });
});

router.get('/analytics', (req, res) => {
  res.json({
    success: true,
    data: {
      conversations: 0,
      messages: 0,
      channels: {},
      intents: [],
      daily: [],
      topQuestions: [],
      roi: 0
    },
    message: 'Nu există date încă. Analitica se va popula după deploy.'
  });
});

module.exports = router;
