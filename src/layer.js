/**
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
}());