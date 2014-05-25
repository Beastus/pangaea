/*
 * Client script for demo.html
 */

$(document).ready(function () {
	'use strict';

	var pan = window.pan || {},
		loadCurrentMap,
		loadAllSettings,
		saveAllSettings,
		saveSetting,
		loadSetting,
		atlasPath = 'assets/atlas1.js',
		mapPath = 'assets/map1.js',
		atlasReady,
		mapReady;

	// specify initial settings
	pan.settings.enablePlayer = true;

	// attach canvas
	pan.canvas.attach('canvasContainer');

	/*
	 * Options Panel
	 */

	// debug flags checkbox set
	$('#flags :checkbox').click(function () {
		var checkstate = $('#flags').find('input:checkbox');
		pan.settings.enablePlayer = checkstate[0].checked;
		pan.settings.drawFps = checkstate[1].checked;
		pan.settings.enableHitTesting = checkstate[2].checked;
		pan.settings.drawHitRegions = checkstate[3].checked;
		pan.settings.logKeyInput = checkstate[4].checked;

		// persist current settings
		saveAllSettings();
	});
	$('#flags').buttonset();

	// wire up fullscreen button
	$('#buttonFullscreen').button().click(function () {
		// make the canvas full screen
		var c = document.getElementById('canvas');
		if (c.requestFullScreen) {
			c.requestFullScreen();
		} else if (c.requestFullscreen) {
			// w3c spec uses lowercase 's' in Fullscreen
			// but major browsers use an uppercase 'S'
			// including this for good measure.
			c.requestFullscreen();
		} else if (c.webkitRequestFullScreen) {
			// Element.ALLOW_KEYBOARD_INPUT is important--necessary for
			// W,A,S,D to function while in full screen mode.
			// Note: Safari 5.1.x fullscreen fails when the Element.ALLOW_KEYBOARD_INPUT
			// parameter is included.
			c.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
		} else if (c.mozRequestFullScreen) {
			c.mozRequestFullScreen();
		}
	});

	// wire up test button
	$('#buttonTest').button().click(function () {

		pan.canvas.reset();
		mapReady = false;
		atlasReady = false;

		// toggle json paths between two states
		if (atlasPath === 'assets/atlas1.js') {
			atlasPath = 'assets/autumn-city-atlas.js';
			mapPath = 'assets/autumn-city-map.js';
		} else {
			atlasPath = 'assets/atlas1.js';
			mapPath = 'assets/map1.js';
		}

		// load map and atlas data
		loadCurrentMap();

	});


	// fade in the page
	$('body').hide().fadeIn(800);
	window.setTimeout(function () {
		$('#options').fadeIn(600);
	}, 400);


	//
	// helper functions
	//

	loadCurrentMap = function () {

		// load atlas JSON
		$.getJSON(atlasPath)
			.done(function (json) {

				// actually load the atlas
				pan.loadAtlasAsync(json,
					function (atlas) {
						if (atlas) {
							pan.canvas.atlases.push(atlas);
						}
						atlasReady = true;

						if (mapReady) {
							// start animation loop
							pan.canvas.start();
						}
					});
			})
			.fail(function () {
				console.log('Failed to load atlas data.');
			});

		// load map JSON
		$.getJSON(mapPath)
			.done(function (json) {

				// load map to global canvas
				pan.canvas.loadMap(json);
				mapReady = true;

				if (atlasReady) {
					// start animation loop
					pan.canvas.start();
				}
			})
			.fail(function () {
				console.log('Failed to load map data.');
			});
	};

	loadAllSettings = function () {
		if (loadSetting('enablePlayer') !== undefined) {
			pan.settings.enablePlayer = loadSetting('enablePlayer') === 'true';
			pan.settings.drawFps = loadSetting('drawFps') === 'true';
			pan.settings.enableHitTesting = loadSetting('enableHitTesting') === 'true';
			pan.settings.drawHitRegions = loadSetting('drawHitRegions') === 'true';
			pan.settings.logKeyInput = loadSetting('logKeyInput') === 'true';
		}

		// update form state
		var checkstate = $('#flags').find('input:checkbox');
		$(checkstate[0]).attr('checked', pan.settings.enablePlayer);
		$(checkstate[1]).attr('checked', pan.settings.drawFps);
		$(checkstate[2]).attr('checked', pan.settings.enableHitTesting);
		$(checkstate[3]).attr('checked', pan.settings.drawHitRegions);
		$(checkstate[4]).attr('checked', pan.settings.logKeyInput);
		$('#flags').buttonset('refresh');
	};

	saveAllSettings = function () {
		saveSetting('enablePlayer', pan.settings.enablePlayer);
		saveSetting('drawFps', pan.settings.drawFps);
		saveSetting('enableHitTesting', pan.settings.enableHitTesting);
		saveSetting('drawHitRegions', pan.settings.drawHitRegions);
		saveSetting('logKeyInput', pan.settings.logKeyInput);
	};

	saveSetting = function (key, value) {

		var storage = getLocalStorage();
		storage.setItem(key, value);
	};

	loadSetting = function (key) {

		var storage = getLocalStorage();
		return storage.getItem(key);
	};

	function getLocalStorage () {

		if (typeof window.localStorage === "object") {

			return window.localStorage;
		} else if (typeof window.globalStorage === "object") {

			return window.globalStorage;
		}
		// just return a dummy object
		return { getItem: function () {}, setItem: function() {} };
	}

	// load previously saved flag states
	loadAllSettings();


	// load map and atlas data
	loadCurrentMap();

});
