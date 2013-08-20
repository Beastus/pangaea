
/*
 * note: canvas contains layers, layers can contain sprites or tiles, 
 * tiles reference positions on an atlas, sprites reference positions
 * on a sprite sheet.
 * layers are rendered in FIFO order.
 * 
 */

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
		width: 800,
		height: 544,
		backcolor: "#000",
		context: null,
		atlases: [],
		spritesheets: [],
		layers: [],
		tilesets: [],
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

			var i;

			if (!json) {
				throw {
					name: "paramError",
					message: "Required parameter not supplied."
				};
			}

			// update map object
			pan.canvas.map.tilewidth = json.tilewidth;
			pan.canvas.map.tileheight = json.tileheight;
			pan.canvas.map.width = json.width;
			pan.canvas.map.height = json.height;

			// precompute map clamp values
			pan.canvas.map.clamp.x = pan.canvas.width / 2;
			pan.canvas.map.clamp.y = pan.canvas.height / 2;
			pan.canvas.map.clamp.w = (pan.canvas.map.width * pan.canvas.map.tilewidth) - pan.canvas.map.clamp.x;
			pan.canvas.map.clamp.h = (pan.canvas.map.height * pan.canvas.map.tileheight) - pan.canvas.map.clamp.y;

			// load layers tile data
			for (i = 0; i < json.layers.length; i++) {
				pan.canvas.layers.push(new pan.Layer(
					json.layers[i].data, 
					json.layers[i].name, 
					json.layers[i].type, 
					json.layers[i].x, 
					json.layers[i].y, 
					json.layers[i].width, 
					json.layers[i].height));
			}

			// load associated tilesets
			pan.canvas.tilesets = json.tilesets;
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
			var canvasElement = document.createElement("canvas");
			canvasElement.setAttribute("id", "canvas");
			canvasElement.setAttribute("width", pan.canvas.width);
			canvasElement.setAttribute("height", pan.canvas.height);
			pan.canvas.context = canvasElement.getContext("2d");
			if (!element.appendChild) {
				element = document.getElementById(element);
			}
			element.appendChild(canvasElement);

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

			// preprocess map data
			pan.canvas.prerender();

			// maintain fps diagnostics
			pan.canvas.last = Date.now();
			if (pan.settings.draw_fps || pan.settings.debug_init) {
				pan.canvas.deltaTimer = new pan.util.DeltaTimer();
				pan.canvas.deltaTimer.start(60);
			}

			// create test player
			if (pan.settings.enable_player || pan.settings.debug_init) {
				pan.canvas.player = new pan.util.Player(pan.canvas.width / 2 - 16, pan.canvas.height / 2 - 16);
			}

			if (!pan.canvas.frameId) {
				// start animation
				pan.canvas.frame();
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
		 * @desc called each cycle of animation loop
		 * @method
		 */
		frame: function () {
			if (pan.canvas.ready) {
				pan.canvas.update();
				pan.canvas.render();
			}
			pan.canvas.frameId = window.requestAnimationFrame(pan.canvas.frame);
		},

		/**
		 * @desc updates canvas state each frame and calls update on queued layers
		 * @method
		 */
		update: function () {
			var i, key;

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
		 * @desc renders canvas and caches tile table
		 * @method
		 */
		prerender: function () {
			var i;
			for (i = 0; i < pan.canvas.layers.length; i++) {
				pan.canvas.layers[i].prerender();
			}
		},

		/**
		 * @desc renders canvas and calls render on queued layers
		 * @method
		 */
		render: function () {
			var x, i, layer, tileIndex, record, coords, xpos, ypos;
			pan.canvas.clear();

			// draw all layers
			//for (x = 0; x < 1; x++) {
			for (x = 0; x < pan.canvas.layers.length; x++) {

				layer = pan.canvas.layers[x] || {};

				if (layer.type === "tilelayer") {
					for (i = 0; i < layer.data.length; i++) {

						// get tile index at position i for lookup from table
						tileIndex = layer.data[i];
						// get buffered base coordinates
						coords = layer.coords[i];

						// draw from buffered tile table
						if (tileIndex > 0 && coords) {
							record = pan.canvas.table[tileIndex];

							// apply current map offsets
							xpos = coords.xpos + pan.canvas.map.offsetx;
							ypos = coords.ypos + pan.canvas.map.offsety;

							// only draw tiles that are in the current field of view
							if (xpos + record.w > pan.canvas.map.offsetx && 
								xpos < pan.canvas.width && 
								ypos + record.h > pan.canvas.map.offsety && 
								ypos < pan.canvas.height) {

								// draw the atlas tile
								pan.canvas.context.drawImage(
									pan.canvas.atlases[record.aindex].image,
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
				}
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

	/**
	 * Prints line of text to canvas.
	 *
	 * @param {string} text to print
	 * @param {number} x coord for text
	 * @param {number} y coord for text
	 */
	pan.canvas.print = function (text, x, y, font, color) {
		x = x || 12;
		y = y || 16;
		pan.canvas.context.font = font || "10pt Calibri";
		pan.canvas.context.fillStyle = color || "cyan";
		pan.canvas.context.fillText(text, x, y);
	};
}());