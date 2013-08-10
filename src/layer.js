/**
 * pangaea layer class
 *
 * @namespace pan
 */
(function() {
	"use strict";

	pan.Layer = function (name, left, top, width, height) {
		// set defaults
		name = name || "";
		left = left || 0;
		top = top || 0;
		width = width || pan.canvas.width;
		height = height || pan.canvas.height;

		return {

			name: name,
			left: left,
			top: top,
			width: width,
			height: height,
			tiles: [],
			sprites: [],

			/**
			 * @desc updates layer state if layer is dynamic (contains sprites)
			 * @method
			 */
			update: function () {
				var i;
				for (i = 0; i < this.sprites.length; i++) {
					this.sprites[i].update();
				}
			}
		};
	};
}());