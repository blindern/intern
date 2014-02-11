bs.models.Group = Backbone.Model.extend({
	url: function()
	{
		// TODO: use rootUrl instead?
		return '/intern/api/group/'+this.get('unique_id');
	}
});
bs.collections.Groups = Backbone.Collection.extend({
	model: bs.models.Group,
	url: '/intern/api/group'
});