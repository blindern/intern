'use strict';

angular.module('intern.index', ['ngRoute', 'intern.helper.page', 'intern.matmeny'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl: require('../views/index.html'),
		controller: 'IndexCtrl'
	});
}])

.controller('IndexCtrl', function(Page, Matmeny, $http, $scope) {
	Page.setTitle('Foreningen Blindern Studenterhjem');

    // hent neste arrplan
    $http.get('api/arrplan/next', {params: {count: 6}}).success(function(ret) {
        $scope.arrplan = ret;
    });

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