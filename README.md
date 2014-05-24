pangaea
=======

Fiddling with canvas and tools.

Deployed here: http://areologist.com/pangaea/demo.html

Maps created as follows:

	1. Create maps in Tiled.
	2. Run .tmx file through tmxOptimizer to weed out unused tiles.
		- Possibly use tileset_baker to merge overlapping tiles.
	3. Export .tmx data to JSON file.
	4. Consolidate images using TexturePacker (export packer mappings to JSON file).
	5. Optimize assets.

TexturePacker JSON file and .tmx export JSON file loaded and preprocessed to internal data structures.
