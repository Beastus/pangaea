/**
 * spritesheet class
 *
 * @namespace pan
 */
var pan = pan || {};

(function() {
	'use strict';

	/**
	 * @desc synchronously loads sprite sheet from file.
	 * @memberof pan
	 */
	pan.loadSpriteSheet = function (key, filePath) {
		//
		var image,
			spritesheet;

		if (!filePath) {
			throw {
				name: 'paramError',
				message: 'Required parameter not supplied.'
			};
		}

		// load up image resource
		image = new Image();
		image.src = filePath;

		// setup spritesheet object
		spritesheet = new pan.SpriteSheet(image, key);

		return spritesheet;
	};

	/**
	 * @desc asynchronously loads sprite sheet and returns it via callback.
	 * @memberof pan
	 */
	pan.loadSpriteSheetAsync = function (key, filePath, onloadCallback) {

		if (!filePath || !onloadCallback) {
			throw {
				name: 'paramError',
				message: 'Required parameter not supplied.'
			};
		}
		var name = key || filePath,
			image = new Image();
		
		image.onload = function () {

			// create new spritesheet
			var spritesheet = new pan.SpriteSheet(image, name);

			// invoke callback, passing new spritesheet
			if (onloadCallback) {
				onloadCallback(spritesheet);
			}
		};
		image.src = filePath;
	};

	/**
	 * @desc 
	 * @constructor 
	 * @memberof pan
	 */
	pan.SpriteSheet = function (image, key) {

		this.image = image;
		this.name = key;
	};
}());