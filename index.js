const pixel = require('node-pixel');
const five = require('johnny-five');

const board = new five.Board();

const hourColor = 'blue';
const minuteColor = 'green';
const secondColor = [255, 0, 255];

const delta = 1000;

function getTime() {
	const date = new Date();

	return {
		hours: date.getHours(),
		minutes: date.getMinutes(),
		seconds: date.getSeconds()
	};
}

function getPixels({hours, minutes, seconds}) {
	let hp;

	if (hours > 12) {
		hours -= 12;
	}

	if (hours === 12) {
		hp = 0;
	} else {
		hp = hours * 5;
	}

	return {
		hp,
		mp: minutes,
		sp: seconds
	};
}

board.on('ready', function () {
	const strip = new pixel.Strip({
		board: this,
		controller: 'FIRMATA',
		strips: [{pin: 6, length: 60}]
	});

	strip.on('ready', function () {
		setInterval(function () {
			// reset
			strip.color('black');

			const time = getTime();

			console.log(`${time.hours}:${time.minutes}:${time.seconds}`);

			const {hp, mp, sp} = getPixels(time);

			strip.pixel(hp).color(hourColor);
			strip.pixel(mp).color(minuteColor);
			strip.pixel(sp).color(secondColor);

			// latch
			strip.show();
		}, delta);
	});
});
