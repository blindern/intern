bs.views.PrinterLast = bs.views.BaseView.extend({
	view: 'printer.last',

	render: function()
	{
		this.$el.html(this.template({
			'prints': this.collection.toJSON()
		}));
	}
});