/**
 * pangaea utility objects
 *
 * @namespace pan.util
 */
(function () {
	"use strict";

	pan.util = pan.util || {};

	/**
	 * @desc timer used for diagnostic and timing purposes
	 * @constructor 
	 * @memberof pan.util
	 */
	pan.util.DeltaTimer = function () {

		var startTime, frames = 0, frameRate = 0, last = 0, target = 0, overflow = 0, resetThreshold = 100, resetCount = 0;
		// return the object that we want to expose
		return {

			/**
			 * @desc initializes the timer
			 * @param {Number} fps target frames per second
			 * @method
			 */
			start: function (fps) {
				last = new Date().getTime();
				target = 1000 / fps;
				startTime = new Date().getTime();
			},

			/**
			 * @desc performs diagnostic timer calculations
			 * @method
			 * @returns {Boolean} true if current cycle is compatible with target frame rate
			 */
			ready: function () {
				var diff = (new Date().getTime() - last) + overflow;
				if (diff >= target) {
					overflow = diff - target;
					if (overflow > resetThreshold) {
						// reset on assumption that tab was suspended
						overflow = 0;
						frames = 0;
						startTime = new Date().getTime();
						resetCount += 1;
						// this pushes up the threshold to accommodate possible super slow performance
						if (resetCount > 25) {
							resetThreshold += 20;
							resetCount = 0;
						}
					}
					last = new Date().getTime();
					frames++;
					if ((frames % 10) === 0) {
						// update FPS calculation
						frameRate = frames / ((new Date().getTime() - startTime) / 1000);
					}
					return true;
				}
				return false;
			},

			/**
			 * @desc gets calculated frame rate
			 * @method
			 * @returns {Number} current frames per second average
			 */
			getFrameRate: function () {
				return Math.round(frameRate * 1000, 10) / 1000;
			}
		};
	};

	/**
	 * @desc a very simplified player object for prototyping and debug purposes
	 * @constructor 
	 * @memberof pan.util
	 * @param {Number} x the x-coordinate of the player in pixels
	 * @param {Number} y the y-coordinate of the player in pixels
	 * @param {Number} w the width of the player in pixels
	 * @param {Number} h the height of the player in pixels
	 * @param {String} c color of the player sprite
	 * @returns A player object
	 */
	pan.util.Player = function (x, y, w, h, c) {

		// specify defaults
		x = x || 0;
		y = y || 0;
		w = w || 32;
		h = h || 32;
		c = c || "#0062ae";

		// return object
		return {

			/**
			 * @desc color to draw player sprite
			 */
			color: c,
			/**
			 * @desc base movement speed (pixels per update)
			 */
			speed: 4,

			/**
			 * @desc updates player state based on pan.util.keyboard state
			 * @method
			 */
			update: function () {
				var key, rate;
				if (pan.util.keyboard.stack.length > 0) {
					//
					rate = pan.util.keyboard.shift ? this.speed * 2 : this.speed;
					key = pan.util.keyboard.peek();
					if (key === "w") {
						y -= rate;
					} else if (key === "a") {
						x -= rate;
					} else if (key === "s") {
						y += rate;
					} else if (key === "d") {
						x += rate;
					}
					x = x.clamp(0, pan.canvas.width - w);
					y = y.clamp(0, pan.canvas.height - h);
				}
			},

			/**
			 * @desc draws player to canvas 2d context
			 * @method
			 */
			draw: function (context) {
				// draw player ellipse
				context.beginPath();
				context.fillStyle = this.color;
				context.rect(x, y, w, h);
				context.fill();
				context.closePath();
			}
		};
	};

	/**
	 * @desc simple keyboard object intended for prototyping and debug use
	 * call bind() to enable
	 * supports, w, a, s, d and shift keys
	 * @class {Object}
	 * @memberof pan.util
	 */
	pan.util.keyboard = {
		stack: [],
		shift: false,

		/**
		 * @desc returns key from top of stack without removing
		 * @method
		 */
		peek: function () {
			var temp = this.stack.pop();
			this.stack.push(temp);
			return temp;
		},

		/**
		 * @desc handles keydown event
		 * @method
		 * @param {String} code keycode firing event
		 */
		keydown: function (code) {
			if (this.stack.length > 0) {
				if (this.peek() !== code) {
					this.stack.push(code);
				}
			} else {
				this.stack.push(code);
			}
		},

		/**
		 * @desc handles keyup event
		 * @method
		 * @param {String} code keycode firing event
		 */
		keyup: function (code) {
			this.stack = this.stack.filter(function (item) { return item !== code; });
		},

		/**
		 * @desc resets internal keyboard state
		 * @method
		 */
		clear: function () {
			this.stack = [];
			this.shift = false;
		},

		/**
		 * @desc binds document keydown and keyup events to pan.util.keyboard object
		 * @method
		 */
		bind: function () {

			document.onkeydown = function (event) {
				event = event || window.event;
				var code = event.keyCode;
				if (code === 16) {
					pan.util.keyboard.shift = true;
				} else if (code === 87) {
					pan.util.keyboard.keydown("w");
				} else if (code === 65) {
					pan.util.keyboard.keydown("a");
				} else if (code === 83) {
					pan.util.keyboard.keydown("s");
				} else if (code === 68) {
					pan.util.keyboard.keydown("d");
				}
				// debug code
				if (pan.settings.log_key_input) {
					console.log("keybown.keycode: " + code + "; keyboard: " + 
						pan.util.keyboard.toString());
				}
			};
			document.onkeyup = function (event) {
				event = event || window.event;
				var code = event.keyCode;
				if (code === 16) {
					pan.util.keyboard.shift = false;
				} else if (code === 87) {
					pan.util.keyboard.keyup("w");
				} else if (code === 65) {
					pan.util.keyboard.keyup("a");
				} else if (code === 83) {
					pan.util.keyboard.keyup("s");
				} else if (code === 68) {
					pan.util.keyboard.keyup("d");
				}
				// debug code
				if (pan.settings.log_key_input) {
					console.log("keyup.keycode: " + code + "; keyboard: " + 
						pan.util.keyboard.toString());
				}
			};
			// this prevents sticky keys when window focus is lost
			window.onblur = function () {
				pan.util.keyboard.clear();
			};
		},

		/**
		 * @desc returns a string representation of the object state
		 * @method
		 */
		toString: function () {
			return "[stack.length:" + this.stack.length + ",shift:" + this.shift + "]";
		}
	};


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
}());