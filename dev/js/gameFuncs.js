const gameFuncs = (function() {
  // == получить список городов и вернуть из промиса
  function getCitiesArr() {
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
  }

  // === объект для игры "Города"
  const city = {
    initialArr: [],
    userArr: [],
    parentElement: null,
    // == начало игры
    startGame: function() {
      console.log('== start ==', this);
      // устанавливаем родительский элемент для вводимых данных
      this.parentElement = $('#dialogHolder');
      // == поместить массив с городами в localStorage или забрать оттуда (если уже есть) и присвоить объекту городов
      if (localStorage.getItem('cities') !== null) {
        this.initialArr = JSON.parse(localStorage.getItem('cities'));
        this.showNewCity();
      } else {
        getCitiesArr()
          .then(function(data) {
            let cityArr = data.cityObj.city;
            cityArr.forEach(item => {
              this.initialArr.push(item.name);
            });
            localStorage.setItem('cities', JSON.stringify(this.initialArr));
            this.showNewCity();
          })
          .catch(function(err) {
            console.log(err);
          });
      }
    },
    // == показать новое название города
    showNewCity: function() {
      // выбираем рандомный город
      let itemNumber = Math.floor(Math.random() * (this.initialArr.length - 1));
      let cityName = this.initialArr[itemNumber];
      // кладём его в игровой массив
      this.userArr.push(cityName);
      // показываем название
      this.parentElement.html(`<p>${cityName}</p>`);
      generalFuncs.showDialogBlock(this.parentElement);
    },
    // == добавить город в таблицу результатов
    addToResults: function(city) {
      console.log(`${city} was added to result table`);
    },
    // == генерация игровой таблицы
    generateTable: function() {
      console.log('table');
    }
  };

  return { city };
})();
