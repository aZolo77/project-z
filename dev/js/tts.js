// === [Точка входа] + [диалог с Kallisto] ===
// == ждёт загрузки страницы
$(function() {
  // gameFuncs.city.startGame();
  const KallistoDialog = {
    name: 'Kallisto',
    // == html-объекты
    treeObjs: {},
    // == установить html-объекты
    getTree: function() {
      let dialogHolder = $('.dialog_holder');
      this.treeObjs.dialogHolder = dialogHolder;
      let dialogStartBtn = document.getElementById('dialogBtn');
      this.treeObjs.dialogStartBtn = dialogStartBtn;
    },
    // == привязка событий к html-объектам
    bindEvents: function() {
      let self = this;
      // = начинает интерактивный диалог
      this.treeObjs.dialogStartBtn.addEventListener(
        'click',
        self.nameYourself.bind(self)
      );
    },
    // == получить имя гостя
    nameYourself: function() {
      let self = this;
      // снимаем обработчик с основной кнопки
      this.treeObjs.dialogStartBtn.removeEventListener(
        'click',
        self.nameYourself
      );
      this.treeObjs.dialogHolder.html(
        `<div class="name_holder">
        <div class="dialog_heading text-center mb-2">Введите Ваше имя и нажмите "Подтвердить"</div>
          <input type="text" class="form-control text-center" id="userName">
          <center class="mt-3">
            <button class="btn btn-success" id="catchInfo">Подтвердить</button>
          </center>
        </div>`
      );

      // == анимация для раскрытия диалогового блока
      generalFuncs.showDialogBlock(this.treeObjs.dialogHolder);

      // == добавляем обработчик по кнопке и снимаем с Initial
      document
        .getElementById('catchInfo')
        .addEventListener('click', self.sayHi.bind(self));
    },
    // == приветствие гостя
    sayHi: function() {
      let self = this;
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

      // = устанавливаем имя для гостя
      if (nameHandlerInfo.name) {
        userData.user.setName(nameHandlerInfo.name);
      }

      // = воспроизводим приветстие гостя
      let phrase = { 1: nameHandlerInfo.greeting() };
      ttsConfig.tts.ttsOut(phrase);

      // = предложение сыграть в города
      this.kalistoIntro();

      // = снимаем обработчик с кнопки
      catchInfo.removeEventListener('click', self.sayHi);
    },
    // == Каллисто представляется
    kalistoIntro: function() {
      let self = this;
      // == очистить диалоговое окно
      generalFuncs.clearElement(self.treeObjs.dialogHolder);
      // = предложение сыграть
      let phrase = {
        1: `Меня зовут ${this.name}`,
        2: 'Давайте сыграем в игру'
      };
      ttsConfig.tts.ttsOut(phrase, { func: self.showConfirmDialog.bind(self) });
    },
    // == показать диалог для получения согласия
    showConfirmDialog: function() {
      let self = this;
      let content = `<div class="agreement_box text-center">
                        <button class="btn btn-success positive_answer btn-lg mr-3">Yes</button>
                        <button class="btn btn-secondary negative_answer btn-lg">No</button>
                    </div>`;
      this.treeObjs.dialogHolder.html(content);

      // == анимация для раскрытия диалогового блока
      generalFuncs.showDialogBlock(this.treeObjs.dialogHolder);

      document
        .querySelector('.agreement_box')
        .addEventListener('click', self.getAgreement.bind(self));
    },
    // == получить согласие/отказ играть
    getAgreement: function(event) {
      let btn = $(event.target);

      if (btn.hasClass('positive_answer')) {
        let phrase = {
          1: `Я очень рада ${userData.user.name}.`,
          2: `Игра называется "Города́".`
        };
        ttsConfig.tts.ttsOut(phrase, {
          func: gameFuncs.city.startGame,
          game: true
        });
      }

      if (btn.hasClass('negative_answer')) {
        let phrase = {
          1: `Мне крайне жаль ${userData.user.name}.`,
          2: `До встречи!`
        };
        ttsConfig.tts.ttsOut(phrase);
      }

      generalFuncs.clearElement($('.dialog_holder'));
    }
  };

  // == установка html-объектов
  KallistoDialog.getTree();
  // == привязка начального события
  KallistoDialog.bindEvents();

  // gameFuncs.city.startGame(); // [чтобы сразу начать игру "Cities"]
  ttsConfig.testPanel.defineElements();
  ttsConfig.testPanel.definePhraseSubmition();
  ttsConfig.testPanel.rangeChange();
  // = так можно достать массив языков: [window.speechSynthesis.getVoices()]
  ttsConfig.tts.listVoices();
});
