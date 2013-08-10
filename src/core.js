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
	 * @desc encapsulates the tile rendering surface
	 */
	pan.canvas = {
		width: 960,
		height: 640,
		backcolor: "#eee",
		context: null,
		layers: [],
		delta: 0,
		last: 0,
		init: function () {
			pan.canvas.last = Date.now();
		},
		attach: function (element) {
			// setup canvas element
			var canvasElement = $("<canvas id='canvas' width='" + pan.canvas.width + 
				"' height='" + pan.canvas.height + "'></canvas>");
			pan.canvas.context = canvasElement.get(0).getContext("2d");
			canvasElement.prependTo(element);
		},
		push: function (layer) {
			pan.canvas.layers.push(layer);
		},
		frame: function () {
			pan.canvas.update();
			pan.canvas.render();
			pan.canvas.animationFrame = window.requestAnimationFrame(pan.canvas.frame);
		},
		update: function () {
			var i, now;
			// update delta state
			now = Date.now();
			pan.canvas.delta = (now - pan.canvas.last);
			pan.canvas.last = now;
			// update each object in layers queue
			for (i = 0; i < pan.canvas.layers.length; i++) {
				pan.canvas.layers[i].update();
			}
		},
		render: function () {
			var i;
			pan.canvas.clear();
			// call render on each object in layers queue
			for (i = 0; i < pan.canvas.layers.length; i++) {
				pan.canvas.layers[i].render();
			}
		},
		clear: function () {
			pan.canvas.context.fillStyle = pan.canvas.backcolor;
			pan.canvas.context.fillRect(0, 0, pan.canvas.width, pan.canvas.height);
		}
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
