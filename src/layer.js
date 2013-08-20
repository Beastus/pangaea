/**
 * pangaea layer class
 *
 */
(function() {
	"use strict";

	/**
	 * @desc 
	 * @constructor 
	 * @memberof pan
	 */
	pan.Layer = function (data, name, type, left, top, width, height) {

		var map = pan.canvas.map;
		// set defaults
		data = data || [];
		name = name || "";
		type = type || "undefined";
		left = left || 0;
		top = top || 0;

		return {

			name: name,
			type: type,
			left: left,
			top: top,
			width: map.width,
			height: map.height,
			data: data,
			coords: [],

			/**
			 * @desc Updates layer state for dynamic layer types
			 * @method
			 */
			update: function () {
				//
			},

			/**
			 * @desc Draws tiles to the canvas
			 * @method
			 */
			render: function (canvas) {
				//
			},

			prerender: function () {
				var i, x, y, tileIndex, tileset, atlas, 
					atlasindex, frame, srcx, srcy, length,
					xpos, ypos, localindex, localwidth;

				if (this.type === "tilelayer") {
					for (i = 0; i < this.data.length; i++) {
						// get tile index at position i
						tileIndex = this.data[i];

						if (tileIndex === 0) {
							continue;
						}

						// get tileset
						for (x = pan.canvas.tilesets.length; x >= 0;x) {
							x--;
							if (pan.canvas.tilesets[x].firstgid <= tileIndex) {
								tileset = pan.canvas.tilesets[x];
								x = -1;
							}
						}

						// lookup atlas
						for (y = 0; y < pan.canvas.atlases.length; y++) {
							atlas = pan.canvas.atlases[y];
							atlasindex = y;
							frame = (function () {
								var z;
								for (z = 0; z < atlas.frames.length; z++) {
									if (atlas.frames[z].filename === tileset.image) {
										return atlas.frames[z];
									}
								}
								return null;
							}());
							if (frame) {
								break;
							}
						}

						// calculate source x and source y
						localindex = tileIndex - tileset.firstgid;
						localwidth = frame.frame.w / map.tilewidth;

						srcx = Math.round(((localindex / localwidth) % 1) * localwidth) * map.tilewidth;
						srcx = srcx + frame.frame.x;

						srcy = Math.floor(localindex / localwidth) * map.tileheight;
						srcy = srcy + frame.frame.y;

						// calculate base destination xy coords
						xpos = Math.round(((i / map.width) % 1) * map.width * map.tilewidth);
						ypos = Math.floor(i / map.width) * map.tileheight;
						this.coords[i] = {
							xpos: xpos,
							ypos: ypos
						};


						if (!pan.canvas.table) {
							length = Math.ceil((this.width / map.tilewidth) * (this.height / map.tileheight));
							pan.canvas.table = [length];
						}

						// cache precalculated atlas index and source coordinates
						pan.canvas.table[tileIndex] = {
							aindex: 0,
							srcx: srcx, 
							srcy: srcy,
							w: tileset.tilewidth,
							h: tileset.tileheight
						};

						// mark canvas as ready
						pan.canvas.ready = true;
					}
				}
			}
		};
	};
}());