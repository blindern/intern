bs.views.PrinterFakturere = bs.views.BaseView.extend({
	view: "printer.fakturere",
	events: {
		"change select[name=format]": 'formatChanged',
		"change input[name=date_from], input[name=date_to]": 'dateChanged'
	},

	render: function()
	{
		// set default period to be last month
		var d = moment().subtract('month', 1).startOf('month');
		var from = d.format("YYYY-MM-DD");
		d.endOf('month');
		var to = d.format("YYYY-MM-DD");

		this.$el.html(this.template({
			from: from,
			to:   to
		}));

		this.subel = this.$("#fakturere_data");
		this.setSummed(true);
		this.dateChanged();
	},

	formatChanged: function()
	{
		switch (this.$("select[name=format]").val())
		{
			case "summed":
				this.setSummed();
				break;

			case "detailed":
				this.setDetailed();
				break;

			default:
				this.clearSub();
		}
	},

	dateChanged: function()
	{
		this.collection.setDate(this.$('input[name=date_from]').val(), this.$('input[name=date_to]').val());
		var self = this;
		if (this.subel) this.subel.html("Laster data...");
		this.collection.fetch().done(function()
		{
			if (self.subv)
				self.subv.render();
		});
	},

	setSummed: function(dont_render)
	{
		this.subv = new bs.views.PrinterFakturereSummed({
			el: this.subel
		});
		this.subv.par = this;
		if (!dont_render) this.subv.render();
	},

	setDetailed: function()
	{
		this.subv = new bs.views.PrinterFakturereDetailed({
			el: this.subel
		});
		this.subv.par = this;
		this.subv.render();
	},

	clearSub: function()
	{
		this.subv.empty();
	}
});

bs.views.PrinterFakturereSummed = bs.views.BaseView.extend({
	view: 'printer.fakturere.summed',

	render: function()
	{
		// base structure for view
		var groups = {};
		$(["beboer", "other"]).each(function(i, el)
		{
			groups[el] = {
				is_beboer: el == "beboer",
				printergroups: [],
				sum_pages: 0,
				sum_cash: 0,
				alt_cash: false,
				sum_cash_alt: 0
			};
		});
		var total_amount = 0;

		var self = this;
		this.par.collection.each(function(printer) {
			var section = groups[printer.get("printername") == "beboer" ? "beboer" : "other"];
			
			var p = {
				users: [],
				printername: printer.get("printername"),
				amount: 0,
				comment: self.par.collection.texts[printer.get("printername")],
				sum_cash_alt: 0,
				is_comment: false,
				costlist: {}
			};

			printer.users.each(function(u) {
				var amount = 0;
				var costlist = {};
				$(u.get("prints")).each(function(i, print)
				{
					amount += print.cost_each * print.sum_jobsize;
					section.sum_pages += print.sum_jobsize;

					if (!costlist[print.cost_each]) costlist[print.cost_each] = 0;
					costlist[print.cost_each] += print.sum_jobsize;

					if (!p.costlist[print.cost_each]) p.costlist[print.cost_each] = 0;
					p.costlist[print.cost_each] += print.sum_jobsize;
				});

				if ($.inArray(p.printername, self.par.collection.no_faktura) != -1)
				{
					section.sum_cash_alt += amount;
					p.sum_cash_alt += amount;
				}
				else
				{
					section.sum_cash += amount;
					p.amount += amount;
				}

				p.users.push({
					"realname": self.par.collection.realnames[u.get("username")],
					"utflyttet": $.inArray(u.get("username"), self.par.collection.utflyttet) != -1,
					"amount": amount,
					"costlist": costlist
				});
			});

			if (p.sum_cash_alt > 0)
			{
				p.alt_cash = true;
				section.alt_cash = true;
			}
			total_amount += p.amount;

			if (p.comment || p.sum_cash_alt > 0) p.is_comment = true;
			section.printergroups.push(p);
		});

		this.$el.html(this.template({
			from: this.par.collection.fromDate,
			to: this.par.collection.toDate,
			sum_cash: total_amount
		}));

		var self = this;
		$(["beboer", "other"]).each(function(i, el)
		{
			self.$("#printer_group_"+el).html(self.getTemplate('printer.fakturere.summed_column')({
				data: groups[el]
			}));
		});
	}
});

bs.views.PrinterFakturereDetailed = bs.views.BaseView.extend({
	view: 'printer.fakturere.detailed',

	render: function()
	{
		var data = this.getData();

		this.$el.html(this.template({
			from: this.par.collection.fromDate,
			to: this.par.collection.toDate,
			data: data
		}));
	},

	getData: function()
	{
		var summer = function(prev)
		{
			this.num_jobs = 0;
			this.num_pages = 0;
			this.num_pages_real = 0;
			this.num_pages_alt = 0;
			this.amount = 0;
			this.amount_real = 0;
			this.amount_alt = 0;
			this.prev = prev;
			this.push = function(row, is_alt)
			{
				this.num_jobs += row.count_jobs;
				this.num_pages += row.sum_jobsize;
				this.amount += row.cost_each * row.sum_jobsize;
				this[(!is_alt ? 'amount_real' : 'amount_alt')] += row.cost_each * row.sum_jobsize;
				this[(!is_alt ? 'num_pages_real' : 'num_pages_alt')] += row.sum_jobsize;

				if (prev) prev.push(row, is_alt);
			};
		};

		var printers = [];
		var totals = new summer();

		var self = this;
		this.par.collection.each(function(printer) {
			var p = {
				printername: printer.get("printername"),
				comment: self.par.collection.texts[printer.get("printername")],
				is_beboer: printer.get("printername") == "beboer",
				users: []
			};
			var totals_p = new summer(totals);
			var is_alt = $.inArray(p.printername, self.par.collection.no_faktura) != -1;

			printer.users.each(function(u) {
				var user = {
					realname: self.par.collection.realnames[u.get("username")],
					utflyttet: self.par.collection.utflyttet[u.get("username")],
					months: []
				};
				var totals_u = new summer(totals_p);

				$(u.get("prints")).each(function(i, print)
				{
					var t = new summer(totals_u);
					t.push(print, is_alt);
					t.name = print.jobyear+"-"+print.jobmonth;
					t.cost_each = print.cost_each;
					user.months.push(t);
				});

				user.show_sum = user.months.length > 1;
				user.num_rows = user.months.length + (user.show_sum ? 1 : 0);
				$.extend(user, totals_u);
				p.users.push(user);
			});

			$.extend(p, totals_p);
			printers.push(p);
		});

		totals.printergroups = printers;
		return totals;
	}
});