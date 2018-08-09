$(function() {
  $('body').css({
    backgroundColor: '#333',
    color: '#fff'
  });
});

const generalFuncs = (function() {
  // == анимация для раскрытия блока с содержимым
  function showDialogBlock(dialog) {
    // // = Get Default Height
    let curHeight = dialog.height();
    //   // = Get Auto Height
    let autoHeight = dialog.css('height', 'auto').height();
    // // = Reset to Default Height
    dialog.height(curHeight);
    dialog.stop().animate(
      {
        minHeight: autoHeight + 30,
        opacity: 1
      },
      500
    );
    dialog.css('box-shadow', '0 0 5px #eaeaea');

    $(window).resize(function() {
      if (dialog.height() > curHeight) {
        dialog.css({ height: 'auto', minHeight: 0 });
      }
    });
  }

  // == анимация при удаление элементов из блока
  function clearElement(el) {
    $(el).animate({ opacity: 0, height: 0, minHeight: 0 }, 1000, function() {
      $(this)
        .html('')
        .css('box-shadow', 'none');
    });
  }

  // = вывести рандомное значение массива {возвращает число}
  function getRandomArrVal(arr) {
    let itemNumber = Math.floor(Math.random() * (arr.length - 1));
    return itemNumber;
  }

  // == таймер обратного отсчёта
  function startTimer(duration, disp) {
    let timer = duration;
    let mins, secs;
    let timerInterval = setInterval(function() {
      mins = parseInt(timer / 60, 10);
      // console.log(`mins: ${mins}`);
      secs = parseInt(timer % 60, 10);
      // console.log(`secs: ${secs}`);

      mins = mins < 10 ? '0' + mins : mins;
      secs = secs < 10 ? '0' + secs : secs;

      disp.text(`${mins}:${secs}`);

      if (--timer < 0) {
        disp.text('00:00');
        clearInterval(timerInterval);
      }
    }, 1000);
    return timerInterval;
  }

  return { showDialogBlock, clearElement, getRandomArrVal, startTimer };
})();
