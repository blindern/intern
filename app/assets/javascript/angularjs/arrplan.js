'use strict';

angular.module('intern.arrplan', ['ngRoute', 'intern.helper.page'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/arrplan', {
		redirectTo: function() {
			var d = new Date();
			var sem = (d.getMonth() >= 6 ? "h" : "v") + d.getFullYear().toString().substr(2, 2);
			return "arrplan/"+sem;
		}
	})
	.when('/arrplan/:sem', {
		templateUrl: 'views/arrplan/oversikt.html',
		controller: 'VisSem',
		resolve: {
			arrplan: function(ArrplanService) {
				return ArrplanService.get();
			}
		}
	});
}])

.controller('VisSem', function($rootScope, $scope, $routeParams, arrplan, ArrplanService) {
	$rootScope.title = 'Arrangementplan på Blindern Studenterhjem';
	arrplan = arrplan.data;

	// find sections
	var sections = [];
	var sections_id = {};
	$.each(arrplan, function(i, x)
	{
		$.each(ArrplanService.getSem(x), function(i, sem)
		{
			var x = sem.substr(0, 1);
			var year = '20' + sem.substring(1);
			if (!sections_id[sem])
			{
				sections.push({
					'sem': sem,
					'text': (x == "h" ? "Høst " : "Vår ") + year,
					'link': 'arrplan/' + sem,
					'sortkey': year + (x == "h" ? '2' : '1')
				});
				sections_id[sem] = true;
			}
		});
	});

	$scope.sections = sections;
	$scope.sem = $routeParams.sem;
	$scope.arrplan = arrplan;
})

.factory("ArrplanService", function($http) {
	return {
		get: function() {
			return $http.get('api/arrplan', {cache: 'true'});
		},
		getSem: function(arrevent) {
			var t = function(d)
			{
				var x = (d.getMonth() >= 6 ? "h" : "v");
				return x + d.getFullYear().toString().substr(2, 2);
			};

			if (arrevent.type == "comment")
			{
				return [t(new Date(arrevent.date))];
			}
			
			var t1 = new Date(arrevent.start);
			var t2 = new Date(arrevent.end);

			var s1 = t(t1);
			var s2 = t(t2);

			var r = [s1];
			if (s2 != s1) r.push(s2);
			return r;
		}
	};
})

.filter('filterSem', function(ArrplanService) {
	return function(input, matchSem) {
		return $.grep(input, function(input) {
			return $.inArray(matchSem, ArrplanService.getSem(input)) != -1;
		});
	}
});