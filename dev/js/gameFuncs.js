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
      console.log('== start ==', this);
      // устанавливаем родительский элемент для вывода результатов
      this.resTab = $('#cityResultTable');
      let self = this;
      // устанавливаем родительские элементы для вводимых данных
      this.parentElement = $('#dialogHolder');
      this.kScoreHolder = $('.k_score_holder');
      this.userScoreHolder = $('.user_score_holder');
      // определяем имя игрока
      self.getPlayerName();
      $('#pName').html(this.playerName);
      // == поместить массив с городами в localStorage или забрать оттуда (если уже есть) и присвоить объекту городов
      if (localStorage.getItem('cities') !== null) {
        this.initialArr = JSON.parse(localStorage.getItem('cities'));
        this.showNewCity();
      } else {
        this.getCitiesArr()
          .then(function(data) {
            let cityArr = data.cityObj.city;
            cityArr.forEach(item => {
              self.initialArr.push(item.name.toLowerCase());
            });
            localStorage.setItem('cities', JSON.stringify(self.initialArr));
            self.showNewCity();
          })
          .catch(function(err) {
            console.log(err);
          });
      }
    },
    // == показать новое название города (от лица Каллисто)
    showNewCity: function() {
      let self = this;
      // = если это начало игры - выводим название любого города
      if (this.gameArr.length == 0) {
        // выбираем рандомный город
        let itemNumber = Math.floor(
          Math.random() * (this.initialArr.length - 1)
        );
        let cityName = this.initialArr[itemNumber];
        // кладём его в игровой массив
        this.currentCity = cityName;
        // показываем название
        this.parentElement.html(`<p>${cityName}</p>`);
        generalFuncs.showDialogBlock(this.parentElement);
        // = передаём объект с названием города и именем отправителя
        let res = {
          val: cityName,
          host: 'Kallisto'
        };
        this.addToResults(res);
      } else {
        // Каллисто ищет среди не названных городов
        let currentWord = this.searchCityByLetter();
        if (currentWord) {
          let res = {
            val: currentWord,
            host: 'Kallisto'
          };
          this.addToResults(res);
        } else {
          console.log(`Kallisto LOSE!! ${this.playerName} WINS!!!`);
        }
      }
      setTimeout(function() {
        self.giveUserToChoose();
      }, 2000);
    },
    // == добавить город в таблицу результатов и на экран
    addToResults: function(city) {
      // = добавляем элемент в игровой массив
      this.gameArr.push(city.val);
      // = выводим на экран в таблицу
      let newCity = `<span class="city_holder mb-1">${city.val}</span>`;
      this.resTab.append(newCity);
      // = узнаём последнюю букву и кол-во букв
      let lastLetter = city.val.substring(city.val.length - 1);
      this.currentLetter = lastLetter;
      // = меняем счёт при помощи кол-ва букв в слове
      let wordsLength = city.val.length;
      switch (city.host) {
        case this.playerName:
          console.log(`Отправитель: ${this.playerName}`);
          this.userScore += wordsLength;
          this.userScoreHolder.html(this.userScore);
          this.showNewCity();
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
                        <input type="text" class="form-control mb-2" placeholder="Введите название города" id="cityInput">
                      </div>
                      <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6">
                        <button class="btn btn-success btn-block exam_city_name">Отправить</button>
                      </div>
                    </div>
                  </div>`;
      this.parentElement.html(input);
      generalFuncs.showDialogBlock(this.parentElement);
    },
    // == принять ответ Игрока
    giveUserToChoose: function() {
      // == очистить элемент
      generalFuncs.clearElement($('.dialog_holder'));
      this.generateInput4User();
      $('.exam_city_name').click(this.examineCityName.bind(this));
    },
    // == проверка наличия города в массиве
    examineCityName: function() {
      let cityVal = $('#cityInput').val();
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
