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
        for (let i = 0; i < self.voices.length; i++) {
          if (self.voices[i].name === selectedOption) {
            // == добавляем созданной фразе свойство-обработчик языка
            utterThis.voice = self.voices[i];
          }
        }
        // = устанавливаем настройки звука
        utterThis.rate = rate;
        utterThis.pitch = pitch;
        utterThis.volume = volume;

        // == проверяем, ввёл ли хомяк текст
        if (!utterThis.text) {
          utterThis.text = 'Введите фразу';
          utterThis.voice = self.voices[15]; // = русский
        }

        // == воспроизведение синтезированной из текста фразы
        tts.zSyn.speak(utterThis);
      });
    }
  };

  const tts = {
    zSyn: window.speechSynthesis,
    voices: [],
    awaitVoices: function() {
      return new Promise(res => (tts.zSyn.onvoiceschanged = res));
    },
    // == ждём загрузки объекта языков
    listVoices: function() {
      awaitVoices.then(function(data) {
        voices = tts.zSyn.getVoices();
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
          testPanel.voiceSelect.appendChild(option);
        }
      });
    }
  };

  return { tts, testPanel };
})();
