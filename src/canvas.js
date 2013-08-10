/**
 * pangaea canvas class
 *
 * @namespace pan.canvas
 */
(function () {
	"use strict";

	/**
	 * @class {Object}
	 * @desc encapsulates the tile rendering surface
	 */
	pan.canvas = {
		width: 960,
		height: 640,
		backcolor: "#000",
		context: null,
		layers: [],
		delta: 0,
		last: 0,
		frameId: null,
		onupdate: null,
		onrender: null,

		/**
		 * @desc adds canvas to dom element and performs setup
		 * @method
		 * @param {Object} element DOM element to host canvas
		 * @param {Function} updateCallback optional function to call on frame update
		 * @param {Function} renderCallback optional function to call on frame render
		 */
		attach: function (element, updateCallback, renderCallback) {

			// setup canvas element
			var canvasElement = $("<canvas id='canvas' width='" + pan.canvas.width + 
				"' height='" + pan.canvas.height + "'></canvas>");
			pan.canvas.context = canvasElement.get(0).getContext("2d");
			canvasElement.prependTo(element);

			// set callbacks
			if (updateCallback) {
				pan.canvas.onupdate = updateCallback;
			}
			if (renderCallback) {
				pan.canvas.onrender = renderCallback;
			}
		},

		/**
		 * @desc starts animation loop
		 * @method
		 */
		start: function () {
			pan.canvas.last = Date.now();

			// maintain fps diagnostics
			if (pan.settings.draw_fps || pan.settings.debug_init) {
				pan.canvas.deltaTimer = new pan.util.DeltaTimer();
				pan.canvas.deltaTimer.start(60);
			}

			// create test player
			if (pan.settings.enable_player || pan.settings.debug_init) {
				pan.canvas.player = new pan.util.Player(pan.canvas.width / 2 - 16, pan.canvas.height / 2 - 16);
			}

			// add a couple layers just for testing
			pan.canvas.push(new pan.Layer("My First Layer", 87));
			pan.canvas.push(new pan.Layer("My Second Layer", 13));

			// start animation
			pan.canvas.frame();
		},

		/**
		 * @desc adds tile layer to rendering queue
		 * @method
		 * @param layer tile layer object
		 */
		push: function (layer) {
			pan.canvas.layers.push(layer);
		},

		/**
		 * @desc called each cycle of animation loop
		 * @method
		 */
		frame: function () {
			pan.canvas.update();
			pan.canvas.render();
			pan.canvas.frameId = window.requestAnimationFrame(pan.canvas.frame);
		},

		/**
		 * @desc updates canvas state each frame and calls update on queued layers
		 * @method
		 */
		update: function () {
			var i, now, key;

			// update delta state
			now = Date.now();
			pan.canvas.delta = (now - pan.canvas.last);
			pan.canvas.last = now;

			// update each object in layers queue
			for (i = 0; i < pan.canvas.layers.length; i++) {
				pan.canvas.layers[i].update();
			}

			// call update callback
			if (pan.canvas.onupdate) {
				pan.canvas.onupdate();
			}

			// update test player
			if (pan.settings.enable_player) {
				pan.canvas.player.update();
			}

			// debug code (fps)
			if (pan.settings.draw_fps) {
				pan.canvas.deltaTimer.ready();
			}
		},

		/**
		 * @desc renders canvas and calls render on queued layers
		 * @method
		 */
		render: function () {
			var i;
			pan.canvas.clear();

			// call render on each object in layers queue
			for (i = 0; i < pan.canvas.layers.length; i++) {
				// TODO: render tiles for each layer, clipped by current viewport
			}

			// call render callback
			if (pan.canvas.onrender) {
				pan.canvas.onrender();
			}

			// draw test player
			if (pan.settings.enable_player) {
				pan.canvas.player.draw(pan.canvas.context);
			}

			// debug code (fps)
			if (pan.settings.draw_fps) {
				// display fps stats
				pan.canvas.context.font = pan.settings.font_style;
				pan.canvas.context.fillStyle = pan.settings.font_color;
				pan.canvas.context.fillText("FPS: " + 
					pan.canvas.deltaTimer.getFrameRate(), 6, 14);
			}
		},

		/**
		 * @desc clears canvas with background color
		 * @method
		 */
		clear: function () {
			pan.canvas.context.fillStyle = pan.canvas.backcolor;
			pan.canvas.context.fillRect(0, 0, pan.canvas.width, pan.canvas.height);
		}
	};
}());