'use strict';

angular.module('intern.auth', ['ngRoute', 'intern.helper.page']).

config(['$routeProvider', function($routeProvider) {

}]).

// Page.setTitle('Registrer konto');

run(function($rootScope, AuthService) {
	// create a global binding that can be used by templates
	$rootScope.AuthService = AuthService;
}).

controller('RegisterController', function($scope, $http, Page) {
	Page.setTitle("Registrering for beboere/GB-ere");
	$scope.register = function(reg, form) {
		if (!form.$valid) return;

		$http.post('api/register', reg).success(function(ret) {
			$scope.success = true;
		}).error(function() {
			// TODO: better error handling
		});
	};
}).

directive('validUsername', function() {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, element, attrs, ctrl) {
			scope.$watch(attrs.ngModel, function(value) {
				ctrl.$setValidity('length', value && value.length >= 4 && value.length <= 20);
				ctrl.$setValidity('valid', value && /^[a-z][a-z0-9]+$/.test(value));
			});
		}
	};
}).

directive('validPhone', function() {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, element, attrs, ctrl) {
			scope.$watch(attrs.ngModel, function(value) {
				ctrl.$setValidity('phone', !value || /^(|[1-9][0-9]{7})$/.test(value));
			});
		}
	};
}).

directive('validPassword', function() {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, element, attrs, ctrl) {
			scope.$watch(attrs.ngModel, function(value) {
				ctrl.$setValidity('length', value && value.length >= 8);
			});
		}
	};
}).

controller('LogoutController', function($location, AuthService) {
	AuthService.logout().success(function() {
		$location.path('/');
	});
}).

service("AuthService", function($http, $location, FlashService) {
	// these are injected in the main layout from Laravel
	var logged_in = window.logged_in;
	var user = window.user;
	var useradmin = window.useradmin;
	var is_office = window.is_office;
	var redirect_url;

	var self = this;

	this.isLoggedIn = function() {
		return logged_in;
	};
	this.getUser = function() {
		return user;
	};
	this.isUserAdmin = function() {
		return useradmin;
	};
	this.logout = function() {
		return $http.get('logout').success(function() {
			logged_in = false;
			user = null;
			useradmin = null;
		});
	};

	// set redirect url to go to on login
	this.setRedirectUrl = function(path) {
		redirect_url = path;
	};

	// get (and reset) redirect url for login action
	this.getRedirectUrl = function() {
		var path = redirect_url;
		redirect_url = null;
		return path;
	};

	// check if we can admin a group
	this.groupIsAdmin = function(group, realadmin) {
		if (!realadmin && useradmin) return true;
		return (group in user.groupowner_relations);
	};

	// check if we are in a group
	this.inGroup = function(groupNames, forceRealMember) {
		if (!logged_in) return false;
		if (!forceRealMember && useradmin) return true;

		if (!(groupNames instanceof Array))
		{
			groupNames = [groupNames];
		}

		for (var i = 0; i < groupNames.length; i++)
		{
			var group = groupNames[i];
			if (group in user.group_relations) return true;
		};

		return false;
	};

	// require login
	// returns true if access is granted
	// redirect to login if needed
	this.requireUser = function() {
		if (self.isLoggedIn()) return true;
		FlashService.add({'message': 'Denne siden krever innlogging.', 'type': 'danger'});
		self.setRedirectUrl($location.path());
		$location.path('login');
		return false;
	};

	// require group access
	// returns true if access is granted, false if not
	// give error message or redirect to login if needed
	this.requireGroup = function(groupNames, forceRealMember) {
		if (!self.requireUser()) return false;
		if (self.inGroup(groupNames, forceRealMember)) return true;
		return false;
	};

	// check if we have access by IP
	this.isOffice = function() {
		return is_office;
	};
}).

// send to login page if required on page request
config(function($httpProvider) {
	$httpProvider.responseInterceptors.push(function($q, $location, $injector) {
		return function(promise) {
			return promise.then(function(response) {
				return response;
			}, function(response) {
				if (response.status == 401 && $location.path() != '/login') {
					$injector.get('AuthService').setRedirectUrl($location.path());
					$location.path('/login');
				}
				return $q.reject(response);
			});
		};
	});
});
