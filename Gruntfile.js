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
					THREE: true
				}
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
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');

	grunt.registerTask('test', ['jshint']);
	grunt.registerTask('default', ['jshint', 'concat', 'copy']);
	grunt.registerTask('release', ['jshint', 'concat', 'uglify']);

};