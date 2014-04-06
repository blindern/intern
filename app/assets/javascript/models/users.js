bs.models.User = Backbone.Model.extend({
	url: function()
	{
		// TODO: use rootUrl instead?
		return '/intern/api/user/'+this.get('username');
	}
});
bs.collections.Users = Backbone.Collection.extend({
	model: bs.models.User,
	url: '/intern/api/user'
});