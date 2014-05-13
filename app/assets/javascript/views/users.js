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
		for (group in data.groups)
		{
			var name = data.groups[group].name;

			var x = data.group_relations[name];
			var found = false;
			for (k in x)
			{
				if (x[k] == name)
				{
					found = true;
					data.groups[group].inherited = false;
					break;
				}
			}

			if (!found)
			{
				data.groups[group].inherited = x;
			}
			data.groups[group].groupadmin = bs.groupIsAdmin(name);
		}

		this.$el.html(this.template(data));
		bs.title(this.model.get("realname"));
	}
});
