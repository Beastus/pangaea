/**
 * top-level pangaea namespace
 *
 * @namespace pan
 */
var pan = pan || {};

(function () {
	'use strict';

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
		'fontStyle': '12px "Courier New", Courier, monospace',

		// enables hit testing
		'enableHitTesting': false,

		// draw outline of hit test regions
		'drawHitRegions': false,

		// draw light ellipses
		'drawLights': true,

		// write keyboard activity to console.log
		'logKeyInput': false,

		// automatic resizing of canvas when change to or from full screen
		'autoResize': true,

		toString: function () {
			return '[debugInit:' + this.debugInit +
				',enablePlayer:' + this.enablePlayer +
				',drawFps:' + this.drawFps +
				',fontColor:' + this.fontColor +
				',fontStyle:' + this.fontStyle +
				',enableHitTesting:' + this.enableHitTesting +
				',drawHitRegions:' + this.drawHitRegions +
				',drawLights:' + this.drawLights +
				',logKeyInput:' + this.logKeyInput +
				',autoResize:' + this.autoResize +
				']';
		}
	};
}());


(function () {
	'use strict';

	var settings = pan.settings,
		canvas = pan.canvas,
		lastTime = 0,
		vendors = ['ms', 'moz', 'webkit', 'o'],
		x,
		len,
		currTime,
		timeToCall,
		id,
		onFullscreenChange;

	for (x = 0, len = vendors.length; x < len && !window.requestAnimationFrame; ++x) {
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
	if (settings.autoResize) {

		// respond to full screen change
		onFullscreenChange = function () {

			var c = document.getElementById('canvas'),
				canvas = pan.canvas;

			if (document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen) {
				// buffer canvas size
				settings.tempSize = {
					w: canvas.width,
					h: canvas.height
				};
				canvas.width = screen.width;
				canvas.height = screen.height;
			} else {
				if (settings.tempSize) {
					canvas.width = settings.tempSize.w;
					canvas.height = settings.tempSize.h;
				}
			}
			c.width = canvas.width;
			c.height = canvas.height;
		};

		// setup listeners in case fullscreen is enabled
		document.addEventListener('fullscreenchange', onFullscreenChange);
		document.addEventListener('mozfullscreenchange', onFullscreenChange);
		document.addEventListener('webkitfullscreenchange', onFullscreenChange);
	}
}());