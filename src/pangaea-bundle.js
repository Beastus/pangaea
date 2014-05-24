/**
 * top-level pangaea namespace
 *
 * @namespace pan
 */
var pan = pan || {};

(function () {
	'use strict';

	/**
	 * @namespace pan.settings
	 * @class {Object}
	 * @desc Contains debug-related flags
	 */
	pan.settings = {

		// initializes debug objects even if flags are false
		'debugInit': true,

		// enables keyboard-controlled test player sprite
		'enablePlayer': false,

		// show frames per second on screen
		'drawFps': false,

		// the color of diagnostic text
		'fontColor': 'cyan',

		// the font definition of diagnostic text
		'fontStyle': '12px "Courier New", Courier, monospace',

		// enables hit testing
		'enableHitTesting': false,

		// draw outline of hit test regions
		'drawHitRegions': false,

		// draw light ellipses
		'drawLights': true,

		// write keyboard activity to console.log
		'logKeyInput': false,

		// automatic resizing of canvas when change to or from full screen
		'autoResize': true,

		toString: function () {
			return '[debugInit:' + this.debugInit +
				',enablePlayer:' + this.enablePlayer +
				',drawFps:' + this.drawFps +
				',fontColor:' + this.fontColor +
				',fontStyle:' + this.fontStyle +
				',enableHitTesting:' + this.enableHitTesting +
				',drawHitRegions:' + this.drawHitRegions +
				',drawLights:' + this.drawLights +
				',logKeyInput:' + this.logKeyInput +
				',autoResize:' + this.autoResize +
				']';
		}
	};
}());


