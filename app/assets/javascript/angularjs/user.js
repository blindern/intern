'use strict';

angular.module('intern.user', ['ngRoute', 'intern.helper.page'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/users', {
		templateUrl: 'views/users/list.html',
		controller: 'UserListCtrl'
	})
	.when('/user/:name', {
		templateUrl: 'views/users/user.html',
		controller: 'UserCtrl'
	});
}])

.controller('UserListCtrl', function($rootScope, $scope, $http, AuthService) {
	$rootScope.title = 'Laster..';

	// TODO: cache
	$http.get('api/user').success(function(ret) {
		$rootScope.title = "Brukerliste";
		var user_count = 0, sections = [
			{
				'paneltag': 'panel-info',
				'title': 'Beboere',
				'users': []
			},
			{
				'paneltag': 'panel-info',
				'title': 'Andre brukere',
				'users': []
			},
			{
				'paneltag': 'panel-info',
				'title': 'Utflyttede',
				'users': []
			}
		];

		$.each(ret, function(i, user)
		{
			var i = ($.inArray('beboer', user.groups) != -1
			         ? 0
			         : ($.inArray('utflyttet', user.groups) != -1
			            ? 2
			            : 1));
			sections[i].users.push(user);
			user_count++;
		});

		$scope.sections = sections;
		$scope.hidemail = !AuthService.isLoggedIn();
		$scope.user_count = user_count;
	});
})

.controller('UserCtrl', function($routeParams, $scope, $http, AuthService, Page) {
	Page.setTitle('Henter informasjon ..');

	$http.get('api/user/'+encodeURIComponent($routeParams['name'])).success(function(data) {
		for (group in data.groups)
		{
			var name = data.groups[group].name;

			var x = data.group_relations[name];
			var found = false;
			for (k in x)
			{
				if (x[k] == name)
				{
					found = true;
					data.groups[group].inherited = false;
					break;
				}
			}

			if (!found)
			{
				data.groups[group].inherited = x;
			}
			data.groups[group].groupadmin = AuthService.groupIsAdmin(name);
		}

		$scope.user = data;
		Page.setTitle(data.realname);
	});
});
