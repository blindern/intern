		routes: {
			'printer/fakturere': 'printer_fakturere',
			'printer/siste': 'printer_last',
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