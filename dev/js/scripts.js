$(function() {
  $('body').css({
    backgroundColor: '#333',
    color: '#fff'
  });
});

const generalFuncs = (function() {
  // == анимация для раскрытия блока с содержимым
  function showDialogBlock(dialog) {
    // = Get Default Height
    let curHeight = dialog.height(),
      // = Get Auto Height
      autoHeight = dialog.css('height', 'auto').height();
    // = Reset to Default Height
    dialog.height(curHeight);
    dialog.stop().animate(
      {
        height: autoHeight + 30,
        opacity: 1
      },
      500
    );
    dialog.css('box-shadow', '0 0 5px #eaeaea');
  }

  // == анимация при удаление элементов из блока
  function clearElement(el) {
    $(el).animate({ opacity: 0, height: 0 }, 1000, function() {
      $(this)
        .html('')
        .css('box-shadow', 'none');
    });
  }

  return { showDialogBlock, clearElement };
})();
