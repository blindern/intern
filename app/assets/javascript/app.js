		routes: {
			'printer/fakturere': 'printer_fakturere',
			'printer/siste': 'printer_last',
			'groups': 'grouplist',
			'group/:name': 'group',
		},

		printer_fakturere: function()
		{
			bs.title("Fakturering av utskrifter");
			var c = new bs.collections.Printers();
			var v = new bs.views.PrinterFakturere({
				collection: c
			});
			vh.push(v);
		},

		printer_last: function()
		{
			bs.title("Siste utskrifter");
			var c = new bs.collections.Prints();
			var v = new bs.views.PrinterLast({
				collection: c
			});
			vh.push(v, c.fetch());
		},

		grouplist: function()
		{
			bs.title("Gruppeliste");
			var c = new bs.collections.Groups();
			var v = new bs.views.Groups({
				collection: c
			});
			vh.push(v, c.fetch());
		},

		group: function(name)
		{
			bs.title("Laster...");
			var m = new bs.models.Group({
				'unique_id': name
			});
			var v = new bs.views.Group({
				model: m
			});
			vh.push(v, m.fetch());
		},
