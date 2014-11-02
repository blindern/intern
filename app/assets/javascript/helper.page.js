angular.module('intern.helper.page', ['ngAnimate', 'angular-ladda']).
factory('Page', function($rootScope) {
	$rootScope.title = 'default';
	return {
		title: function() { return $rootScope.title; },
		setTitle: function(newTitle) { $rootScope.title = newTitle; }
	};
}).

// the menu
controller('HeaderController', function($scope, $location) {
	$scope.isActive = function(path, prefixpath) {
		if ($location.path() == path)
			return true;

		if (prefixpath && $location.path().substring(0, prefixpath.length) == prefixpath)
			return true;

		return false;
	};
}).

// notifications
factory('FlashService', function($rootScope, $timeout, $animate) {
	$rootScope.flashes = [];
	var remove_after = 3000;
	return {
		// flash = { 'message': 'The message', 'type': 'optional css-class for type' }
		add: function(flash) {
			flash.date = new Date();
			$rootScope.flashes.push(flash);
			$timeout(function() {
				$rootScope.flashes.shift();
			}, remove_after);
		}
	};
}).

// collect notifications from http
// it might be in the headers or in the data itself
config(function($httpProvider) {
	$httpProvider.responseInterceptors.push(function($q, $location, $injector, FlashService) {
		return function(promise) {
			function checkFlashes(response) {
				var flashes = response.headers('X-Flashes') || response.data['flashes'];
				if (flashes) {
					$.each(angular.fromJson(flashes), function(i, flash) {
						FlashService.add(flash);
					});
				}
			};
			return promise.then(function(response) {
				checkFlashes(response);
				return response;
			}, function(response) {
				checkFlashes(response);
				return $q.reject(response);
			});
		};
	});
});