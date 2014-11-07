pangaea
=======

Fiddling with 2D canvas workflow and tools.

Maps created as follows:

	1. Create maps in Tiled.
	2. Run .tmx file through tmxOptimizer to weed out unused tiles.
		- Possibly use tileset_baker to merge overlapping tiles.
	3. Export .tmx data to JSON file.
	4. Consolidate images using TexturePacker (export packer mappings to JSON file).
	5. Optimize assets.

TexturePacker JSON file and .tmx export JSON file loaded and preprocessed to internal data structures.

*Fantasizing about automating (porting) TMX-related stuff as Grunt or Gulp tasks.*
