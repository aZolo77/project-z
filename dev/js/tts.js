// === Синтезатор речи ===
$(function() {
  // == объект User
  const user = {
    name: 'Незнакомец',
    setName: function(val) {
      this.name = val;
    }
  };

  // == создаём новый объект для синтеза речи
  let zSyn = window.speechSynthesis;
  console.log(zSyn);

  // == инициализируем html-объекты
  var inputForm = document.querySelector('form');
  var inputTxt = document.querySelector('.txt');
  var voiceSelect = document.getElementById('voiceSelector');

  // == ждём загрузки объекта языков
  const awaitVoices = new Promise(res => (zSyn.onvoiceschanged = res));
  var voices = [];

  function listVoices() {
    awaitVoices.then(() => {
      voices = zSyn.getVoices();
      // console.dir(voices);

      // == добавляем опции для выбора языка в DOM
      for (let i = 0; i < voices.length; i++) {
        let option = document.createElement('option');
        option.textContent = `${voices[i].name} (${voices[i].lang})`;

        if (voices[i].default) {
          option.textContent += ' -- DEFAULT';
        }

        option.setAttribute('data-lang', voices[i].lang);
        option.setAttribute('data-name', voices[i].name);
        voiceSelect.appendChild(option);
      }
    });
  }

  // === инициализируем объект выбора языка
  listVoices();

  // === изменение настроек звука
  $('[type="range"]').change(function() {
    let val = $(this).val();
    let id = $(this).attr('id');
    $('[for="' + id + '"]')
      .find('span')
      .text(val);
  });

  // == создаём событие на отправку фразы (выбор языка)
  inputForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    // = значения настроек
    // скорость воспроизведения
    let rate = $('#rate').val();
    // высота звука
    let pitch = $('#pitch').val();
    // громкость
    let volume = $('#volume').val();

    // console.log(`rate: ${rate}, pitch:: ${pitch}, volume: ${volume}`);

    // == новый объект фразы
    let utterThis = new SpeechSynthesisUtterance(inputTxt.value);

    let selectedOption = voiceSelect.selectedOptions[0].getAttribute(
      'data-name'
    );

    // console.log(utterThis);
    for (let i = 0; i < voices.length; i++) {
      if (voices[i].name === selectedOption) {
        // == добавляем созданной фразе свойство-обработчик языка
        utterThis.voice = voices[i];
      }
    }

    // = устанавливаем настройки звука
    utterThis.rate = rate;
    utterThis.pitch = pitch;
    utterThis.volume = volume;

    // == проверяем, ввёл ли хомяк текст
    if (!utterThis.text) {
      utterThis.text = 'Введите фразу';
      utterThis.voice = voices[15]; // = русский
    }

    // == воспроизведение синтезированной из текста фразы
    zSyn.speak(utterThis);
  });

  // == начинаем интерактивный диалог
  document.getElementById('dialogBtn').addEventListener('click', nameYourself);

  // == анимация для раскрытия диалогового блока
  function showDialogBlock(dialog) {
    // = Get Default Height
    let curHeight = dialog.height(),
      // = Get Auto Height
      autoHeight = dialog.css('height', 'auto').height();
    // = Reset to Default Height
    dialog.height(curHeight);
    dialog.stop().animate(
      {
        height: autoHeight + 30,
        opacity: 1
      },
      500
    );
    dialog.css('box-shadow', '0 0 5px #eaeaea');
  }

  // == анимация при удаление элементов из диалогового блока
  function clearElement(el) {
    $(el).animate({ opacity: 0, height: 0 }, 1000, function() {
      $(this)
        .html('')
        .css('box-shadow', 'none');
    });
  }

  // == воспроизведение любой фразы
  function ttsOut(obj, next) {
    // объект фразы
    // console.dir(obj);
    for (let i in obj) {
      let utterThis = new SpeechSynthesisUtterance(obj[i]);
      utterThis.voice = voices[15];
      zSyn.speak(utterThis);
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
          if (zSyn.speaking != false) {
            loops();
          } else {
            return res('ok');
          }
        }, 250);
      })();
    });
  }

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
    showDialogBlock(dialogHolder);

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
      user.setName(nameHandlerInfo.name);
      gameFuncs.getUserName(nameHandlerInfo.name);
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
    clearElement($('.dialog_holder'));

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
    showDialogBlock(holder);

    document
      .querySelector('.agreement_box')
      .addEventListener('click', getAgreement);
  }

  // == получить согласие/отказ на игру
  function getAgreement(event) {
    let btn = $(event.target);

    if (btn.hasClass('positive_answer')) {
      let phrase = {
        1: `Я очень рада ${user.name}.`,
        2: `Игра называется "Города́".`
      };
      ttsOut(phrase, { func: gameFuncs.city.startGame });
    }

    if (btn.hasClass('negative_answer')) {
      let phrase = {
        1: `Мне крайне жаль ${user.name}.`,
        2: `До встречи!`
      };
      ttsOut(phrase);
    }

    document
      .querySelector('.agreement_box')
      .removeEventListener('click', getAgreement);
    clearElement($('.dialog_holder'));
  }
});
