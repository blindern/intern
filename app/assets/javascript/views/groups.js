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
		this.$el.html(this.template(this.model.toJSON()));
	}
});