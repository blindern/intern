'use strict';

moment.locale('nb');

var module = angular.module('intern', [
	'ngRoute',
	'intern.helper.page',
	'intern.index',
	'intern.auth',
	'intern.arrplan',
	'intern.books',
	'intern.bukker',
	'intern.dugnaden',
	'intern.group',
	'intern.printer',
	'intern.user',
	'intern.matmeny',
	'intern.googleapps'
]);


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
require('./bukker')
require('./dugnaden')
require('./googleapps')
require('./group')
require('./helper.page')
require('./index')
require('./matmeny')
require('./printer')
require('./user')
