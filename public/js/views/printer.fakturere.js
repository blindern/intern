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
		this.subv = new bs.views.PrinterFakturereList({
			el: this.subel
		});
		this.subv.par = this;

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

	setSummed: function()
	{
		this.subv.view = 'printer.fakturere.summed';
		this.subv.render();
	},

	setDetailed: function()
	{
		this.subv.view = 'printer.fakturere.detailed';
		this.subv.render();
	},

	clearSub: function()
	{
		this.subv.empty();
	}
});

bs.views.PrinterFakturereList = bs.views.BaseView.extend({
	view: 'printer.fakturere.summed', // is changed by parent

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
			this.costlist = {};
			this.prev = prev;
			this.push = function(row, is_alt)
			{
				this.num_jobs += row.count_jobs;
				this.num_pages += row.sum_jobsize;
				this.amount += row.cost_each * row.sum_jobsize;
				this[(!is_alt ? 'amount_real' : 'amount_alt')] += row.cost_each * row.sum_jobsize;
				this[(!is_alt ? 'num_pages_real' : 'num_pages_alt')] += row.sum_jobsize;

				if (!this.costlist[row.cost_each]) this.costlist[row.cost_each] = 0;
				this.costlist[row.cost_each] += row.sum_jobsize;

				if (prev) prev.push(row, is_alt);
			};
		};

		var totals = new summer();
		var sections = {};
		$(["beboer", "other"]).each(function(i, el)
		{
			sections[el] = {
				is_beboer: el == "beboer",
				printergroups: [],
				totals: new summer(totals)
			};
		});

		var self = this;
		this.par.collection.each(function(printer) {
			var section = sections[printer.get("printername") == "beboer" ? "beboer" : "other"];
			var p = {
				printername: printer.get("printername"),
				comment: self.par.collection.texts[printer.get("printername")],
				is_beboer: printer.get("printername") == "beboer",
				users: []
			};
			var totals_p = new summer(section.totals);
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
			p.is_comment_or_alt = p.comment || p.amount_alt;
			section.printergroups.push(p);
		});

		totals.sections = sections;
		return totals;
	}
});