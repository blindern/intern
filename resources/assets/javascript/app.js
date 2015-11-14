'use strict';

moment.lang('nb');

var module = angular.module('intern', [
	'ngRoute',
	'intern.helper.page',
	'intern.index',
	'intern.auth',
	'intern.arrplan',
	'intern.books',
	'intern.dugnaden',
	'intern.group',
	'intern.printer',
	'intern.user',
	'intern.matmeny'
]);

module.config(['$routeProvider', function($routeProvider) {
	$routeProvider.otherwise({redirectTo: '/'});
}]);

module.config(['$locationProvider', function($locationProvider) {
	// use HTML5 history API for nice urls
	$locationProvider.html5Mode(true);
}]);

module.config(['$httpProvider', function($httpProvider) {
	// we need to send this header so Larvel knows to send 401 and not 302
	$httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
}]);

module.filter('customdate', function() {
	return function(datetime, format) {
		return moment(datetime).format(format);
	};
});

// format number filter, norwegian style
module.filter('formatNum', function()
{
	return function(num, decimals) {
		var formatNumber = function(number, decimals)
		{
		    number = number.toFixed(decimals) + '';
		    let x = number.split('.');
		    let x1 = x[0];
		    let x2 = x.length > 1 ? ',' + x[1] : '';
		    var rgx = /(\d+)(\d{3})/;
		    while (rgx.test(x1)) {
		        x1 = x1.replace(rgx, '$1' + ' ' + '$2');
		    }
		    return x1 + x2;
		}

		if (typeof(decimals) != "number") decimals = 2;
		return formatNumber(parseFloat(num), decimals);
	};
});

// add 'auto-focus' as an attribute to a tag
// source: http://stackoverflow.com/a/20865048
module.directive('autoFocus', function($timeout) {
    return {
        restrict: 'AC',
        link: function(_scope, _element) {
        	$timeout(function(){
                _element[0].focus();
            }, 100);
        }
    };
});

require('./arrplan')
require('./auth')
require('./books')
require('./dugnaden')
require('./group')
require('./helper.page')
require('./index')
require('./matmeny')
require('./printer')
require('./user')
