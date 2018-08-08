const gameFuncs = (function() {
  // === объект для игры "Города"
  const city = {
    initialArr: [],
    gameArr: [],
    // = раунд
    round: 1,
    // = имя игрока
    playerName: null,
    // = родительский объект для ввода названия города
    parentElement: null,
    // = родительский объект с названиями городов
    resTab: null,
    // == текущий город и максимальное кол-во букв + имя того, кто назвал самый длинный город
    currentCity: null,
    maxLettersInWord: 0,
    maxLengthWord: null,
    maxWordSpeaker: null,
    // == сравнить максимальное кол-во букв города с предыдущим значением(перезаписать результат)
    checkMaxCityLength: function(length, host) {
      if (length > this.maxLettersInWord) {
        this.maxLettersInWord = length;
        this.maxLengthWord = this.currentCity;
        cityName =
          this.maxLengthWord[0].toUpperCase() + this.maxLengthWord.slice(1);
        $('#maxWord').text(cityName);
        this.maxWordSpeaker = host;
        $('#maxWordHost').text(host);
      }
    },
    // = Последняя, предыдущая и запрещённые буквы
    currentLetter: null,
    previousLetter: null,
    forbiddenLetters: ['ё', 'ъ', 'ь', 'ы'],
    // = флаги {фильтры игры}
    permisions: {
      // = разрешение называть город на предыдущую букву
      previousLetter: false
    },
    // = количество подсказок и их использование
    hints: 3,
    useHint: function() {
      let hintItem = null;
      let eTarg = event.target;
      let eClass = eTarg.classList;
      // определяем элемент, по которому кликнули и передаём переменной нужное значение
      for (let prop in eClass) {
        if (eClass[prop] == 'active') {
          hintItem = eTarg;
        }
        if (eClass[prop] == 'fa-lightbulb') {
          let lightParent = eTarg.parentElement;
          if (lightParent.className.search(/active/) != -1) {
            hintItem = eTarg.parentElement;
          }
        }
      }
      // если нужный элемент найден и у него есть класс active - даём подсказку
      if (hintItem) {
        // ищем город
        let city = this.searchCityByLetter();
        if (city) {
          // = убираем 1 подсказку, меняем текст с кол-вом подсказок и удаляем класс у активной подсказки
          hintItem.classList.remove('active');
          this.hints -= 1;
          if (this.hints > 0) {
            $('.hints_quantity').html(this.hints);
            if (this.hints == 1) {
              $('.hints_adjusted_word').text('подсказка');
            }
          } else {
            $('.game_hints_heading').html('У Вас не осталось подсказок');
          }
          // = выводим название города-подсказки
          city = city[0].toUpperCase() + city.slice(1);
          $('.hint_word').text(city);
          $('.hint_word').show();
        } else {
          $('.hint_word').text('город не найден');
          $('.hint_word').show();
        }
      } else {
        return false;
      }
    },
    // = максимальный счёт и его установка
    maxScore: 100,
    increaseScore: function() {
      let self = this;
      self.maxScore += 100;
      $('#gameMaxScore').text(self.maxScore);
    },
    // == последний, кто назвал слово
    lastSpeaker: null,
    // = счёт игрока
    userScore: 0,
    userScoreHolder: null,
    // = счёт Каллисто
    kScore: 0,
    kScoreHolder: null,
    // == длины массивов фраз и текущий id массива
    kPhrasesStuff: {
      encouragingArrLength: Kallisto.kPhrases.encouraging.length - 1,
      encouragingId: 0,
      nameCitiesArrLength: Kallisto.kPhrases.nameCities.length - 1,
      nameCitiesId: 0
    },
    // == проверка на наличие запрещённых букв в конце последнего города
    check4LastLetter: function() {
      let self = this;
      let letter = null;
      this.forbiddenLetters.forEach(function(item) {
        if (self.currentLetter == item) {
          // console.log(`Запрещённая буква: '${item}'`);
          letter = item;
        }
      });
      if (letter) {
        return letter;
      } else {
        return false;
      }
    },
    // == показать диалог для получения согласия
    showConfirmDialog: function(options, func1, func2) {
      let self = this;
      let content = `<div class="agreement_box text-center">
                        <button class="btn btn-success positive_answer btn-lg mr-3 mb-2 mb-sm-0">${
                          options.yes
                        }</button>
                        <button class="btn btn-secondary negative_answer btn-lg mb-2 mb-sm-0">${
                          options.no
                        }</button>
                    </div>`;
      this.parentElement.html(content);

      // == анимация для раскрытия диалогового блока
      generalFuncs.showDialogBlock(this.parentElement);

      $('.positive_answer').click(func1);
      $('.negative_answer').click(func2.bind(self));
    },
    // == разрешение использовать предпоследнюю букву слова
    askToUsePreviouseLetter: function() {
      let self = this;
      console.log('Can I use previous letter, please');
      // = показать диалог для подтверждения [фразы, функция при согласии, функция при отказе]
      self.showConfirmDialog(
        { yes: 'Продолжить', no: 'Закончить' },
        function() {
          // = разрешить называть города на предыдущую букву
          console.log('Гость разрешает называть города на предыдущую букву');
          self.permisions.previousLetter = true;
          // назвать город на предыдущую букву в слове !!!!!!!!!!!!!!!!!!!
          let currentWord = self.searchCityByLetter(true);
          if (currentWord) {
            let res = {
              val: currentWord,
              host: 'Kallisto'
            };
            self.addToResults(res);
            // = показываем название города
            self.kNamesCity(currentWord, { Kallisto: true });
          } else {
            // = Гость побеждает
            self.countResults();
          }
        },
        self.countResults
      );
    },
    // == выбираем только ту фразу, которой не было в прошлый цикл
    getNewPhrase: function(name, arrName) {
      let arrNum = generalFuncs.getRandomArrVal(Kallisto.kPhrases[arrName]);
      if (this.kPhrasesStuff[name] == arrNum) {
        arrNum = this.kPhrasesStuff.encouragingArrLength - arrNum;
      }
      // = передаём текущее значение в объект с фразами Каллисто
      this.kPhrasesStuff[name] = arrNum;
      return arrNum;
    },
    // == найти самое первое значение, начинающееся с текущей буквы
    searchCityByLetter: function(prev) {
      let self = this;
      let cityName;
      // = город ищется по последней букве
      if (!prev) {
        cityName = this.initialArr.find(function(item) {
          let letter = item.substr(0, 1);
          if (letter == self.currentLetter) {
            // проверка на наличие в массиве игры
            if (self.gameArr.indexOf(item) == -1) {
              return item;
            }
          }
        });
      }
      // = город ищется по предпоследней букве
      if (prev) {
        console.log('Город ищется по предыдущей букве');
        cityName = this.initialArr.find(function(item) {
          let letter = item.substr(0, 1);
          if (letter == self.previousLetter) {
            // проверка на наличие в массиве игры
            if (self.gameArr.indexOf(item) == -1) {
              return item;
            }
          }
        });
      }
      // = возвращает название города или undefined
      return cityName;
    },
    // == получить список городов и вернуть из промиса
    getCitiesArr: function() {
      return new Promise(function(res, rej) {
        // == подгружаем список городов из файла
        $.get('/cities', function(data) {
          if (data.ok === true) {
            res(data);
          } else {
            rej('Что то пошло не так');
          }
        });
      });
    },
    // установить имя игрока
    getPlayerName: function() {
      this.playerName = userData.user.name;
    },
    // == начало игры
    startGame: function() {
      let self = this;
      console.log('== start ==', this);
      // устанавливаем родительский элемент для вывода результатов
      this.resTab = $('#cityResultTable');
      // устанавливаем родительские элементы для вводимых данных
      this.parentElement = $('#dialogHolder');
      this.kScoreHolder = $('.k_score_holder');
      this.userScoreHolder = $('.user_score_holder');
      // развернуть панель с именами игроков и кол-вом очков
      $('.game_data_holder').toggle();
      // развернуть панель с игровыми опциями и подсказками
      $('.game_info_panel_holder').toggle();
      // установка событий на работу с максимальным счётом и подсказками
      $('#increaseScore').click(self.increaseScore.bind(self));
      $('#hintIconsHolder').click(self.useHint.bind(self));
      // определяем имя игрока
      this.getPlayerName();
      $('#pName').html(this.playerName);
      // == поместить массив с городами в localStorage или забрать оттуда (если уже есть) и присвоить объекту городов
      if (localStorage.getItem('cities') !== null) {
        this.initialArr = JSON.parse(localStorage.getItem('cities'));
        this.kShowNewCity();
      } else {
        this.getCitiesArr()
          .then(function(data) {
            let cityArr = data.cityObj.city;
            cityArr.forEach(item => {
              self.initialArr.push(item.name.toLowerCase());
            });
            localStorage.setItem('cities', JSON.stringify(self.initialArr));
            self.kShowNewCity();
          })
          .catch(function(err) {
            console.log(err);
          });
      }
    },
    // == Каллисто называет очередной город
    kNamesCity: function(cityName, obj) {
      let self = this;
      let phrase;
      // = Каллисто называет первый город
      if (obj.startCity) {
        phrase = {
          1: Kallisto.kPhrases.nameStartCity[0] + cityName
        };
        ttsConfig.tts.ttsOut(phrase, {
          func: self.giveUserToChoose.bind(self)
        });
      } else {
        // = заканчиваем игру, если Каллисто достигла максимального счёта
        if (this.kScore > this.maxScore) {
          Kallisto.speaks(
            { 1: 'Я набрала максимальное количество очков' },
            self.endGame.bind(self)
          );
          return;
        }
        // = Каллисто говорит фразу с поощрением и называет город
        let encouragingId = this.getNewPhrase('encouragingId', 'encouraging');
        let nameCitiesId = this.getNewPhrase('nameCitiesId', 'nameCities');
        phrase = {
          1: Kallisto.kPhrases.encouraging[encouragingId],
          2: Kallisto.kPhrases.nameCities[nameCitiesId],
          3: cityName
        };
        ttsConfig.tts.ttsOut(phrase, {
          func: self.giveUserToChoose.bind(self)
        });
      }
      // = показать город
      this.emergeCity(cityName, { Kallisto: true });
    },
    // == временно показать название города
    emergeCity: function(cityName, obj) {
      cityName = cityName[0].toUpperCase() + cityName.slice(1);
      let holder = `<div class='text-center'><span class='city_name_holder'>${cityName}</span></div>`;
      this.parentElement.html(holder);

      if (obj.Kallisto) {
        // = анимация вывода города
        $('.city_name_holder')
          .toggle()
          .animate({ display: 'inline-block', opacity: 1 }, 1000);

        generalFuncs.showDialogBlock(this.parentElement);
      }

      // = если Гость назвал город, Каллисто ждёт, пока его покажут
      if (obj.user) {
        // скрываем подсказку, если она есть
        $('.hint_word').hide();
        // = анимация вывода города
        $('.city_name_holder')
          .css({ 'background-color': 'orange' })
          .toggle()
          .animate({ display: 'inline-block', opacity: 1 }, 1000);

        generalFuncs.showDialogBlock(this.parentElement);
        return new Promise(function(res) {
          setTimeout(function() {
            res();
          }, 2000);
        });
      }
    },
    // == показать новое название города (от лица Каллисто)
    kShowNewCity: function() {
      let self = this;
      // = если это начало игры - выводим название любого города
      if (this.gameArr.length == 0) {
        // = выбираем рандомный город
        let itemNumber = generalFuncs.getRandomArrVal(self.initialArr);
        let cityName = this.initialArr[itemNumber];
        // = передаём объект с названием города и именем отправителя
        let res = {
          val: cityName,
          host: 'Kallisto'
        };
        this.addToResults(res);
        // = показываем название
        this.kNamesCity(cityName, { Kallisto: true, startCity: true });
      } else {
        // = Каллисто ищет среди не названных городов
        let currentWord = this.searchCityByLetter();
        if (currentWord) {
          let res = {
            val: currentWord,
            host: 'Kallisto'
          };
          this.addToResults(res);
          // = показываем название города
          this.kNamesCity(currentWord, { Kallisto: true });
        } else {
          // = проверить массив запрещённых букв
          let letter = this.check4LastLetter(true);
          // = Каллисто не нашла город на обычную букву
          if (!letter) {
            // = ведём подсчёт очков {конец}
            this.countResults();
          } else {
            // = если есть разрешение называть города на предыдущую букву последнего слова
            if (this.permisions.previousLetter) {
              // назвать город на предыдущую букву в слове
              let currentWord = this.searchCityByLetter(true);
              if (currentWord) {
                let res = {
                  val: currentWord,
                  host: 'Kallisto'
                };
                this.addToResults(res);
                // = показываем название города
                this.kNamesCity(currentWord, { Kallisto: true });
              } else {
                // = Гость побеждает
              }
            } else {
              // = запросить разрешение называть города на предпоследнюю букву
              Kallisto.speaks(
                {
                  1: `Название последнего города заканчивается на букву ${letter}`,
                  2: 'Городов на эту букву не существует',
                  3: 'В таких случаях я могу называть города на предыдущую букву, либо можем посчитать очки и закончить игру'
                },
                self.askToUsePreviouseLetter.bind(self)
              );
            }
          }
        }
      }
    },
    // == добавить город в таблицу результатов и на экран
    addToResults: function(city) {
      let self = this;
      // = меняем значение текущего города в объекте игры
      this.currentCity = city.val;
      // = добавляем элемент в игровой массив
      this.gameArr.push(city.val);
      // = выводим на экран в таблицу
      let cityName = city.val[0].toUpperCase() + city.val.slice(1);
      let newCity = `<span class="city_holder mb-1">${cityName}</span>`;
      this.resTab.append(newCity);
      // = узнаём последнюю букву(+предыдущую) и кол-во букв
      let lastLetter = city.val.substr(city.val.length - 1, 1);
      this.currentLetter = lastLetter.toLowerCase();
      let prevLetter = city.val.substr(city.val.length - 2, 1);
      this.previousLetter = prevLetter.toLowerCase();
      let wordsLength = city.val.length;
      // ===================================== здесь будет подсчёт очков ===========================================
      // = если кол-во букв больше предыдущего значения - перезаписать !!!!!!!!!!!!!!!!!!!!!!!!
      this.checkMaxCityLength(wordsLength, city.host);
      // = меняем счёт при помощи кол-ва букв в слове
      switch (city.host) {
        case this.playerName:
          console.log(`Отправитель: ${this.playerName}`);
          this.userScore += wordsLength;
          this.userScoreHolder.html(this.userScore);
          // = заканчиваем игру, если достигли максимального счёта
          if (this.userScore > this.maxScore) {
            Kallisto.speaks(
              { 1: 'Вы достигли максимального количества очков' },
              self.endGame.bind(self)
            );
            return;
          }
          // = сначала показываем город, потом даём Kallisto выбрать
          this.emergeCity(cityName, { user: true }).then(function(res) {
            self.kShowNewCity();
          });
          // = последний, кто назвал город
          this.lastSpeaker = this.playerName;
          break;

        case 'Kallisto':
          console.log('Отправитель: Kallisto');
          this.kScore += wordsLength;
          this.kScoreHolder.html(this.kScore);
          // = последний, кто назвал город
          this.lastSpeaker = 'Kallisto';
          break;
      }
    },
    // == генерация нового инпута для ввода названия города
    generateInput4User: function() {
      let input = `<div class="user_city_inp_holder">
                    <div class="row">
                      <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6">
                        <input type="text" class="city_input form-control" placeholder="Введите название города" id="cityInput">
                      </div>
                      <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6">
                        <button class="btn btn-success btn-block exam_city_name">Отправить</button>
                      </div>
                    </div>
                  </div>`;
      this.parentElement.html(input);
      generalFuncs.showDialogBlock(this.parentElement);
      // = ставим autofocus для инпута
      document.getElementById('cityInput').focus();
    },
    // == принять ответ Игрока
    giveUserToChoose: function(emptySlot) {
      let self = this;
      // = если перед этой ф-цией запрашивалось подтверждение на продолжение игры
      if (emptySlot) {
        // = вывести пустое поле для Каллисто
        let newCity = `<span class="city_holder mb-1"></span>`;
        this.resTab.append(newCity);
      }
      generalFuncs.clearElement(this.parentElement);
      // = проверяем, не назвала ли Каллисто город на запрещённую букву
      let letter = this.check4LastLetter();
      if (letter) {
        Kallisto.speaks(
          {
            1: `Так как не существует городов на букву `,
            2: self.currentLetter,
            3: 'Предлагаю Вам назвать город на предыдущую букву ',
            4: self.previousLetter
          },
          function() {
            self.currentLetter = self.previousLetter;
            // = запускаем таймер
            if (self.round < 2) {
              self.timerStart();
            } else {
              self.timerStart(true);
            }
          }
        );
      } else {
        // = только запускаем таймер
        if (self.round < 2) {
          self.timerStart();
        } else {
          self.timerStart(true);
        }
      }
      this.generateInput4User();
      $('.exam_city_name').click(this.examineCityName.bind(this));
    },
    // == подсчитываем кол-во очков
    countResults() {
      let self = this;
      if (this.userScore > this.kScore) {
        // Гость выигрывает по очкам
        Kallisto.speaks(
          { 1: `Поздравляю ${self.playerName}! Вы победили непобедимую меня` },
          self.visualizeVictory.bind(self)
        );
      } else if (this.userScore < this.kScore) {
        // = Гость проигрывает по очкам
        Kallisto.speaks(
          {
            1: `К сожалению, у меня закончились варианты.`,
            2: `Но, вы проиграли по очкам`,
            3: `Если хотите победить, нажмите продолжить`
          },
          self.continueGame.bind(self, true)
        );
      } else {
        // = ничья
        if (self.maxWordSpeaker == self.playerName) {
          // = побеждает Гость
          Kallisto.speaks(
            {
              1: `У нас ничья`,
              2: `Но самое длинное слово назвали Вы`,
              3: `Поздравляю с победой ${self.playerName}!`
            },
            self.visualizeVictory.bind(self)
          );
        }
        // = Каллисто предлагает продолжить игру
        if (self.maxWordSpeaker == 'Kallisto') {
          Kallisto.speaks(
            {
              1: `У нас ничья`,
              2: `Но я назвала самое длинное слово, поэтому победа будет за мной`,
              3: `Если хотите победить, нажмите продолжить`
            },
            self.continueGame.bind(self)
          );
        }
      }
    },
    // == {'Продолжить' или 'Закончить игру'}
    continueGame: function(k) {
      let self = this;
      // = очистить элемент
      generalFuncs.clearElement($('.dialog_holder'));
      // console.log('Continue...');
      if (k) {
        // = Каллисто продолжит игру
        this.showConfirmDialog(
          { yes: 'Продолжить', no: 'Закончить игру' },
          function() {
            // Каллисто один раз называт город на предыдущую букву
            Kallisto.speaks({ 1: 'Я назову город на предыдущую букву' });
            let currentWord = self.searchCityByLetter(true);
            if (currentWord) {
              let res = {
                val: currentWord,
                host: 'Kallisto'
              };
              self.addToResults(res);
              // = показываем название города
              self.kNamesCity(currentWord, { Kallisto: true });
            }
          },
          // ========= полность завершить игру =========
          self.endGame.bind(self)
        );
      } else {
        // = Гость продолжит игру
        this.showConfirmDialog(
          { yes: 'Продолжить', no: 'Закончить игру' },
          // ========= вывести окно, в котором гость может ввести следующее слово =========
          self.giveUserToChoose.bind(self, true),
          // ========= полность завершить игру =========
          self.endGame.bind(self)
        );
      }
    },
    // == окончательное завершение игры [Полное завершение: выигрыш или проигрыш]
    endGame: function(timer) {
      let self = this;
      if (timer) {
        Kallisto.speaks({ 1: 'Время вышло' });
      }
      // = у Гостя счёт выше
      if (this.userScore > this.kScore) {
        Kallisto.speaks(
          {
            1: `Поздравляю с победой ${self.playerName}!`
          },
          self.visualizeVictory.bind(self)
        );
      }
      // = у Каллисто счёт выше
      if (this.userScore < this.kScore) {
        Kallisto.speaks(
          {
            1: `Я выиграла!`
          },
          self.visualizeLoss.bind(self)
        );
      }
      // = ничья
      if (this.kScore == this.userScore) {
        // = кто назвал самое длинное слово
        switch (this.maxWordSpeaker) {
          // = побеждает гость
          case this.playerName:
            Kallisto.speaks(
              {
                1: `Поздравляю с победой ${self.playerName}!`
              },
              self.visualizeVictory.bind(self)
            );
            break;
          // = побеждает Каллисто
          case 'Kallisto':
            Kallisto.speaks(
              {
                1: `Я выиграла!`
              },
              self.visualizeLoss.bind(self)
            );
            break;
        }
      }
    },
    // == визуализация "Победы"
    visualizeVictory: function() {
      this.clearCityResultsTable();
      $('#kSmile').html('<i class="far fa-sad-cry"></i>');
      $('.game_info_panel_holder, .dialog_holder').hide();
      generalFuncs.clearElement($('.dialog_holder'));
      $('#victoryMsg').text('Вы победили !!!');
      $('#vicPanel').toggle(700, function() {
        $('#pNameHolder').css({ 'background-color': '#218838' });
        $('#kNameHolder').css({ 'background-color': '#dc3545' });
      });
    },
    // == визуализация "Проигрыша"
    visualizeLoss: function() {
      this.clearCityResultsTable();
      $('#kSmile').html('<i class="fas fa-grin-tongue"></i>');
      $('.game_info_panel_holder, .dialog_holder').hide();
      generalFuncs.clearElement($('.dialog_holder'));
      $('#victoryMsg').text('Побеждает Каллисто !!!');
      $('#vicPanel').toggle(700, function() {
        $('#pNameHolder').css({ 'background-color': '#dc3545' });
        $('#kNameHolder').css({ 'background-color': '#218838' });
      });
    },
    // == очистить таблицу с городами
    clearCityResultsTable: function() {
      let self = this;
      let tableObj = $('#cityResultTable').children();
      let itemsNum = tableObj.length;
      $(tableObj[itemsNum - 1]).animate(
        { width: '0', height: '0', opacity: '0' },
        100,
        function() {
          $(tableObj[itemsNum - 1]).remove();
          if (itemsNum > 0) {
            self.clearCityResultsTable();
          }
        }
      );
    },
    // == проверка наличия города в массиве
    examineCityName: function() {
      let self = this;
      let cityVal = $('#cityInput')
        .val()
        .toLowerCase();

      // = гость не ввёл название
      if (!cityVal) {
        $('.exam_city_name').addClass('disabled');
        Kallisto.speaks({ 1: Kallisto.kPhrases.fails.emptyString }, function() {
          $('.exam_city_name').removeClass('disabled');
        });
        return false;
      }

      // = если Гость назвал город не на ту букву
      let firstLetter = cityVal.substr(0, 1);
      if (this.currentLetter != firstLetter.toLowerCase()) {
        Kallisto.speaks({
          1: Kallisto.kPhrases.fails.wrongLetter,
          2: self.currentLetter
        });
        return false;
      }

      let indexFromIA = this.initialArr.indexOf(cityVal);
      let indexFromUA = this.gameArr.indexOf(cityVal);
      // = если такой город есть в массиве initialArr и нет в массиве gameArr
      if (indexFromIA != -1 && indexFromUA == -1) {
        // = удаляем элемент из общего массива
        this.initialArr.splice(indexFromIA, 1);
        // = передаём объект с названием города и именем отправителя
        let res = {
          val: cityVal,
          host: this.playerName
        };
        // = останавливаем таймер
        this.round++;
        this.stopTimer();
        this.addToResults(res);
      } else {
        if (indexFromUA != -1) {
          // = Город уже назывался
          Kallisto.speaks({ 1: Kallisto.kPhrases.fails.repeateCity });
          return false;
        }
        if (indexFromIA == -1) {
          // = Города нет в массиве
          Kallisto.speaks({ 1: Kallisto.kPhrases.fails.noCityName });
          return false;
        }
      }
    },
    // == начало отсчёта
    timerStart: function(round) {
      let self = this;
      // = опции для таймера
      let progressOptions = {
        value: 1,
        insertMode: 'append',
        size: 80,
        startAngle: -1.55,
        animation: {
          // 30 секунд на ответ
          duration: 30000
        },
        emptyFill: '#414b4c',
        fill: {
          gradient: ['orange', '#28a745']
        }
      };

      // прогресс бар
      if (!round) {
        $('.timer_bar')
          .circleProgress(progressOptions)
          .on('circle-animation-progress', self.timerEnd);
      } else {
        $('.timer_bar').circleProgress('redraw');
      }
    },
    // == остановка таймера
    stopTimer: function() {
      let widget = $('.timer_bar');
      $(widget.circleProgress('widget')).stop();
    },
    // == если таймер дошёл до конца
    timerEnd: function(event, animationProgress, stepValue) {
      if (animationProgress == 1) {
        gameFuncs.city.endGame(true);
      } else {
        $(this)
          .find('strong')
          .text(stepValue.toFixed(2).substr(2));
      }
    }
  };

  return { city };
})();
