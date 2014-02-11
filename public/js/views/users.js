bs.views.Users = bs.views.BaseView.extend({
	view: 'users.list',

	render: function()
	{
		var data = {
			"sections": [
				{
					'paneltag': 'panel-info',
					'title': 'Beboere',
					'users': []
				},
				{
					'paneltag': 'panel-info',
					'title': 'Andre brukere',
					'users': []
				}
			],
			'hidemail': !bs.inGroup(['useradmin', 'kollegiet', 'dugnaden', 'foreningsstyret'])
		};

		this.collection.each(function(model)
		{
			var groups = model.get("groups");
			data.sections[$.inArray('beboer', groups) == -1 ? 1 : 0].users.push(model.toJSON());
		});

		this.$el.html(this.template(data));
	}
});

bs.views.User = bs.views.BaseView.extend({
	view: 'users.user',

	render: function()
	{
		var data = this.model.toJSON();

		/*var groups = [];
		$(data.groups).each(function(i, x)
		{
			groups.push({
				'name': x,
				'groupadmin': bs.groupIsAdmin(x)
			});
		});

		data.groups = groups;*/
		this.$el.html(this.template(data));
	}
});
