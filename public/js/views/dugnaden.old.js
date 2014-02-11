bs.views.DugnadOld = bs.views.BaseView.extend({
	view: 'dugnad.old.overview',

	events: {
		"change select[name=dugnad]": 'dugnadChanged'
	},

	render: function()
	{
		var d = [];
		this.collection.each(function(x)
		{
			d.push({
				'id': x.get('id'),
				'date': x.get('date'),
				'people_count': x.get('people').length
			});
		})

		this.$el.html(this.template({
			'dugnader': d
		}));
		//this.$("#dugnad_liste").html(this.getTemplate('dugnad.old.overview', 
		//this.$el.html(this.template());
	},

	dugnadChanged: function()
	{
		var wrap = this.$("#dugnad_liste");
		wrap.empty();

		var show = this.$("select[name=dugnad]").val();
		var self = this;
		this.collection.each(function(x)
		{
			if (x.get('id') == show)
			{
				$.each(x.get('people'), function(i, person)
				{
					wrap.append(self.getTemplate('dugnad.old.item')({
						'name': person['name'],
						'room': person['room'],
						'date': x.get('date')
					}));
				});
			}
		});
	}
});