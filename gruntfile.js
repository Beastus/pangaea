module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['src/core.js',
		      'src/layer.js',
			  'src/atlas.js',
			  'src/spritesheet.js',
			  'src/sprite.js',
			  'src/canvas.js',
			  'src/util.js'],
        dest: 'src/<%= pkg.name %>-bundle.js',
      },
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: {
          'build/<%= pkg.name %>-bundle.min.js': 'src/<%= pkg.name %>-bundle.js',
		  'build/demo.min.js': 'demo/demo.js',
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify']);

};