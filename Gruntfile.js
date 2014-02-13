"use strict";

module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
		concat: {
			options: {
				separator: "\n"
			},
			dist: {
				src: [
					'vendors/**/*.js',
					'src/core/**/*.js',
					'src/material/**/*.js',
					'src/control/**/*.js',
					'src/geometry/**/*.js',
					'src/layer/**/*.js',
                    'src/extras/**/*.js',
				],
				dest: 'dist/<%= pkg.name %>.js'
			}
		},
		
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			},
			dist: {
				files: {
					'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
				}
			}
		},

		jshint: {
			files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js', '!test/vendor/**'],
			options: {
				// options here to override JSHint defaults
				globals: {
					console: true,
					document: true,
					THREE: true,
                    module: true,
                    describe: false,
                    it: false,
                    before: false,
                    beforeEach: false,
                    after: false,
                    afterEach: false,
                    assert: true,
				},
                undef: true,
                unused: true,
                strict: true,
                browser: true,
                node: true,
                yui:true,
			}
		},
		
		copy: {
			main: {
				expand: true,
				cwd: 'dist/',
				src: '**',
				dest: 'example/js/',
				flatten: true,
				filter: 'isFile',
			},
		},
		
		watch: {
			files: ['<%= jshint.files %>'],
			tasks: ['jshint']
		},
        
        simplemocha: {
            options: {
                timeout: 3000,
                ignoreLeaks: false,
                reporter: 'spec'
            },

            all: { src: ['test/core.js', 'test/layer.js'] }
        },
        
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: 'src/',
                    outdir: 'doc/build',
                    themedir: "doc/themes/simple",
                    //helpers: ["doc/yuidoc-bootstrap-theme/helpers/helpers.js"],
                }
            }
        },
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    
	grunt.registerTask('test', ['jshint']);
	grunt.registerTask('default', ['jshint', 'concat', 'simplemocha', 'copy', 'yuidoc']);
	grunt.registerTask('release', ['jshint', 'concat', 'uglify']);

};