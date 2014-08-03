bs.collections.Arrplan = Backbone.Collection.extend({
	model: bs.models.Arrplan,
	url: '/intern/api/arrplan',
	filterSem: function(sem)
	{
		var r = [];
		this.each(function(x)
		{
			if ($.inArray(sem, x.getSem()) != -1)
			{
				r.push(x);
			}
		});
		return r;
	}
});