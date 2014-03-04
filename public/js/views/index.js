bs.views.Index = bs.views.BaseView.extend({
	view: 'index',

	render: function()
	{
		var list = window.user;
		for (group in list.groups)
		{
			console.log(group);
			list.groups[group].groupadmin = bs.groupIsAdmin(group, true);
		}

		this.$el.html(this.template({'user': list}));
	}
});