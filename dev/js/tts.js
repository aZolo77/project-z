// === Синтезатор речи ===
$(function() {
  // == создаём новый объект для синтеза речи
  const zSyn = window.speechSynthesis;
  console.dir(zSyn);

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
      console.dir(voices);

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

    // воспроизводим приветстие хомячка
    let utterThis = new SpeechSynthesisUtterance(nameHandlerInfo.greeting());
    utterThis.voice = voices[15];
    // zSyn.speaking == true
    zSyn.speak(utterThis);
    kalistoIntro();
    // снимаем обработчик с кнопки
    document.getElementById('catchInfo').removeEventListener('click', sayHi);
  }

  // Каллисто представляется
  function kalistoIntro() {
    let utterThis = new SpeechSynthesisUtterance('Меня зовут Каллисто');
    utterThis.voice = voices[15];
    zSyn.speak(utterThis);

    // == очистить элемент
    clearElement($('.dialog_holder'));
  }

  // == начинаем интерактивный диалог
  $('#dialogBtn').click(talkToMe());
});
