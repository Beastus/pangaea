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

		// enables hit testing
		"enable_hit_testing": true,

		// draw outline of hit test regions
		"draw_hit_regions": false,

		// write keyboard activity to console.log
		"log_key_input": false,

		// automatic resizing of canvas when change to or from full screen
		"auto_resize": false,

		toString: function () {
			return "[debug_init:" + this.debug_init +
				",enable_player:" + this.enable_player +
				",draw_fps:" + this.draw_fps +
				",font_color:" + this.font_color +
				",font_style:" + this.font_style +
				",enable_hit_testing:" + this.enable_hit_testing +
				",draw_hit_regions:" + this.draw_hit_regions +
				",log_key_input:" + this.log_key_input + 
				",auto_resize:" + this.auto_resize +
				"]";
		}
	};
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