(function () {
	'use strict';

	var settings = pan.settings,
		canvas = pan.canvas,
		lastTime = 0,
		vendors = ['ms', 'moz', 'webkit', 'o'],
		x,
		len,
		currTime,
		timeToCall,
		id,
		onFullscreenChange;

	for (x = 0, len = vendors.length; x < len && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
			window[vendors[x] + 'CancelRequestAnimationFrame'];
	}
	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function (callback) {
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


	/*
	 * auto resize implementation and full screen support for *some* browsers.
	 */
	if (settings.autoResize) {

		// respond to full screen change
		onFullscreenChange = function () {

			var c = document.getElementById('canvas'),
				canvas = pan.canvas;

			if (document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen) {
				// buffer canvas size
				settings.tempSize = {
					w: canvas.width,
					h: canvas.height
				};
				canvas.width = screen.width;
				canvas.height = screen.height;
			} else {
				if (settings.tempSize) {
					canvas.width = settings.tempSize.w;
					canvas.height = settings.tempSize.h;
				}
			}
			c.width = canvas.width;
			c.height = canvas.height;
		};

		// setup listeners in case fullscreen is enabled
		document.addEventListener('fullscreenchange', onFullscreenChange);
		document.addEventListener('mozfullscreenchange', onFullscreenChange);
		document.addEventListener('webkitfullscreenchange', onFullscreenChange);
	}
}());;/**
 * pangaea layer class
 *
 */
(function () {
	'use strict';

	/**
	 * @desc 
	 * @constructor 
	 * @memberof pan
	 */
	pan.Layer = function (data, name, type, left, top, width, height, objects) {

		var map = pan.canvas.map;

		this.data = data || [];
		this.name = name;
		this.type = type;
		this.left = left || 0;
		this.top = top || 0;
		this.width = width || map.width;
		this.height = height || map.height;
		this.coords = [];
		this.objects = objects || [];
	};


	/**
	 * @desc Updates dynamic layer state.
	 */
	pan.Layer.prototype.update = function () {
		//
	};

	/**
	 * @desc Draws tiles to the canvas.
	 * @method
	 */
	pan.Layer.prototype.render = function () {
		//
	};

	/**
	 * @desc Precomputes tile mappings for fast rendering.
	 */
	pan.Layer.prototype.prerender = function () {
		var canvas = pan.canvas,
			map = canvas.map,
			tilesets = canvas.tilesets,
			atlases = canvas.atlases,
			table = canvas.table,
			i, x, y,
			len,
			tileIndex, tileset,
			atlas, atlasindex,
			frame,
			length;

		if (this.type === 'tilelayer') {
			for (i = 0, len = this.data.length; i < len; i++) {
				// get tile index at position i
				tileIndex = this.data[i];

				if (tileIndex === 0) {
					continue;
				}

				// get tileset
				for (x = tilesets.length; x >= 0;x) {
					x--;
					if (tilesets[x].firstgid <= tileIndex) {
						tileset = tilesets[x];
						x = -1;
					}
				}

				// lookup atlas
				for (y = 0; y < atlases.length; y++) {
					atlas = atlases[y];
					atlasindex = y;

					// lookup frame by name
					frame = this.selectFrame(atlas, tileset.image);
					if (frame) {
						break;
					}
				}

				// calculate tile source and destination coords
				this.computeFrame(map, frame, i, tileset, tileIndex);

				if (!pan.canvas.table) {
					length = Math.ceil((this.width / map.tilewidth) * (this.height / map.tileheight));
					table = pan.canvas.table = [length];
				}

				// cache precalculated atlas index and source coordinates
				table[tileIndex] = {
					aindex: 0,
					srcx: frame.srcx,
					srcy: frame.srcy,
					w: tileset.tilewidth,
					h: tileset.tileheight
				};
			}
		} else {

			// process non-tile layers
			if (this.name === 'lights') {

				// load light objects
				this.type = 'lights';
				for (i = 0; i < this.objects.length; i++) {
					frame = this.objects[i];
					if (frame.ellipse && frame.visible) {
						canvas.lights.push({
							x: frame.x,
							y: frame.y,
							w: frame.width,
							h: frame.height
						});
					}
				}
			} else if (this.name === 'hittest') {

				// load hit test objects
				this.type = 'hittest';
				for (i = 0; i < this.objects.length; i++) {
					frame = this.objects[i];
					if (frame.visible) {
						canvas.hitRegions.push({
							x: frame.x,
							y: frame.y,
							w: frame.width,
							h: frame.height
						});
					}
				}
			}
		}
	};

	/**
	 * @desc Precomputes tile mappings for single tile data point.
	 */
	pan.Layer.prototype.computeFrame = function (map, frame, index, tileset, tileIndex) {
		var xpos,
			ypos,
			localindex,
			localwidth;

		frame.srcx = 0;
		frame.srcy = 0;

		// calculate source x and source y
		localindex = tileIndex - tileset.firstgid;
		localwidth = frame.frame.w / map.tilewidth;

		frame.srcx = Math.round(((localindex / localwidth) % 1) * localwidth) * map.tilewidth;
		frame.srcx = frame.srcx + frame.frame.x;

		frame.srcy = Math.floor(localindex / localwidth) * map.tileheight;
		frame.srcy = frame.srcy + frame.frame.y;

		// calculate base destination xy coords
		xpos = Math.round(((index / map.width) % 1) * map.width * map.tilewidth);
		ypos = Math.floor(index / map.width) * map.tileheight;
		this.coords[index] = {
			xpos: xpos,
			ypos: ypos
		};
	};

	/**
	 * @desc Searches atlas frames by key and returns first match.
	 */
	pan.Layer.prototype.selectFrame = function (atlas, key) {

		var z,
			len,
			frames = atlas.frames;

		for (z = 0, len = frames.length; z < len; z++) {
			if (frames[z].filename === key) {
				return frames[z];
			}
		}
		return null;
	};
}());;/**
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

}());;/**
 * spritesheet class
 *
 * @namespace pan
 */
(function () {
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
}());;/**
 * sprite class
 *
 * @namespace pan
 */
;
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
}());;/**
 * pangaea utility objects
 *
 * @namespace pan.util
 */

