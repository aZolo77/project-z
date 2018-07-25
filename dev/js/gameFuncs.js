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
    // = Последняя буква
    currentLetter: null,
    // = счёт игрока
    userScore: 0,
    userScoreHolder: null,
    // = счёт Каллисто
    kScore: 0,
    kScoreHolder: null,
    // == найти самое первое значение, начинающееся с текущей буквы
    searchCityByLetter: function() {
      let self = this;
      let cityName = this.initialArr.find(function(item) {
        let letter = item.substr(0, 1);
        if (letter == self.currentLetter) {
          // проверка на наличие в массиве игры
          if (self.gameArr.indexOf(item) == -1) {
            return item;
          }
        }
      });
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
    kNamesCity(cityName, obj) {
      let self = this;
      // = если очередь Каллисто
      if (obj.Kallisto) {
        let phrase;
        // = Каллисто называет первый город
        if (obj.startCity) {
          phrase = { 1: Kallisto.kPhrases.nameStartCity + cityName };
          ttsConfig.tts.ttsOut(phrase, {
            func: self.giveUserToChoose.bind(self)
          });
        } else {
          // = Каллисто говорит фразу с поощрением и называет город
          let encouragingId = generalFuncs.getRandomArrVal(
            Kallisto.kPhrases.encouraging
          );
          let nameCitiesId = generalFuncs.getRandomArrVal(
            Kallisto.kPhrases.nameCities
          );
          phrase = {
            1: `${Kallisto.kPhrases.encouraging[encouragingId]}`,
            2: `${Kallisto.kPhrases.nameCities[nameCitiesId]} ${cityName}`
          };
          ttsConfig.tts.ttsOut(phrase, {
            func: self.giveUserToChoose.bind(self)
          });
        }
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
        // = кладём его в игровой массив
        this.currentCity = cityName;
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
          // показываем название города
          this.kNamesCity(currentWord, { Kallisto: true });
        } else {
          // = если К. не находит название на эту букву или города на эту букву закончились
          console.log(`Kallisto LOSE!! ${this.playerName} WINS!!!`);
          // = ведём подсчёт очков
          this.countResults();
        }
      }
    },
    // == добавить город в таблицу результатов и на экран
    addToResults: function(city) {
      let self = this;
      // = добавляем элемент в игровой массив
      this.gameArr.push(city.val);
      // = выводим на экран в таблицу
      let cityName = city.val[0].toUpperCase() + city.val.slice(1);
      let newCity = `<span class="city_holder mb-1">${cityName}</span>`;
      this.resTab.append(newCity);
      // = узнаём последнюю букву и кол-во букв
      let lastLetter = city.val.substring(city.val.length - 1);
      this.currentLetter = lastLetter.toLowerCase();
      // = меняем счёт при помощи кол-ва букв в слове
      let wordsLength = city.val.length;
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
    },
    // == принять ответ Игрока !!!!!!!!!!!!!!!! Исправить !!!!!!!!!!!!!!!!
    giveUserToChoose: function() {
      generalFuncs.clearElement(this.parentElement);
      this.generateInput4User();
      $('.exam_city_name').click(this.examineCityName.bind(this));
    },
    // == подсчитываем кол-во очков
    countResults() {
      let self = this;
      if (this.userScore > this.kScore) {
        console.log('Гость выигрывает по очкам');
      } else if (this.userScore < this.kScore) {
        console.log('Гость проигрывает по очкам');
        Kallisto.speaks(
          {
            1: `К сожалению, у меня закончились варианты.`,
            2: `Но, вы проиграли по очкам`,
            3: `Если хотите победить, нажмите продолжить`
          },
          self.continueGame
        );
      } else {
        console.log('Ничья');
      }
    },
    // == продолжить игру
    continueGame: function() {
      let self = this;
      // выводим 2 кнопки: 'Продолжить' и 'Закончить игру'
      // = очистить элемент
      generalFuncs.clearElement($('.dialog_holder'));
      console.log('Continue...');
    },
    // == проверка наличия города в массиве
    examineCityName: function() {
      let cityVal = $('#cityInput')
        .val()
        .toLowerCase();
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
          console.log(`Город ${cityVal} уже назывался`);
          return false;
        }
        if (indexFromIA == -1) {
          console.log(`Города ${cityVal} нет в массиве`);
          return false;
        }
      }
    }
  };

  return { city };
})();
