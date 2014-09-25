'use strict';

angular.module('intern.printer', ['ngRoute', 'intern.helper.page'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/printer/siste', {
		templateUrl: 'views/printer/last.html',
		controller: 'PrinterLastController'
	}).
	when('/printer/fakturere', {
		templateUrl: 'views/printer/fakturere.html',
		controller: 'PrinterUsageController'
	});
}])

.controller('PrinterLastController', function($http, $scope, Page) {
	Page.setTitle("Siste utskrifter");

	$http.get('api/printer/last').success(function(ret) {
		// TODO: error handling

		$scope.prints = ret;
	});
})

.controller('PrinterUsageController', function($http, $scope, Page) {
	Page.setTitle("Fakturering av utskrifter");

	$scope.$watch('date_from', function()
	{
		refreshData();
	});
	$scope.$watch('date_to', function()
	{
		refreshData();
	});

	$scope.changeMonth = function(modifyBy)
	{
		$scope.date_from = moment($scope.date_from).add('month', modifyBy).startOf('month').format("YYYY-MM-DD");
		$scope.date_to = moment($scope.date_to).add('month', modifyBy).endOf('month').format("YYYY-MM-DD");
	};

	// default date
	var d = moment().subtract('month', 1).startOf('month');
	$scope.date_from = d.format("YYYY-MM-DD");
	d.endOf('month');
	$scope.date_to = d.format("YYYY-MM-DD");

	// default view
	$scope.viewtype = 'summed';

	function parseData(rawdata)
	{
		var summer = function(prev)
		{
			this.num_jobs = 0;
			this.num_pages = 0;
			this.num_pages_real = 0;
			this.num_pages_alt = 0;
			this.amount = 0;
			this.amount_real = 0;
			this.amount_alt = 0;
			this.costlist = {};
			this.prev = prev;
			this.push = function(row, is_alt)
			{
				this.num_jobs += row.count_jobs;
				this.num_pages += row.sum_jobsize;
				this.amount += row.cost_each * row.sum_jobsize;
				this[(!is_alt ? 'amount_real' : 'amount_alt')] += row.cost_each * row.sum_jobsize;
				this[(!is_alt ? 'num_pages_real' : 'num_pages_alt')] += row.sum_jobsize;

				if (!this.costlist[row.cost_each]) this.costlist[row.cost_each] = 0;
				this.costlist[row.cost_each] += row.sum_jobsize;

				if (prev) prev.push(row, is_alt);
			};
		};

		var totals = new summer();
		var sections = {};
		var people = [];
		$(["beboer", "other"]).each(function(i, el)
		{
			sections[el] = {
				is_beboer: el == "beboer",
				printergroups: [],
				totals: new summer(totals),
				occurrences: 0
			};
		});

		$.each(rawdata.prints, function(key, printer) {
			var section = sections[printer.printername == "beboer" ? "beboer" : "other"];
			var p = {
				printername: printer.printername,
				comment: rawdata.texts[printer.printername],
				is_beboer: printer.printername == "beboer",
				users: []
			};
			var totals_p = new summer(section.totals);
			var is_alt = $.inArray(p.printername, rawdata.no_faktura) != -1;

			$.each(printer.users, function(key, u) {
				var user = {
					realname: rawdata.realnames[u.username],
					utflyttet: $.inArray(u.username, rawdata.utflyttet) != -1,
					months: []
				};
				var totals_u = new summer(totals_p);

				$(u.prints).each(function(i, print)
				{
					var t = new summer(totals_u);
					t.push(print, is_alt);
					t.name = print.jobyear+"-"+print.jobmonth;
					t.cost_each = print.cost_each;
					user.months.push(t);
				});

				user.show_sum = user.months.length > 1;
				user.num_rows = user.months.length + (user.show_sum ? 1 : 0);
				$.extend(user, totals_u);
				p.users.push(user);
				if (p.is_beboer) section.occurrences++;
				if ($.inArray(u.username, people) == -1) people.push(u.username);
			});

			$.extend(p, totals_p);
			p.is_comment_or_alt = p.comment || p.amount_alt;
			section.printergroups.push(p);
			if (!p.is_beboer) section.occurrences++;
		});

		totals.sections = sections;
		totals.unique_people = people.length;
		return totals;
	}

	function refreshData() {
		$scope.data = null;
		$http.get('api/printer/fakturere?from='+encodeURIComponent($scope.date_from)+'&to='+encodeURIComponent($scope.date_to)).success(function(ret) {
			// TODO: error handling
			$scope.data = parseData(ret);
		});
	}
}).

// helper for having both user details for personal account and group details for group account for the same loop
filter('printergroupsSummed', function() {
	return function(rows, is_beboer) {
		if (!is_beboer) {
			return rows;
		}
		var flatten = [];
		angular.forEach(rows, function(row) {
			angular.forEach(row.users, function(subrow) {
				flatten.push(subrow);
			});
		});
		return flatten;
	};
});