bs.views.Profile = bs.views.BaseView.extend({
	view: 'profile',

	render: function()
	{
		var list = window.user;
		for (group in list.groups)
		{
			list.groups[group].groupadmin = bs.groupIsAdmin(group, true);
		}

		this.$el.html(this.template(list));
	}
});