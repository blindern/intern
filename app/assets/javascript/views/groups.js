bs.views.Groups = bs.views.BaseView.extend({
	view: 'groups.list',

	render: function()
	{
		this.$el.html(this.template({
			'groups': this.collection.toJSON()
		}));
	}
});

bs.views.Group = bs.views.BaseView.extend({
	view: 'groups.group',

	render: function()
	{
		var data = this.model.toJSON();
		var user;
		for (user in data.members)
		{
			var name = data.members[user].username;

			var x = data.members_relation[name];
			var found = false;
			for (k in x)
			{
				if (x[k] == data.name)
				{
					found = true;
					data.members[user].inherited = false;
					break;
				}
			}

			if (!found)
			{
				data.members[user].inherited = x;
			}
			data.members[user].groupadmin = bs.groupIsAdmin(name);
		}

		this.$el.html(this.template(data));
		bs.title('Gruppe: '+this.model.get("name"));
	}
});