const gameFuncs = (function() {
  const hamster = {
    name: 'Игрок',
    setName: function(val) {
      this.name = val;
    }
  };

  // Получить имя Хомячка
  function getUserName(name) {
    if (name) {
      hamster.setName(name);
    }
  }

  // объект для игры "Города"
  const city = {
    initialArr: [],
    userArr: [],
    startGame: function() {
      console.log('Начинаем игру города');
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
      // == поместить массив с городами в localStorage или забрать оттуда (если уже есть) и присвоить объекту городов
      getCitiesArr()
        .then(function(data) {
          if (localStorage.getItem('cities') !== null) {
            city.initialArr = JSON.parse(localStorage.getItem('cities'));
          } else {
            let cityArr = data.cityObj.city;
            cityArr.forEach(item => {
              city.initialArr.push(item.name);
            });
            localStorage.setItem('cities', JSON.stringify(city.initialArr));
          }
        })
        .catch(function(err) {
          console.log(err);
        });
    }
  };

  return { city, getUserName };
})();
