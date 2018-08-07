const Kallisto = (function() {
  kPhrases = {
    nameStartCity: [`Пусть первым городом будет `],
    encouraging: [
      `Хорошо. А Вы знали, что победит тот, кто наберёт бо́льшее количество очков?`,
      `Замечательно`,
      `Моя очередь`,
      `Вы отлично справляетесь`,
      `Уверена, что вы победите`,
      `Принято`,
      `Я могу играть почти бесконечно`,
      `Пусть победит сильнейший`,
      `Я бы с удовольствием побродила по улицам этого города`,
      `Вы наверняка были в этом городе`
    ],
    nameCities: [
      `Название следующего города`,
      `Следующий город`,
      `Пусть будет`,
      `Итак, называю город`,
      `В названии следующего города есть что-то магическое. Только вслушайтесь в это слово`,
      `Моё имя могло бы быть названием следующего города, но его пожелали назвать`
    ],
    fails: {
      emptyString: 'Пожалуйста, введите название города',
      noCityName: 'Такого города не существует или я о нём просто не знаю',
      repeateCity: 'Мы уже называли этот город',
      wrongLetter: 'Название города должно начинаться на букву'
    },
    wins: `Поздравляю! Вы победили непобедимую меня`
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
