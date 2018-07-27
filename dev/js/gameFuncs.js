const gameFuncs = (function() {
  // === объект для игры "Города"
  const city = {
    initialArr: [],
    gameArr: [],
    // = имя игрока
    playerName: null,
    // = родительский объект для ввода названия города
    parentElement: null,
    // = родительский объект с названиями городов
    resTab: null,
    // == текущий город
    currentCity: null,
    // = Последняя, предыдущая и запрещённые буквы
    currentLetter: null,
    previousLetter: null,
    forbiddenLetters: ['ё', 'ъ', 'ь'],
    // = флаги {фильтры игры}
    permisions: {
      // = разрешение называть город на предыдущую букву
      previousLetter: false
    },
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
          }
          // ======================= сл функция - Kalisto называет слово на предыдущую букву ==================
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
          // ================================================================================
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
      // = меняем счёт при помощи кол-ва букв в слове
      switch (city.host) {
        case this.playerName:
          console.log(`Отправитель: ${this.playerName}`);
          this.userScore += wordsLength;
          this.userScoreHolder.html(this.userScore);
          // = сначала показываем город, потом даём Kallisto выбрать
          this.emergeCity(cityName, { user: true }).then(function(res) {
            self.kShowNewCity();
          });
          break;

        case 'Kallisto':
          console.log('Отправитель: Kallisto');
          this.kScore += wordsLength;
          this.kScoreHolder.html(this.kScore);
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
    giveUserToChoose: function() {
      generalFuncs.clearElement(this.parentElement);
      this.generateInput4User();
      $('.exam_city_name').click(this.examineCityName.bind(this));
    },
    // == подсчитываем кол-во очков
    countResults() {
      let self = this;
      if (this.userScore > this.kScore) {
        // Гость выигрывает по очкам
        Kallisto.speaks({ 1: Kallisto.kPhrases.wins }, function() {
          console.log('Гость победил');
        });
      } else if (this.userScore < this.kScore) {
        // = Гость проигрывает по очкам
        Kallisto.speaks(
          {
            1: `К сожалению, у меня закончились варианты.`,
            2: `Но, вы проиграли по очкам`,
            3: `Если хотите победить, нажмите продолжить`
          },
          self.continueGame.bind(self)
        );
      } else {
        // = ничья
        Kallisto.speaks(
          {
            1: `У нас ничья`,
            3: `Если хотите победить, нажмите продолжить`
          },
          self.continueGame.bind(self)
        );
      }
    },
    // == продолжить игру
    continueGame: function() {
      let self = this;
      // выводим 2 кнопки: 'Продолжить' и 'Закончить игру'
      // = очистить элемент
      generalFuncs.clearElement($('.dialog_holder'));
      console.log('Continue...');
      this.showConfirmDialog(
        { yes: 'Продолжить', no: 'Закончить игру' },
        function() {
          console.log('Гость продолжает игру');
          // ========= вывести окно, в котором гость может ввести следующее слово =========
        },
        function() {
          console.log('Гость заканчивает игру');
          self.endGame();
          // ========= полность завершить игру =========
        }
      );
    },
    // == окончательное завершение игры
    endGame: function() {
      console.log('Полное завершение: выигрыш или проигрыш');
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
      /* Временно отрубим ф-ци, чтобы было проще тестить
      let firstLetter = cityVal.substr(0, 1);
      if (this.currentLetter != firstLetter.toLowerCase()) {
        Kallisto.speaks({
          1: Kallisto.kPhrases.fails.wrongLetter,
          2: self.currentLetter
        });
        return false;
      }
      */

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
    }
  };

  return { city };
})();
