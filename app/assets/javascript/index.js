'use strict';

angular.module('intern.index', ['ngRoute', 'intern.helper.page', 'intern.matmeny'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl: 'views/index.html',
		controller: 'IndexCtrl'
	});
}])

.controller('IndexCtrl', function(Page, Matmeny, $http, $scope) {
	Page.setTitle('Foreningen Blindern Studenterhjem');

    // hent matmeny
    var today = moment().format('YYYY-MM-DD');
    var tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
    Matmeny.query({'from': today, 'to': tomorrow}, function(ret) {
        var items = {};
        angular.forEach(ret, function(item) {
            items[item.day] = item;
        });

        var m = {};
        if (items[today]) m.today = items[today];
        if (items[tomorrow]) m.tomorrow = items[tomorrow];
        $scope.matmeny = m;
        $scope.matmenydate = {
            today: today,
            tomorrow: tomorrow
        };
    });
});