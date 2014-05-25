module.exports = function(grunt) {

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
		  'demo/demo.min.js': 'demo/demo.js',
        }
      }
    },
    watch: {
      scripts: {
        files: 'src/*.js',
        tasks: ['concat', 'uglify'],
        options: {
          interrupt: true,
        },
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concat', 'uglify', 'watch']);
};