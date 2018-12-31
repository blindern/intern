'use strict';

angular.module('intern.dugnaden', ['ngRoute', 'intern.helper.page'])

.config(['$routeProvider', function($routeProvider) {

}])

.controller('DugnadenCtrl', function($scope, dugnader, Page) {
	Page.setTitle('Dugnadsinnkallinger');
	$scope.dugnader = dugnader.data;
})

.factory('DugnadenService', function($http) {
	return {
		get: function() {
			return $http.get('api/dugnaden/old');
		}
	};
});
