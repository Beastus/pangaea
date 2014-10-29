module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        //separator: ';',
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

    jshint: {
      files: ['src/<%= pkg.name %>-bundle.js'],
      options: {
        curly:   true,
        eqeqeq:  true,
        immed:   true,
        latedef: true,
        newcap:  true,
        noarg:   true,
        sub:     true,
        undef:   true,
        boss:    true,
        eqnull:  true,
        browser: true,

        globals: {
          console:    true
        }
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        sourceMap: true
      },
      build: {
        files: {
          'build/<%= pkg.name %>-bundle.min.js': 'src/<%= pkg.name %>-bundle.js',
		      'demo/demo.min.js': 'demo/demo.js',
        }
      }
    },

	connect: {
	  server: {
		options: {
		  port: 8001
		  //, hostname: '*'
		}
	  }
	},

    watch: {
      scripts: {
        files: 'src/*.js',
        tasks: ['concat', 'jshint', 'uglify'],
        options: {
          interrupt: true,
        },
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concat', 'jshint', 'uglify', 'connect', 'watch']);
};