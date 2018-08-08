// === Синтезатор речи [Настройки] + Тестовая панель ===
const ttsConfig = (function() {
  const awaitVoices = new Promise(
    res => (window.speechSynthesis.onvoiceschanged = res)
  );

  // панель для настроек звука
  const testPanel = {
    inputForm: null,
    inputTxt: null,
    voiceSelect: null,
    voices: [],
    rangeChange: function() {
      // === изменение настроек звука
      $('[type="range"]').change(function() {
        let val = $(this).val();
        let id = $(this).attr('id');
        $('[for="' + id + '"]')
          .find('span')
          .text(val);
      });
    },
    defineElements: function() {
      this.inputForm = document.querySelector('form');
      this.inputTxt = document.querySelector('.txt');
      this.voiceSelect = document.getElementById('voiceSelector');
    },
    definePhraseSubmition: function() {
      let self = this;
      this.inputForm.addEventListener('submit', function(evt) {
        evt.preventDefault();

        // = значения настроек
        // скорость воспроизведения
        let rate = $('#rate').val();
        // высота звука
        let pitch = $('#pitch').val();
        // громкость
        let volume = $('#volume').val();
        // == новый объект фразы
        let utterThis = new SpeechSynthesisUtterance(self.inputTxt.value);
        // == выбраная опция языка
        let selectedOption = self.voiceSelect.selectedOptions[0].getAttribute(
          'data-name'
        );
        // = устанавливаем настройки звука
        utterThis.rate = rate;
        utterThis.pitch = pitch;
        utterThis.volume = volume;

        // == проверяем, ввёл ли хомяк текст
        if (!utterThis.text) {
          utterThis.text = 'Введите фразу';
          utterThis.lang = 'ru-RU'; // = русский
          // utterThis.voice = self.voices[15];
        } else {
          for (let i = 0; i < self.voices.length; i++) {
            if (self.voices[i].name === selectedOption) {
              // == добавляем созданной фразе свойство-обработчик языка
              utterThis.voice = self.voices[i];
            }
          }
        }

        // == воспроизведение синтезированной из текста фразы
        tts.zSyn.speak(utterThis);
      });
    }
  };

  const tts = {
    // = объект с русским голосом
    // rusVoice: responsiveVoice.getResponsiveVoice('Russian Female'),
    zSyn: window.speechSynthesis,
    voices: [],
    // == завершение audio
    audioEnd: function() {
      let self = this;
      return new Promise(function(res, rej) {
        (function loops() {
          setTimeout(function() {
            if (self.zSyn.speaking != false) {
              loops();
            } else {
              return res('ok');
            }
          }, 250);
        })();
      });
    },
    // == произнести новую фразу
    speak: function(obj) {
      let utterThis = new SpeechSynthesisUtterance(obj);
      utterThis.rate = 1.1;
      utterThis.pitch = 0.9;
      utterThis.lang = 'ru-RU';
      this.voices.filter(function(item) {
        if (item.lang.search(/ru/) != -1) {
          utterThis.voice = item;
        }
      });
      this.zSyn.speak(utterThis);
    },
    // == воспроизведение любой фразы
    ttsOut: function(obj, next) {
      // = объект фразы
      for (let i in obj) {
        this.speak(obj[i]);
      }
      // = если передана функция - выполняем её после аудиовоспроизведения
      if (next) {
        this.audioEnd().then(function(res) {
          // == если передаётся свойство "Начать игру", привязываем объект соответствующей игры
          if (next.game) {
            // = привязываем объект игры {city}
            let gameStart = next.func.bind(gameFuncs.city);
            gameStart();
          } else {
            next.func();
          }
        });
      }
    },
    // == загрузить список языков
    awaitVoices: function() {
      let self = this;
      return new Promise(res => (self.zSyn.onvoiceschanged = res));
    },
    // == ждём загрузки объекта языков
    listVoices: function() {
      let self = this;
      awaitVoices.then(function(data) {
        voices = tts.zSyn.getVoices();
        self.voices = voices;
        testPanel.voices = voices;

        // == добавляем опции для выбора языка в DOM
        for (let i = 0; i < voices.length; i++) {
          let option = document.createElement('option');
          option.textContent = `${voices[i].name} (${voices[i].lang})`;

          if (voices[i].default) {
            option.textContent += ' -- DEFAULT';
          }

          option.setAttribute('data-lang', voices[i].lang);
          option.setAttribute('data-name', voices[i].name);
          // testPanel.voiceSelect.appendChild(option);
        }
      });
    }
  };

  return { tts, testPanel };
})();
