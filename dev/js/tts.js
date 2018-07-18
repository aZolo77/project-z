// === Синтезатор речи ===
$(function() {
  // gameFuncs.city.startGame();
  ttsConfig.testPanel.defineElements();
  ttsConfig.testPanel.definePhraseSubmition();
  ttsConfig.testPanel.rangeChange();
  ttsConfig.tts.listVoices();
  gameFuncs.city.startGame();

  // == воспроизведение любой фразы
  function ttsOut(obj, next) {
    // объект фразы
    for (let i in obj) {
      let utterThis = new SpeechSynthesisUtterance(obj[i]);
      utterThis.voice = ttsConfig.tts.voices[15];
      ttsConfig.tts.zSyn.speak(utterThis);
    }
    if (next) {
      audioEnd().then(function(res) {
        next.func();
      });
    }
  }

  // завершение audio
  function audioEnd() {
    return new Promise(function(res, rej) {
      (function loops() {
        setTimeout(function() {
          if (ttsConfig.tts.zSyn.speaking != false) {
            loops();
          } else {
            return res('ok');
          }
        }, 250);
      })();
    });
  }

  // == начинаем интерактивный диалог
  document.getElementById('dialogBtn').addEventListener('click', nameYourself);

  // == получаем имя пользователя
  function nameYourself() {
    // снимаем обработчик с первой кнопки
    dialogBtn.removeEventListener('click', nameYourself);
    let dialogHolder = $('.dialog_holder');
    dialogHolder.html(
      `<div class="name_holder">
      <div class="dialog_heading text-center mb-2">Введите Ваше имя и нажмите "Подтвердить"</div>
        <input type="text" class="form-control text-center" id="userName">
        <center class="mt-3">
          <button class="btn btn-success" id="catchInfo">Подтвердить</button>
        </center>
      </div>`
    );

    // == анимация для раскрытия диалогового блока
    generalFuncs.showDialogBlock(dialogHolder);

    // == добавляем обработчик по кнопке и снимаем с Initial
    catchInfo.addEventListener('click', sayHi);
  }

  // == приветствуем хомячка
  function sayHi() {
    // = объект для приветствия
    let nameHandlerInfo = {
      name: $('#userName').val(),
      greeting: function() {
        if (this.name) {
          return `Приятно познакомиться, ${this.name}`;
        } else {
          return `Привет незнакомец`;
        }
      }
    };

    // = устанавливаем имя для хомячка
    if (nameHandlerInfo.name) {
      userData.user.setName(nameHandlerInfo.name);
    }

    // = воспроизводим приветстие хомячка
    let phrase = { 1: nameHandlerInfo.greeting() };
    ttsOut(phrase);

    // = предложение сыграть в города
    kalistoIntro().then(function() {
      // = предложение сыграть
      let phrase = { 1: 'Давайте сыграем в игру' };
      ttsOut(phrase, { func: showConfirmDialog });
    });

    // = снимаем обработчик с кнопки
    catchInfo.removeEventListener('click', sayHi);
  }

  // == Каллисто представляется
  function kalistoIntro() {
    let phrase = { 1: 'Меня зовут Каллисто.' };
    ttsOut(phrase);

    // == очистить элемент
    generalFuncs.clearElement($('.dialog_holder'));

    let promiseQuestion = new Promise(function(res, rej) {
      setTimeout(function() {
        res();
      }, 4000);
    });
    return promiseQuestion;
  }

  // == показать диалог для получения согласия
  function showConfirmDialog() {
    let holder = $('.dialog_holder');
    let content = `<div class="agreement_box text-center">
                      <button class="btn btn-success positive_answer btn-lg mr-3">Yes</button>
                      <button class="btn btn-secondary negative_answer btn-lg">No</button>
                  </div>`;
    holder.html(content);

    // == анимация для раскрытия диалогового блока
    generalFuncs.showDialogBlock(holder);

    document
      .querySelector('.agreement_box')
      .addEventListener('click', getAgreement);
  }

  // == получить согласие/отказ на игру
  function getAgreement(event) {
    let btn = $(event.target);

    if (btn.hasClass('positive_answer')) {
      let phrase = {
        1: `Я очень рада ${userData.user.name}.`,
        2: `Игра называется "Города́".`
      };
      ttsOut(phrase, { func: gameFuncs.city.startGame });
    }

    if (btn.hasClass('negative_answer')) {
      let phrase = {
        1: `Мне крайне жаль ${userData.user.name}.`,
        2: `До встречи!`
      };
      ttsOut(phrase);
    }

    document
      .querySelector('.agreement_box')
      .removeEventListener('click', getAgreement);
    generalFuncs.clearElement($('.dialog_holder'));
  }
});
