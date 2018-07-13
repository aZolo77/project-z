// === text to spaeech script ===
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// == файл с городами ==
const cityDir = path.resolve(__dirname, '../../public/json/city.json');
const citiesFile = require(cityDir);

// === функция обработчик ===
router.get('/tts', async (req, res, next) => {
  res.render('tts/tts');
});

// === отдаём список городов ===
router.get('/cities', async (req, res) => {
  if (citiesFile) {
    res.json({
      ok: true,
      cityObj: citiesFile
    });
  } else {
    res.json({
      ok: false
    });
  }
});

module.exports = router;
