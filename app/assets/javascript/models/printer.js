bs.models.User = Backbone.Model.extend({

});

bs.collections.Users = Backbone.Collection.extend({
	model: bs.models.User
})

bs.models.Printer = Backbone.Model.extend({
	initialize: function(attributes) {
		var self = this;
		this.users = new bs.collections.Users(attributes.users, {
			comparator: function(leftuser, rightuser)
			{
				var realnames = self.collection.realnames;
				return realnames[leftuser.get("username").toLowerCase()].localeCompare(realnames[rightuser.get("username").toLowerCase()]);
			}
		});
	}
});

bs.collections.Printers = Backbone.Collection.extend({
	model: bs.models.Printer,
	comparator: 'printername',

	// filled by parser
	fromDate: '',
	toDate: '',
	no_faktura: [],
	realnames: {},
	texts: {},

	url: function()
	{
		return '/intern/api/printer/fakturere?from='+this.fromDate+'&to='+this.toDate;
	},

	setDate: function(from, to)
	{
		this.fromDate = from;
		this.toDate = to;

		console.log("from", from, "to", to);
	},

	parse: function(data)
	{
		this.fromDate = data.from;
		this.toDate = data.to;
		this.no_faktura = data.no_faktura;
		this.realnames = data.realnames;
		this.texts = data.texts;
		this.utflyttet = data.utflyttet;

		return data.prints;
	}
});