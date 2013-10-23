pangaea
=======

Fiddling around with canvas-based 2D tile rendering.


Demo maps created as follows:

	1. Create maps in Tiled.
	2. Run .tmx file through tmxOptimizer to weed out unused tiles.
		- Possibly use tileset_baker to merge overlapping tiles.
	3. Export .tmx data to JSON file.
	4. Consolidate images using TexturePacker (export packer mappings to JSON file).
	5. Optimize atlas .png using tinypng.org, png gauntlet, or equivalent.
	6. Minify the JSON.

TexturePacker JSON file and .tmx export JSON file loaded and preprocessed to internal data structures.

Note: This project is a quick and dirty JS experiment and exploration of some tools. There are a number of legit 2D HTML5/JavaScript rendering engines on github and elsewhere. This is not one of them.
