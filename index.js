const pixel = require('node-pixel');
const five = require('johnny-five');
const Color = require('color');

const board = new five.Board();

const hourColor = 'blue';
const minuteColor = 'green';
const secondColor = [255, 0, 255];

const delta = 1000;
let animating = false;

const pixels = [];

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

function time() {
	const {hours, minutes, seconds} = getTime();
	return `${hours}:${minutes}:${seconds}`
}

function drawCircle(strip) {
	return (color = Color('#B1E2DA'), speed = 1, anti = false, num = 10) => {
		speed = speed * 100;
		color = Color(color);

		const colors = [color.rgbArray()];

		for (let i = 0; i < num - 1; i++) {
			colors[i] = color.darken(0.4).rgbArray();
		}

		const pixels = [];

		animating = true;
		from = 0;

		const interval = setInterval(() => {
			// todo: fix this reset
			strip.color('black');

			for (i = 0; i < colors.length; i++) {
				const p = from - i;
				if (p < 0) {
					break;
				}

				if (p > 59) {
					continue;
				}

				pixels[i] = strip.pixel(p).color(colors[i]);
			}

			from++;
			if (from - colors.length > 60) {
				clearInterval(interval);
				animating = false;
			}

			// latch
			strip.show();
		}, speed);
	};
}

board.on('ready', function () {
	const strip = new pixel.Strip({
		board: this,
		controller: 'FIRMATA',
		strips: [{pin: 6, length: 60}]
	});

	// initilise pixels
	for (let i = 0; i < 60; i++) {
		pixels[i] = {
			p: strip.pixel(i),
			colors: []
		};
	}

	strip.on('ready', () => {
		// the clock
		setInterval(() => {
			// todo: fix this reset
			strip.color('black');

			const time = getTime();

			const {hp, mp, sp} = getPixels(time);

			pixels[hp].p.color(hourColor);
			pixels[mp].p.color(minuteColor);
			pixels[sp].p.color(secondColor);

			// latch
			strip.show();
		}, delta);
	});

	const circle = drawCircle(strip);

	this.repl.inject({ time, strip, circle, animating });
});
