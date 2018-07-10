// === text to spaeech script ===
const express = require('express');
const router = express.Router();

// === функция обработчик ===

router.get('/tts', (req, res, next) => {
  res.render('tts/tts');
});

module.exports = router;
