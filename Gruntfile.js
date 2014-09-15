module.exports = function(grunt)
{
	var js_files = [
		"./bower_components/jquery/dist/jquery.js",
		"./bower_components/bootstrap/dist/js/bootstrap.js",
		"./bower_components/underscore/underscore.js",
		"./bower_components/backbone/backbone.js",
		"./bower_components/handlebars/handlebars.min.js",
		"./bower_components/moment/moment.js",
		"./bower_components/moment/lang/nb.js",
		"./bower_components/bootstrap-datepicker/js/bootstrap-datepicker.js",
		"./bower_components/bootstrap-datepicker/js/locales/bootstrap-datepicker.no.js",
		"./app/assets/javascript/app.js",
		"./app/assets/javascript/models/*.js",
		"./app/assets/javascript/collections/*.js",
		"./app/assets/javascript/views/*.js",
		//"./app/assets/javascript/views/profile.js",
		"./app/assets/javascript/handlebars.helpers.js",
	];
	grunt.initConfig({
		concat: {
			options: {
				separator: ";"
			},
			js_frondend: {
				src: js_files,
				dest: "./public/assets/javascript/frontend.js"
			}
		},
		less: {
			development: {
				options: {
					//compress: true
				},
				files: {
					"./public/assets/stylesheets/frontend.css": "./app/assets/stylesheets/frontend.less"
				}
			}
		},
		uglify: {
			all: {
				files: {
					// TODO
				}
			}
		},
		//phpunit: {},
		watch: {
			js: {
				files: js_files,
				tasks: ['concat'],
				options: {
					livereload: true // reloads browser
				}
			},
			less: {
				files: ["./app/assets/stylesheets/*.less"],
				tasks: ["less"],
				options: {
					livereload: true // reloads browser
				}
			}
		}
	});

	// Plugin loading
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	
	// Task definition
	grunt.registerTask('default', [
		'less',
		'concat',
		'watch'
	]);

	//$collection->add('../vendor/twitter/bootstrap/less/bootstrap.less')->apply('Less');
	//$collection->javascript('//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js');
	//$collection->directory('../vendor/twitter/bootstrap/js', function($collection) {
	//		$collection->requireDirectory();

};
