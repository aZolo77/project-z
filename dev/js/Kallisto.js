const Kallisto = (function() {
  kPhrases = {
    encouraging: [
      `Замечательно`,
      `Моя очередь`,
      `Вы отлично справляетесь`,
      `Уверена, что вы победите`,
      `Принято`,
      `Я могу играть почти бесконечно`,
      `Пусть победит сильнейший`
    ],
    nameCities: [
      `Название следующего города `,
      `Следующий город `,
      `Пусть будет `,
      `Итак, называю город `,
      `В названии этого города есть что-то магическое. Только вслушайтесь в это слово `,
      `Моё имя могло бы быть названием этого города, но его пожелали назвать `,
      `На последнюю букву вашего последнего города начинается `
    ],
    nameStartCity: [`Пусть первым городом будет `]
  };

  function speaks(phraseObj, next) {
    if (next) {
      ttsConfig.tts.ttsOut(phraseObj, { func: next });
    } else {
      ttsConfig.tts.ttsOut(phraseObj);
    }
  }

  return { kPhrases, speaks };
})();
