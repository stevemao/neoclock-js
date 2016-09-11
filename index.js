pixel = require("node-pixel");
five = require("johnny-five");

var board = new five.Board();
var strip = null;

const hourColor = 'blue';
const minuteColor = 'green';
const secondColor = [255, 0, 255];

const delta = 1000;

function getTime() {
  var date = new Date();

  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds()
  };
}

function getPixels({ hours, minutes, seconds }) {
  let hp, mp, sp;

  if (hours > 12) {
    hours = hours - 12;
  }

  if (hours === 12) {
    hp = 0;
  } else {
    hp = hours * 5;
  }

  return {
    hp,
    mp: minutes,
    sp: seconds,
  }
}

board.on("ready", function() {
    var interval;
    strip = new pixel.Strip({
        board: this,
        controller: "FIRMATA",
        strips: [ {pin: 6, length: 60}, ],
    });

    strip.on("ready", function() {
      var pi = 0;
      interval = setInterval(function() {
        // reset
        strip.color('black')

        const time = getTime();

        console.log(`${time.hours}:${time.minutes}:${time.seconds}`)

        const { hp, mp, sp } = getPixels(time)

        strip.pixel(hp).color(hourColor);
        strip.pixel(mp).color(minuteColor);
        strip.pixel(sp).color(secondColor);

        // latch
        strip.show();
      }, delta)
    });
});
