'use strict';

angular.module('intern.bokdatabase', ['ngRoute', 'intern.helper.page'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/bokdatabase', {
		templateUrl: 'views/bokdatabase/index.html',
		controller: 'BokdatabaseCtrl'
	});
}])

.controller('BokdatabaseCtrl', function(Page) {
	Page.setTitle('Bokdatabase');
});