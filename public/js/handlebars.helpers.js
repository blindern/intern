/**
 * Format date for handlebar
 */
Handlebars.registerHelper("formatDate", function(datetime, format)
{
	return moment(datetime).format(format);
});

Handlebars.registerHelper("groupAdmin", function(groupName)
{
	return window.bs.groupIsAdmin(groupName);
});