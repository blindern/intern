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

		// daily statistics
		var daily = {};
		var d = moment(rawdata.from);
		var d_end = moment(rawdata.to);
		while (true)
		{
			daily[d.format('YYYY-MM-DD')] = 0;
			d = d.add('day', 1);
			if (!d.isBefore(d_end)) break;
		}
		$.each(rawdata.daily, function(i, row)
		{
			daily[row['jobday']] = row['sum_jobsize'];
		});

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
		totals.daily = daily;
		return totals;
	}

	function refreshData() {
		$scope.data = null;
		$http.get('api/printer/fakturere?from='+encodeURIComponent($scope.date_from)+'&to='+encodeURIComponent($scope.date_to), {cache:true}).success(function(ret) {
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
}).

// chart for daily usage
// using D3.js
directive('printerVisualization', function() {
	var margin = {top: 20, right: 30, bottom: 30, left: 50},
	    width = 960 - margin.left - margin.right,
	    height = 150 - margin.top - margin.bottom;

	return {
		restrict: 'E',
		link: function(scope, element, attrs) {
			var svg = d3.select(element[0])
				.append('svg')
				.attr('class', 'printerchart')
				.attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

			var parseDate = d3.time.format('%Y-%m-%d').parse;
			var myTimeFormatter = function(date) {
				return moment(date).format("D. MMM");
			};

			var x = d3.time.scale().range([0, width]);
			var y = d3.scale.linear().range([height, 0]);
			var xAxis = d3.svg.axis().scale(x).orient('bottom').tickFormat(myTimeFormatter);
			var yAxis = d3.svg.axis().scale(y).orient('left').ticks(6);
			var area = d3.svg.area()
			    .x(function(d) { return x(d.date); })
			    .y0(height)
			    .y1(function(d) { return y(d.value); });

			scope.$watch('data', function(data) {
				// clear the chart
				svg.selectAll('*').remove();

				// we must have something to draw
				if (!data) return;

				var newdata = [];
				$.each(data.daily, function(i, elm) {
					newdata.push({
						date: parseDate(i),
						value: +elm
					});
				});

				x.domain([parseDate(scope.date_from), parseDate(scope.date_to)]);
				y.domain([0, d3.max(newdata, function(d) { return d.value; })]);

				svg.append("path")
				   .datum(newdata)
				   .attr("class", "area")
				   .attr("d", area);

				svg.append("g").attr('class', 'x axis').attr('transform', 'translate(0,'+height+')').call(xAxis);
				svg.append('g').attr('class', 'y axis').call(yAxis)
				   .append('text')
				   .attr("transform", "rotate(-90)")
				   .attr("y", 6)
				   .attr("dy", ".71em")
				   .style("text-anchor", "end")
				   .text("Antall utskrifter");
			});

		}
	};
});