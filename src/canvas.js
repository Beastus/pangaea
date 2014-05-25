/* global pan */

/**
 * pangaea canvas class
 *
 * @namespace pan.canvas
 */

(function () {
	'use strict';

	/**
	 * @class {Object}
	 * @desc encapsulates the tile rendering surface
	 */
	pan.canvas = {
		width: 800,
		height: 544,
		backcolor: '#000',
		context: null,
		atlases: [],
		spritesheets: [],
		layers: [],
		tilesets: [],
		lights: [],
		hitRegions: [],
		map: {
			tileheight: 0,
			tilewidth: 0,
			width: 0,
			height: 0,
			offsetx: 0,
			offsety: 0,
			clamp: {
				x: 0,
				y: 0,
				w: 0,
				h: 0
			}
		},
		frameId: null,
		onupdate: null,
		onrender: null,
		ready: false,

		/**
		 * @desc Loads map data, including layers.
		 * @method
		 * @param {string} JSON data from which to load map.
		 */
		loadMap: function (json) {

			var i,
				len,
				canvas = pan.canvas,
				map = canvas.map,
				clamp = map.clamp,
				layers = canvas.layers;

			if (!json) {
				throw {
					name: 'paramError',
					message: 'Required parameter not supplied.'
				};
			}

			// update map object
			map.tilewidth = json.tilewidth;
			map.tileheight = json.tileheight;
			map.width = json.width;
			map.height = json.height;

			// precompute map clamp values
			clamp.x = canvas.width / 2;
			clamp.y = canvas.height / 2;
			clamp.w = (map.width * map.tilewidth) - map.clamp.x;
			clamp.h = (map.height * map.tileheight) - map.clamp.y;

			// load layers tile data
			for (i = 0, len = json.layers.length; i < len; i++) {
				layers.push(new pan.Layer(
					json.layers[i].data,
					json.layers[i].name,
					json.layers[i].type,
					json.layers[i].x,
					json.layers[i].y,
					json.layers[i].width,
					json.layers[i].height,
					json.layers[i].objects));
			}

			// load associated tilesets
			canvas.tilesets = json.tilesets;
		},

		/**
		 * @desc adds canvas to dom element and performs setup
		 * @method
		 * @param {Object} element DOM element to host canvas
		 * @param {Function} updateCallback optional function to call on frame update
		 * @param {Function} renderCallback optional function to call on frame render
		 */
		attach: function (element, updateCallback, renderCallback) {

			// setup canvas element
			var canvasElement = document.createElement('canvas'),
				canvas = pan.canvas;

			canvasElement.setAttribute('id', 'canvas');
			canvasElement.setAttribute('width', canvas.width);
			canvasElement.setAttribute('height', canvas.height);
			canvas.context = canvasElement.getContext('2d');
			if (!element.appendChild) {
				element = document.getElementById(element);
			}
			element.appendChild(canvasElement);

			// set callbacks
			if (updateCallback) {
				canvas.onupdate = updateCallback;
			}
			if (renderCallback) {
				canvas.onrender = renderCallback;
			}
		},

		/**
		 * @desc starts animation loop
		 * @method
		 */
		start: function () {

			var canvas = pan.canvas;

			// preprocess map data
			canvas.prerender();

			// start possible utility objects
			if (pan.util) {
				pan.util.start(canvas);
			}

			if (!canvas.frameId) {
				// start animation
				canvas.frame();
			}
		},

		/**
		 * @desc stops animation loop prior to resource reload
		 * @method
		 */
		stop: function () {
			pan.canvas.ready = false;
		},

		/**
		 * @desc unloads map and resets state
		 * @method
		 */
		reset: function () {

			var canvas = pan.canvas;
			canvas.stop();
			canvas.layers = [];
			canvas.atlases = [];
			canvas.tilesets = [];
			canvas.spritesheets = [];
			canvas.table = null;
			canvas.lights = [];
			canvas.hitRegions = [];
			canvas.map = {
				tileheight: 0,
				tilewidth: 0,
				width: 0,
				height: 0,
				offsetx: 0,
				offsety: 0,
				clamp: { x: 0, y: 0, w: 0, h: 0 }
			};
			if (pan.util) {
				pan.util.reset(canvas);
			}
		},

		/**
		 * @desc called each cycle of animation loop
		 * @method
		 */
		frame: function () {

			var canvas = pan.canvas;

			if (canvas.ready) {
				canvas.update();
				canvas.render();
			}
			canvas.frameId = window.requestAnimationFrame(canvas.frame);
		},

		/**
		 * @desc updates canvas state each frame and calls update on queued layers
		 * @method
		 */
		update: function () {
			var i,
				len,
				canvas = pan.canvas,
				layers = canvas.layers;

			// update each object in layers queue
			for (i = 0, len = layers.length; i < len; i++) {
				layers[i].update();
			}

			// call update callback
			if (canvas.onupdate) {
				canvas.onupdate(canvas);
			}

			// update possible utility objects
			if (pan.util) {
				pan.util.update(canvas);
			}
		},

		/**
		 * @desc renders canvas and caches tile table
		 * @method
		 */
		prerender: function () {

			var i,
				len,
				layers = pan.canvas.layers;

			for (i = 0, len = layers.length; i < len; i++) {
				layers[i].prerender();
			}

			// mark canvas as ready
			pan.canvas.ready = true;
		},

		/**
		 * @desc renders canvas and calls render on queued layers
		 * @method
		 */
		render: function () {
			var x,
				i,
				len,
				dlen,
				layer,
				tileIndex,
				record,
				coords,
				xpos,
				ypos,
				canvas = pan.canvas,
				layers = canvas.layers,
				table = canvas.table,
				width = pan.canvas.width,
				height = pan.canvas.height,
				offsetx = pan.canvas.map.offsetx,
				offsety = pan.canvas.map.offsety;

			canvas.clear();

			// draw all layers
			for (x = 0, len = layers.length; x < len; x++) {

				layer = layers[x] || {};

				if (layer.type !== 'tilelayer') {
					continue;
				}

				for (i = 0, dlen = layer.data.length; i < dlen; i++) {

					// get tile index at position i for lookup from table
					tileIndex = layer.data[i];
					// get buffered base coordinates
					coords = layer.coords[i];

					// draw from buffered tile table
					if (tileIndex === 0 || !coords) {
						continue;
					}

					record = table[tileIndex];

					// apply current map offsets
					xpos = coords.xpos + offsetx;
					ypos = coords.ypos + offsety;

					// only draw tiles that are in the current field of view
					if (xpos + record.w > offsetx &&
						xpos < width &&
						ypos + record.h > offsety &&
						ypos < height) {

						// draw the atlas tile
						canvas.context.drawImage(
							canvas.atlases[record.aindex].image,
							record.srcx,
							record.srcy,
							record.w,
							record.h,
							xpos,
							ypos,
							record.w,
							record.h);
					}
				}
			}

			// draw lights
			// TODO: make it so

			// call render callback
			if (canvas.onrender) {
				canvas.onrender();
			}

			// rneder possible utility objects
			if (pan.util) {
				pan.util.render(canvas);
			}
		},

		/**
		 * @desc clears canvas with background color
		 * @method
		 */
		clear: function () {

			var canvas = pan.canvas,
				context = pan.canvas.context;
			context.fillStyle = canvas.backcolor;
			context.fillRect(0, 0, canvas.width, canvas.height);
		}
	};

	/**
	 * Prints line of text to canvas.
	 *
	 * @param {string} text to print
	 * @param {number} x coord for text
	 * @param {number} y coord for text
	 */
	pan.canvas.print = function (text, x, y, font, color) {

		var context = pan.canvas.context;

		x = x || 12;
		y = y || 16;
		context.font = font || '10pt "Courier New", Courier, monospace';
		context.fillStyle = color || 'cyan';
		context.fillText(text, x, y);
	};

	/**
	 * Draws current map rect hit regions.
	 *
	 * @param {string} borderColor stroke color
	 * @param {string} fillColor fill color
	 */
	pan.canvas.drawHitRegions = function (borderColor, fillColor) {

		var i,
			len,
			r,
			bc = borderColor || 'red',
			fc = fillColor || 'rgba(255, 0, 0, 0.1)',
			canvas = pan.canvas,
			context = canvas.context,
			regions = canvas.hitRegions,
			map = canvas.map;

		context.beginPath();
		for (i = 0, len = regions.length; i < len; i++) {
			// draw hit region
			r = regions[i];
			context.rect(
				r.x + map.offsetx,
				r.y + map.offsety,
				r.w,
				r.h);
		}
		context.fillStyle = fc;
		context.fill();
		context.strokeStyle = bc;
		context.stroke();
		context.closePath();
	};
}());