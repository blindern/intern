bs.models.DugnadOld = Backbone.Model.extend({
	
});
bs.collections.DugnadOld = Backbone.Collection.extend({
	model: bs.models.DugnadOld,
	url: '/intern/api/dugnaden/old'
});