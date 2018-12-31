'use strict';

angular.module('intern.group', ['ngRoute', 'intern.helper.page'])

.config(['$routeProvider', function($routeProvider) {

}])

.controller('GroupListCtrl', function($http, $scope, Page) {
	Page.setTitle("Laster gruppeliste ..");

	$http.get('api/group').success(function(ret) {
		// TODO: errors

		Page.setTitle("Gruppeliste");
		$scope.groups = ret;
	});
})

.controller('GroupCtrl', function($http, $scope, $routeParams, AuthService, Page) {
	Page.setTitle("Laster gruppe ["+$routeParams['name']+"] ..");

	$http.get('api/group/'+encodeURIComponent($routeParams['name'])).success(function(data) {
		Page.setTitle('Gruppe: '+data.name);

		var user;
		for (user in data.members)
		{
			var name = data.members[user].username;

			var x = data.members_relation[name];
			var found = false;
			for (let k in x)
			{
				if (x[k] == data.name)
				{
					found = true;
					data.members[user].inherited = false;
					break;
				}
			}

			if (!found)
			{
				data.members[user].inherited = x;
			}
			data.members[user].groupadmin = AuthService.groupIsAdmin(name);
		}

		$scope.group = data;
		console.log(data);
	});
});
