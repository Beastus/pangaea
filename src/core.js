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
	 * @namespace pan.FLAGS
	 * @class {Object}
	 * @desc Contains debug-related flags
	 */
	pan.FLAGS = {
		DRAW_FPS: 1,
		DRAW_HIT_REGIONS: 0,
		LOG_KEY_INPUT: 0
	};

	/**
	 * @class {Object}
	 * @desc 
	 */
	pan.core = {
		queue: [],
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
			var i;
			for (i = 0; i < this.queue.length; i++) {
				this.queue[i].update();
			}
		},
		render: function () {
			// draw to canvas
			var i;
			for (i = 0; i < this.queue.length; i++) {
				this.queue[i].render();
			}
		}
	};

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
