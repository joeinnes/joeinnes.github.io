typewrite = function(el,text) {
  var text_array_length = text.split("").length,
      current_char = 0;

  function typechar() {
    current_char++;
    el.textContent = text.substring(0,current_char);
    if (current_char < text_array_length) {
      setTimeout(function(){
        typechar();
      },(randomNum(150,250)));
    }
  }

  function randomNum(min,max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  setTimeout(typechar, 750);
};

function flashCursor() {
  var cursor = document.getElementById('blinking-cursor');
  cursor.style.opacity = cursor.style.opacity == 0 ? 100 : 0;
  setTimeout(flashCursor, 700);
}

var typed = document.getElementById('typed');
typewrite(typed, "Joe Innes");
flashCursor();