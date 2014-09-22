'use strict';

angular.module('intern.auth', ['ngRoute', 'intern.helper.page']).

config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/login', {
		templateUrl: 'views/auth/login.html',
		controller: 'LoginController'
	}).
	when('/register', {
		templateUrl: 'views/auth/register.html',
		controller: 'LoginController'
	}).
	when('/logout', {
		template: '',
		controller: 'LogoutController'
	});
}]).

controller('LogoutController', function($location, AuthService) {
	AuthService.logout().success(function() {
		$location.path('/');
	});
}).

controller("LoginController", function($scope, $location, AuthService, Page) {
	if (AuthService.isLoggedIn())
		$location.path('/');

	if ($location.path() == "/register")
		Page.setTitle('Registrer konto');
	else
		Page.setTitle('Logg inn');

	$scope.credentials = { username: '', password: '', remember_me: true };
	$scope.login = function() {
		AuthService.login($scope.credentials).success(function() {
			$location.path('/user/'+encodeURIComponent(AuthService.getUser().username));
		});
	};
}).

factory("AuthService", function($http, $location) {
	// these are injected in the main layout from Laravel
	var logged_in = window.logged_in;
	var user = window.user;
	var useradmin = window.useradmin;

	return {
		isLoggedIn: function() {
			return logged_in;
		},
		getUser: function() {
			return user;
		},
		isUserAdmin: function() {
			return useradmin;
		},
		login: function(credentials) {
			var login = $http.post('api/login', credentials);
			login.success(function(res) {
				if ('flash' in res) {
					console.log("melding", res.flash);
				} else if ('user' in res) {
					logged_in = true;
					user = res.user;
					useradmin = res.useradmin;
				}
			});
			login.error(function(res) {
				// TODO
				console.log("login error");
			})
			return login;
		},
		logout: function() {
			return $http.get('logout').success(function() {
				logged_in = false;
				user = null;
				useradmin = null;
			});
		},

		// check if we can admin a group
		groupIsAdmin: function(group, realadmin) {
			if (!realadmin && useradmin) return true;
			return (group in user.groupowner_relations);
		},

		// check if we are in a group
		inGroup: function(groupNames, forceRealMember) {
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
		}
	};
}).

// send to login page if required on page request
config(function($httpProvider) {
	$httpProvider.responseInterceptors.push(function($q, $location, $injector) {
		return function(promise) {
			return promise.then(function(response) {
				return response;
			}, function(response) {
				if (response.status == 401 && response.data.error == 'login-required') {
					$location.path('/login');
					return $q.reject(response);
				}
				return $q.reject(response);
			});
		};
	});
});