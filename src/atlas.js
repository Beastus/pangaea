/**
 * atlas class
 */

(function () {
	'use strict';

	/**
	 * @desc 
	 * @constructor 
	 * @memberof pan
	 */
	pan.loadAtlas = function (json) {

		var name,
			imagePath,
			image,
			atlas;

		if (!json) {
			throw {
				name: 'paramError',
				message: 'Required parameter not supplied.'
			};
		}

		name = json.meta.image;
		imagePath = 'assets/' + name;

		// load up image resource
		image = new Image();
		image.src = imagePath;


		// setup atlas object
		atlas = new pan.Atlas(image, name, json.meta.size, json.frames);
		return atlas;
	};

	/**
	 * @desc 
	 * @constructor 
	 * @memberof pan
	 */
	pan.loadAtlasAsync = function (json, onloadCallback) {

		if (!json || !onloadCallback) {
			throw {
				name: 'paramError',
				message: 'Required parameter not supplied.'
			};
		}
		var image,
			name = json.meta.image,
			imagePath = 'assets/' + name,
			size = json.meta.size,
			frames = json.frames;

		image = new Image();
		image.onload = function () {

			// create new atlas
			var atlas = new pan.Atlas(image, name, size, frames);

			// invoke callback, passing new atlas
			if (onloadCallback) {
				onloadCallback(atlas);
			}
		};
		image.src = imagePath;
	};

	/**
	 * @desc 
	 * @constructor 
	 * @memberof pan
	 */
	pan.Atlas = function (image, name, size, frames) {

		this.image = image;
		this.name = name;
		this.size = size;
		this.frames = frames;
	};

	/**
	 * @desc Updates atlas state
	 * @method
	 */
	pan.Atlas.prototype.update = function () {
		//
	};

	/**
	 * @desc Draws atlas to specified 2d context
	 * @method
	 */
	pan.Atlas.prototype.draw = function () {
		//
	};

}());