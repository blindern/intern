module.exports = function(grunt)
{
	var js_files = [
		"./bower_components/jquery/dist/jquery.js",
		"./bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js",
		"./bower_components/moment/moment.js",
		"./bower_components/moment/lang/nb.js",
		//"./bower_components/bootstrap-datepicker/js/bootstrap-datepicker.js",
		//"./bower_components/bootstrap-datepicker/js/locales/bootstrap-datepicker.no.js",
		"./bower_components/angular/angular.js",
		"./bower_components/angular-route/angular-route.js",
		"./bower_components/angular-animate/angular-animate.js",
		"./bower_components/angular-resource/angular-resource.js",
		"./bower_components/d3/d3.js",
		
		"./app/assets/javascript/**.js"
	];
	grunt.initConfig({
		concat: {
			options: {
				separator: ";\n",
				sourceMap: true
			},
			js_frondend: {
				src: js_files,
				dest: "./public/assets/javascript/frontend.js"
			}
		},
		sass: {
			dev: {
				options: {
					style: 'expanded',
					sourcemap: true
				},
				files: {
					"./public/assets/stylesheets/frontend.css": "./app/assets/stylesheets/frontend.scss"
				}
			},
			prod: {
				options: {
					style: 'compressed'
				},
				files: {
					"./public/assets/stylesheets/frontend.css": "./app/assets/stylesheets/frontend.scss"
				}
			}
		},
		uglify: {
			all: {
				files: {
					'./public/assets/javascript/frontend.js': './public/assets/javascript/frontend.js'
				}
			}
		},
		//phpunit: {},
		watch: {
			js: {
				files: js_files,
				tasks: ['concat'],
				options: {
					//livereload: true // reloads browser
				}
			},
			sass: {
				files: ["./app/assets/stylesheets/**/*.scss"],
				tasks: ["sass:dev"],
				options: {
					//livereload: true // reloads browser
				}
			}
		},
		ngAnnotate: {
			options: {},
			all: {
				files: {
					'./public/assets/javascript/frontend.js': ['./public/assets/javascript/frontend.js']
				}
			}
		}
	});

	// Plugin loading
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-ng-annotate');
	
	// Task definition
	grunt.registerTask('default', [
		'sass:dev',
		'concat',
		'watch'
	]);
	grunt.registerTask('prod', [
		'sass:prod',
		'concat',
		'ngAnnotate',
		'uglify'
	]);

};
