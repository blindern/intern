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

.controller('VisSem', function($scope, $routeParams, arrplan, ArrplanService, Page) {
	Page.setTitle('Arrangementplan på Blindern Studenterhjem');
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
			return $http.get('api/arrplan', {cache: 'true', params: {'invalidate': 1}});
		},
		getSem: function(arrevent) {
			var t = function(d)
			{
				var x = (d.month() >= 6 ? "h" : "v");
				return x + d.year().toString().substr(2, 2);
			};

			if (arrevent.type == "comment")
			{
				return [t(moment(arrevent.date))];
			}

			var s1 = t(moment(arrevent.start));
			var s2 = t(moment(arrevent.end));

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
