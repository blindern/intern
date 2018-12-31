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
