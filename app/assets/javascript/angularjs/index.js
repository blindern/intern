'use strict';

angular.module('intern.index', ['ngRoute', 'intern.helper.page'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl: 'views/index.html',
		controller: 'IndexCtrl'
	});
}])

.controller('IndexCtrl', function(Page) {
	Page.setTitle('Foreningen Blindern Studenterhjem');
});