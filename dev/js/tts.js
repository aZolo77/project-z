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
  const zSyn = window.speechSynthesis;
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

  listVoices();

  // === при изменении настроек звука
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

  // == вызов других функций
  function talkToMe(obj) {
    let counter = 0;

    return function() {
      if (counter === 0) {
        nameYourself();
      }
      counter++;
    };
  }

  function clearElement(el) {
    $(el).animate({ opacity: 0, height: 0 }, 1000, function() {
      $(this)
        .html('')
        .css('box-shadow', 'none');
    });
  }

  // == получаем имя пользователя
  function nameYourself() {
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

    // = Get Default Height
    let curHeight = dialogHolder.height(),
      // = Get Auto Height
      autoHeight = dialogHolder.css('height', 'auto').height();
    // = Reset to Default Height
    dialogHolder.height(curHeight);
    dialogHolder.stop().animate(
      {
        height: autoHeight + 30
      },
      500
    );
    dialogHolder.css('box-shadow', '0 0 5px #eaeaea');
    // добавляем обработчик по кнопке
    document.getElementById('catchInfo').addEventListener('click', sayHi);
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

    // устанавливаем имя для хомячка
    if (nameHandlerInfo.name) {
      user.setName(nameHandlerInfo.name);
    }

    // воспроизводим приветстие хомячка
    let utterThis = new SpeechSynthesisUtterance(nameHandlerInfo.greeting());
    utterThis.voice = voices[15];
    // zSyn.speaking == true
    // === отслеживаем объект
    zSyn.speak(utterThis);
    // предложение сыграть в города
    kalistoIntro()
      .then(function() {
        let utterThis = new SpeechSynthesisUtterance('Давайте сыграем в игру');
        utterThis.voice = voices[15];
        zSyn.speak(utterThis);
      })
      .then(function(res) {
        showConfirmDialog();
      })
      .catch(function(err) {
        console.log(err);
      });
    // снимаем обработчик с кнопки
    document.getElementById('catchInfo').removeEventListener('click', sayHi);
  }

  // Каллисто представляется
  function kalistoIntro() {
    let utterThis = new SpeechSynthesisUtterance('Меня зовут Каллисто.');
    utterThis.voice = voices[15];
    zSyn.speak(utterThis);

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
    // = Get Default Height
    let curHeight = holder.height(),
      // = Get Auto Height
      autoHeight = holder.css('height', 'auto').height();
    // = Reset to Default Height
    holder.height(curHeight);
    holder.stop().animate(
      {
        opacity: 1,
        height: autoHeight + 30
      },
      500
    );
    holder.css('box-shadow', '0 0 5px #eaeaea');

    document
      .querySelector('.agreement_box')
      .addEventListener('click', getAgreement);
  }

  // получить согласие на игру
  function getAgreement(event) {
    let btn = $(event.target);
    if (btn.hasClass('positive_answer')) {
      let utterThis = new SpeechSynthesisUtterance(
        `Я очень рада ${user.name}. Игра называется "Города́".`
      );
      utterThis.voice = voices[15];
      zSyn.speak(utterThis);
    }
    if (btn.hasClass('negative_answer')) {
      let utterThis = new SpeechSynthesisUtterance(
        `Мне крайне жаль ${user.name}. До встречи!`
      );
      utterThis.voice = voices[15];
      zSyn.speak(utterThis);
    }
    clearElement($('.dialog_holder'));
  }

  // == начинаем интерактивный диалог
  $('#dialogBtn').click(talkToMe());
});
