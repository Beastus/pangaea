/**
 * @namespace pan.util
 * 
 */
(function () {
	"use strict";

	pan.util = pan.util || {};

	/**
	 * @desc timer used for diagnostics purposes
	 * @constructor 
	 * @memberof pan.util
	 */
	pan.util.DeltaTimer = function () {

		var startTime, frames = 0, frameRate = 0, last = 0, target = 0, overflow = 0, resetThreshold = 100, resetCount = 0;
		// return the object that we want to expose
		return {
			start: function (fps) {
				last = new Date().getTime();
				target = 1000 / fps;
				startTime = new Date().getTime();
			},
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
						if (resetCount > 5) {
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
			getFrameRate: function () {
				return Math.round(frameRate * 1000, 10) / 1000;
			}
		};
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