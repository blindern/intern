'use strict';

angular.module('intern.dugnaden', ['ngRoute', 'intern.helper.page'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/dugnaden/old/list', {
		templateUrl: 'views/dugnad/old/index.html',
		controller: 'DugnadenCtrl',
		resolve: {
			dugnader: function(DugnadenService) {
				return DugnadenService.get();
			}
		}
	});
}])

.controller('DugnadenCtrl', function($rootScope, $scope, dugnader) {
	$rootScope.title = 'Dugnadsinnkallinger';
	$scope.dugnader = dugnader.data;

	console.log(dugnader.data);

})

.factory('DugnadenService', function($http) {
	return {
		get: function() {
			return $http.get('api/dugnaden/old');
		}
	};
});