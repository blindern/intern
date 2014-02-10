/**
 * Format date for handlebar
 */
Handlebars.registerHelper("formatDate", function(datetime, format)
{
	return moment(datetime).format(format);
});