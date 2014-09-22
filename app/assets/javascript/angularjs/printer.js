'use strict';

angular.module('intern.printer', ['ngRoute', 'intern.helper.page'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/printer/siste', {
		templateUrl: 'views/printer/last.html',
		controller: 'PrinterLastController'
	});
}])

.controller('PrinterLastController', function($http, $scope, Page) {
	Page.setTitle("Siste utskrifter");

	$http.get('api/printer/last').success(function(ret) {
		// TODO: error handling

		$scope.prints = ret;
	});
});