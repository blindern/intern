bs.views.Bokdatabase = bs.views.BaseView.extend({
	view: 'bokdatabase.index',

	render: function()
	{
		this.$el.html(this.template({}));
	}
});
