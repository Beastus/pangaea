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
		"enable_hit_testing": false,

		// draw outline of hit test regions
		"draw_hit_regions": false,

		// write keyboard activity to console.log
		"log_key_input": false,

		// automatic resizing of canvas when change to or from full screen
		"auto_resize": true,

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


(function () {
	"use strict";

	var lastTime = 0, vendors = ['ms', 'moz', 'webkit', 'o'], x, currTime, timeToCall, id, onFullscreenChange;
	// Based on requestAnimationFrame polyfill by Erik Moller, with fixes from Paul Irish and Tino Zijdel.
	// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
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


	/*
	 auto resize implementation and full screen support for *some* browsers.
	 */
	if (pan.settings.auto_resize) {

		// respond to full screen change
		onFullscreenChange = function () {

			var c = document.getElementById("canvas");
			if (document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen) {
				// buffer canvas size
				pan.util.tempSize = { 
					w: pan.canvas.width, 
					h: pan.canvas.height
				};
				pan.canvas.width = screen.width;
				pan.canvas.height = screen.height;
			} else {
				if (pan.util.tempSize) {
					pan.canvas.width = pan.util.tempSize.w;
					pan.canvas.height = pan.util.tempSize.h;
				}
			}
			c.width = pan.canvas.width;
			c.height = pan.canvas.height;
		};

		// setup listeners in case fullscreen is enabled
		document.addEventListener("fullscreenchange", onFullscreenChange);
		document.addEventListener("mozfullscreenchange", onFullscreenChange);
		document.addEventListener("webkitfullscreenchange", onFullscreenChange);
	}
}());