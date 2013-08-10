/**
 * top-level pangaea namespace
 *
 * @namespace pan
 */
var pan = pan || {};

(function () {
	"use strict";

	pan.version = '@@version';

	/**
	 * @namespace pan.settings
	 * @class {Object}
	 * @desc Contains debug-related flags
	 */
	pan.settings = {

		// initializes debug objects even if flags are false
		"debug_init": true,

		// enables keyboard-controlled test player sprite
		"enable_player": false,

		// show frames per second on screen
		"draw_fps": false,

		// the color of diagnostic text
		"font_color": "cyan",

		// the font definition of diagnostic text
		"font_style": "13px 'Calibri','Courier'",

		// draw outline of hit test regions
		"draw_hit_regions": false,

		// write keyboard activity to console.log
		"log_key_input": false
	};

	// convenient prototypal inheritance function
	// Example: newObject = Object.create(oldObject);
	// http://javascript.crockford.com/prototypal.html
	if (typeof Object.create !== 'function') {
		Object.create = function (o) {
			function F() {}
			F.prototype = o;
			return new F();
		};
	}
}());

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Moller. Fixes from Paul Irish and Tino Zijdel.
// MIT license
(function () {
	"use strict";

	var lastTime = 0, vendors = ['ms', 'moz', 'webkit', 'o'], x, currTime, timeToCall, id;
	for (x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
			window[vendors[x] + 'CancelRequestAnimationFrame'];
	}
	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function (callback, element) {
			currTime = new Date().getTime();
			timeToCall = Math.max(0, 16 - (currTime - lastTime));
			id = window.setTimeout(function () {
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}
	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function (id) {
		clearTimeout(id);
		};
	}
}());