(function () {
	'use strict';

	pan.util = pan.util || {};

	/**
	 * Initializes active utility objects.
	 * @desc Called on canvas start.
	 */
	pan.util.start = function (canvas) {

		// maintain fps diagnostics
		canvas.last = Date.now();
		if (pan.settings.drawFps || pan.settings.debugInit) {
			canvas.deltaTimer = new pan.util.DeltaTimer();
			canvas.deltaTimer.start(60);
		}

		// create test player
		if (pan.settings.enablePlayer || pan.settings.debugInit) {
			canvas.player = new pan.util.Player(canvas.width / 2 - 16, canvas.height / 2 - 16);
		}

		// bind keyboard events
		pan.util.keyboard.bind();
	};

	/**
	 * Resets timer internal state and restarts.
	 */
	pan.util.reset = function (canvas) {

		// maintain fps diagnostics
		canvas.last = Date.now();
		if (pan.settings.drawFps || pan.settings.debugInit) {
			canvas.deltaTimer.start(60);
		}

		// create test player
		if (pan.settings.enablePlayer || pan.settings.debugInit) {
			canvas.player = new pan.util.Player(canvas.width / 2 - 16, canvas.height / 2 - 16);
		}
	};

	/**
	 * Updates active utility objects.
	 * @desc Called on canvas frame update.
	 */
	pan.util.update = function (canvas) {

		// update test player
		if (pan.settings.enablePlayer) {
			canvas.player.update();
		}

		// debug code (fps)
		if (pan.settings.drawFps) {
			canvas.deltaTimer.ready();
		}
	};

	/**
	 * Draws active utility objects.
	 * @desc Called on canvas frame render.
	 */
	pan.util.render = function (canvas) {

		var settings = pan.settings,
			context = canvas.context;

		// draw hit regions
		if (settings.drawHitRegions) {
			if (canvas.drawHitRegions) {
				canvas.drawHitRegions();
			}
		}

		// draw test player
		if (settings.enablePlayer) {
			canvas.player.draw(canvas.context);
		}

		// debug code (fps)
		if (settings.drawFps) {
			// display fps stats
			context.font = settings.fontStyle;
			context.fillStyle = settings.fontColor;
			context.fillText('FPS: ' +
				canvas.deltaTimer.getFrameRate(), 6, 14);
		}
	};

	/**
	 * @desc Timer used for diagnostic and timing purposes.
	 * @constructor 
	 * @memberof pan.util
	 */
	pan.util.DeltaTimer = function () {

		var startTime, frames = 0, frameRate = 0, last = 0, target = 0, overflow = 0, resetThreshold = 100, resetCount = 0;
		// return the object that we want to expose
		return {

			/**
			 * @desc Initializes the timer.
			 * @param {Number} fps Target frames per second.
			 * @method
			 */
			start: function (fps) {
				last = new Date().getTime();
				target = 1000 / fps;
				startTime = new Date().getTime();
			},

			/**
			 * @desc Performs diagnostic timer calculations.
			 * @method
			 * @returns {Boolean} Returns true if current cycle is compatible
			 * with target frame rate.
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
			 * @desc Gets calculated frame rate.
			 * @method
			 * @returns {Number} Current frames per second average.
			 */
			getFrameRate: function () {
				return Math.round(frameRate * 1000, 10) / 1000;
			}
		};
	};

	/**
	 * @desc Simple player object for prototyping and debug purposes.
	 * @constructor 
	 * @memberof pan.util
	 * @param {Number} x The x-coordinate of the player in pixels.
	 * @param {Number} y The y-coordinate of the player in pixels.
	 * @param {Number} w The width of the player in pixels.
	 * @param {Number} h The height of the player in pixels.
	 * @param {String} c Color of the player sprite.
	 * @returns A player object.
	 */
	pan.util.Player = function (x, y, w, h) {

		var c, bc, cx, cy;

		// specify defaults
		x = x || 0;
		y = y || 0;
		w = w || 32;
		h = h || 32;
		cx = x;
		cy = y;
		c ='rgba(0, 98, 174, 0.75)';
		bc ='rgba(255, 64, 64, 1)';

		// return object
		return {

			/**
			 * @desc color to draw player sprite
			 */
			color: c,
			bordercolor: bc,
			/**
			 * @desc base movement speed (pixels per update)
			 */
			speed: 2,

			/**
			 * @desc updates player state based on pan.util.keyboard state
			 * @method
			 */
			update: function () {

				var key,
					rate,
					bounds,
					i,
					len,
					region,
					buffer = {x: cx, y: cy},
					canvas = pan.canvas,
					map = canvas.map,
					hitRegions = canvas.hitRegions,
					keyboard = pan.util.keyboard;

				if (keyboard.stack.length > 0) {
					//
					rate = keyboard.shift ? this.speed * 2 : this.speed;
					key = keyboard.peek();

					// adjust cx/cy values based on keyboard state
					if (key === 'w') {
						cy -= rate;
					} else if (key === 'a') {
						cx -= rate;
					} else if (key === 's') {
						cy += rate;
					} else if (key === 'd') {
						cx += rate;
					}

					if (cx === buffer.x && cy === buffer.y) {
						return;
					}

					cx = cx.clamp(0, (map.width * 32) - w);
					cy = cy.clamp(0, (map.height * 32) - h);

					if (pan.settings.enableHitTesting) {
						// do not update if hit test fails
						for (i = 0, len = hitRegions.length; i < len; i++) {
							region = hitRegions[i];
							if (this.hitTest(region, cx, cy, cx + w, cy + h)) {
								cx = buffer.x;
								cy = buffer.y;
								return false;
							}
						}
					}

					// move player sprite or map depending on map bounds
					bounds = map.clamp;
					if (cx >= bounds.x && cx <= bounds.w) {
						map.offsetx = -(cx - bounds.x);
						x = bounds.x;
					} else {
						x = (cx >= bounds.x) ? cx - (bounds.w - bounds.x) : cx;
						x = x.clamp(0, canvas.width - w);
					}
					if (cy >= bounds.y && cy <= bounds.h) {
						map.offsety = -(cy - bounds.y);
						y = bounds.y;
					} else {
						y = (cy >= bounds.y) ? cy - (bounds.h - bounds.y) : cy;
						y = y.clamp(0, canvas.height - h);
					}
				}
			},

			/**
			 * @desc draws player to canvas 2d context
			 * @method
			 */
			draw: function (context) {
				// draw player ellipse
				context.beginPath();
				context.rect(x, y, w, h);
				context.strokeStyle = this.bordercolor;
				context.stroke();
				context.fillStyle = this.color;
				context.fill();
				context.closePath();
			},

			/**
			 * @desc returns true if player intersects parameters
			 * @method
			 */
			hitTest: function (region, left, top, right, bottom) {
				return (region.x < right) &&
					((region.x + region.w) > left) &&
					(region.y < bottom) &&
					((region.y + region.h) > top);
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

			var keyboard = pan.util.keyboard;

			document.onkeydown = function (event) {
				event = event || window.event;
				var code = event.keyCode;
				if (code === 16) {
					keyboard.shift = true;
				} else if (code === 87) {
					keyboard.keydown('w');
				} else if (code === 65) {
					keyboard.keydown('a');
				} else if (code === 83) {
					keyboard.keydown('s');
				} else if (code === 68) {
					keyboard.keydown('d');
				}
				// debug code
				if (pan.settings.logKeyInput) {
					console.log('keybown.keycode: ' + code + '; keyboard: ' +
						keyboard.toString());
				}
			};
			document.onkeyup = function (event) {
				event = event || window.event;
				var code = event.keyCode;
				if (code === 16) {
					keyboard.shift = false;
				} else if (code === 87) {
					keyboard.keyup('w');
				} else if (code === 65) {
					keyboard.keyup('a');
				} else if (code === 83) {
					keyboard.keyup('s');
				} else if (code === 68) {
					keyboard.keyup('d');
				}
				// debug code
				if (pan.settings.logKeyInput) {
					console.log('keyup.keycode: ' + code + '; keyboard: ' +
						keyboard.toString());
				}
			};
			// this prevents sticky keys when window focus is lost
			window.onblur = function () {
				keyboard.clear();
			};
		},

		/**
		 * @desc returns a string representation of the object state
		 * @method
		 */
		toString: function () {
			return '[stack.length:' + this.stack.length + ',shift:' + this.shift + ']';
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