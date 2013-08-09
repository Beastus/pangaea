/**
 * Top-level Pangaea namespace
 *
 * @namespace pan
 * @class {Object}
 */
var pan = pan || {};
(function () {
	"use strict";

	/**
	 * @namespace FLAGS
	 * @desc Contains debug-related flags
	 */
	pan.FLAGS = {
		DRAW_FPS: 1,
		DRAW_HIT_REGIONS: 0,
		LOG_KEY_INPUT: 0
	};

	/**
	 * @object pan.core
	 * @desc 
	 */
	pan.core = {
		start: function () {
			pan.core.last = Date.now();
		},
		frame: function () {
			pan.core.delta();
			pan.core.update();
			pan.core.render();
			pan.core.animationFrame = window.requestAnimationFrame(pan.core.frame);
		},
		delta: function () {
			pan.core.now = Date.now();
			pan.core.delta = (pan.core.now - pan.core.last);
			pan.core.last = pan.core.now;
		},
		update: function () {
			// update state
		},
		render: function () {
			// draw to canvas
		}
	};

	//
	// augmentation
	//

	// Setup convenient prototypal inheritance function
	// Example: newObject = Object.create(oldObject);
	// http://javascript.crockford.com/prototypal.html
	if (typeof Object.create !== 'function') {
		Object.create = function (o) {
			function F() {}
			F.prototype = o;
			return new F();
		};
	}

	/**
	 * Returns a number whose value is limited to the given range.
	 *
	 * Example: limit the output of this computation to between 0 and 255
	 * (x * 255).clamp(0, 255)
	 *
	 * @param {Number} min The lower boundary of the output range
	 * @param {Number} max The upper boundary of the output range
	 * @returns A number in the range [min, max]
	 * @type Number
	 */
	Number.prototype.clamp = function (min, max) {
		return Math.min(Math.max(this, min), max);
	};

	/**
	 * Draws an ellipse to the canvas 2d rendering context.
	 *
	 * @param {number} centerX The x coordinate of the center point of the ellipse.
	 * @param {number} centerY The y coordinate of the center point of the ellipse.
	 * @param {number} width The semi-major axis of the ellipse.
	 * @param {number} height The semi-minor axis of the ellipse.
	 */
	CanvasRenderingContext2D.prototype.ellipse = function (centerX, centerY, width, height) {

		this.moveTo(centerX, centerY - (height / 2)); // A1

		this.bezierCurveTo(centerX + (width / 2), centerY - (height / 2), // C1
			centerX + (width / 2), centerY + (height / 2), // C2
			centerX, centerY + (height / 2)); // A2

		this.bezierCurveTo(centerX - (width / 2), centerY + (height / 2), // C3
			centerX - (width / 2), centerY - (height / 2), // C4
			centerX, centerY - (height / 2)); // A1
	};
}());

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. Fixes from Paul Irish and Tino Zijdel.
// MIT license
(function () {
	"use strict";

    var lastTime = 0, vendors = ['ms', 'moz', 'webkit', 'o'], x, currTime, timeToCall, id;
    for (x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
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
