Handlebars.registerHelper("groupAdmin", function(groupName)
{
	return window.bs.groupIsAdmin(groupName);
});