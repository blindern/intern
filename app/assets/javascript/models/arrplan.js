bs.models.Arrplan = Backbone.Model.extend({
	getSem: function()
	{
		var t = function(d)
		{
			var x = (d.getMonth() >= 6 ? "h" : "v");
			return x + d.getFullYear().toString().substr(2, 2);
		};

		if (this.get("type") == "comment")
		{
			return [t(new Date(this.get("date")))];
		}
		
		var t1 = new Date(this.get("start"));
		var t2 = new Date(this.get("end"));

		var s1 = t(t1);
		var s2 = t(t2);

		var r = [s1];
		if (s2 != s1) r.push(s2);
		return r;
	}
});
