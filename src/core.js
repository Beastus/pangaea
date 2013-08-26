/**
 * top-level pangaea namespace
 *
 * @namespace pan
 */
var pan = pan || {};

(function () {
	'use strict';

	pan.version = '@@version';

	/**
	 * @namespace pan.settings
	 * @class {Object}
	 * @desc Contains debug-related flags
	 */
	pan.settings = {

		// initializes debug objects even if flags are false
		'debugInit': true,

		// enables keyboard-controlled test player sprite
		'enablePlayer': false,

		// show frames per second on screen
		'drawFps': false,

		// the color of diagnostic text
		'fontColor': 'cyan',

		// the font definition of diagnostic text
		'fontStyle': '13px "Calibri","Courier"',

		// enables hit testing
		'enableHitTesting': false,

		// draw outline of hit test regions
		'drawHitRegions': false,

		// write keyboard activity to console.log
		'logKeyInput': false,

		// automatic resizing of canvas when change to or from full screen
		'autoResize': true,

		toString: function () {
			return '[debugInit:' + this.debugInit +
				',enablePlayer:' + this.enablePlayer +
				',drawFps:' + this.drawFps +
				',drawColor:' + this.drawColor +
				',fontStyle:' + this.fontStyle +
				',enableHitTesting:' + this.enableHitTesting +
				',drawHitRegions:' + this.drawHitRegions +
				',logKeyInput:' + this.logKeyInput +
				',autoResize:' + this.autoResize +
				']';
		}
	};
}());


(function () {
	'use strict';

	var lastTime = 0, vendors = ['ms', 'moz', 'webkit', 'o'], x, currTime, timeToCall, id, onFullscreenChange;
	// Based on requestAnimationFrame polyfill by Erik Moller, with fixes from Paul Irish and Tino Zijdel.
	// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	for (x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
			window[vendors[x] + 'CancelRequestAnimationFrame'];
	}
	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function (callback) {
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
	 * auto resize implementation and full screen support for *some* browsers.
	 */
	if (pan.settings.autoResize) {

		// respond to full screen change
		onFullscreenChange = function () {

			var c = document.getElementById('canvas');
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
		document.addEventListener('fullscreenchange', onFullscreenChange);
		document.addEventListener('mozfullscreenchange', onFullscreenChange);
		document.addEventListener('webkitfullscreenchange', onFullscreenChange);
	}
}());