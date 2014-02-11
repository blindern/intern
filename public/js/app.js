var bs = {views: {}, models: {}, collections: {}, root: '/intern', router: null};

moment.lang('nb');


Handlebars.registerHelper("formatNum", function(num)
{
	return formatNumber(parseFloat(num));
});

function formatNumber(number)
{
    number = number.toFixed(2) + '';
    x = number.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? ',' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ' ' + '$2');
    }
    return x1 + x2;
}



/**
 ***************************************
 * Array Storage Driver
 * used to store our views
 * source: http://net.tutsplus.com/tutorials/javascript-ajax/combining-laravel-4-and-backbone/
 ***************************************
 */
var ArrayStorage = function(){
  this.storage = {};
};
ArrayStorage.prototype.get = function(key)
{
  return this.storage[key];
};
ArrayStorage.prototype.set = function(key, val)
{
  return this.storage[key] = val;
};




bs.views.BaseView = Backbone.View.extend({
	initialize: function()
	{
		this.el = $("#content");
	},

	/**
	 * Set our storage driver
	 */
	templateDriver: new ArrayStorage,
 
	/**
	 * Set the base path for where our views are located
	 */
	viewPath: '/intern/views/',
 
	/**
	 * Get the template, and apply the variables
	 */
	template: function()
	{
		var view, data, template, self;
 
		switch(arguments.length)
		{
			case 1:
				view = this.view;
				data = arguments[0];
				break;
			case 2:
				view = arguments[0];
				data = arguments[1];
				break;
		}
 
		template = this.getTemplate(view, false);
		self = this;
 
		return template(data, function(partial)
		{
			return self.getTemplate(partial, true);
		});
	},
 
	/**
	 * Facade that will help us abstract our storage engine,
	 * should we ever want to swap to something like LocalStorage
	 */
	getTemplate: function(view, isPartial)
	{
		return this.templateDriver.get(view) || this.fetch(view, isPartial);
	},
 
	/**
	 * Facade that will help us abstract our storage engine,
	 * should we ever want to swap to something like LocalStorage
	 */
	setTemplate: function(name, template)
	{
		return this.templateDriver.set(name, template);
	},
 
	/**
	 * Function to retrieve the template via ajax
	 */
	fetch: function(view, isPartial)
	{
		var markup = $.ajax({
			async: false,
 
			//the URL of our template, we can optionally use dot notation
			url: this.viewPath + view.split('.').join('/') + '.hbs'
		}).responseText;
 
		return isPartial
			? markup
			: this.setTemplate(view, Handlebars.compile(markup));
	}
});


bs.views.PrinterFakturere = bs.views.BaseView.extend({
	view: "printer.fakturere",
	events: {
		"change select[name=format]": 'formatChanged',
		"change input[name=date_from], input[name=date_to]": 'dateChanged'
	},

	render: function()
	{
		this.$el.html(this.template({
			from: '2013-04-01',
			to:   '2014-01-31'
		}));
		this.dateChanged();

		this.subel = this.$("#fakturere_data");
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
		if (this.subel) this.subel.html("Laster data");
		this.collection.fetch().done(function()
		{
			if (self.subv) self.subv.render();
		});
	},

	setSummed: function()
	{
		this.subv = new bs.views.PrinterFakturereSummed({
			el: this.subel
		});
		this.subv.par = this;
		this.subv.render();
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

function ViewHandler(baseView) {
	var current;

	this.push = function(view, defers) {
		// Remove old view
		// TODO: if (current) current.clear();
		//if (current) {
			$(baseView).empty().html('<p>Laster data..</p>');

		//}
 
		current = view;
 
		if (!Array.isArray(defers)) defers = [defers];
		$.when.apply($, defers).done(function() {
			$(baseView).empty();
			view.render();
			baseView.append(view.$el);
		}).fail(function() {
			console.error("Unable to load", arguments);
		});
	};
 
	this.clear = function() {
		if (current) {
			current.clear();
			current = undefined;
		}
	};
}


$(function() {
	var vh = new ViewHandler($("#content"));
	var inited = false; // prevent catchAll to loop at page loading
	var router = Backbone.Router.extend({
		routes: {
			//"": "index",
			"printer/fakturere": "printer_fakturere",
			"printer/siste": "printer_last",
			'groups': 'grouplist',
			'group/:name': 'group',
			'profile': 'profile',
			'users': 'userlist',
			'user/:name': 'user',
			'*catchAll': 'catchAll'
		},

		index: function()
		{
			alert("index");
		},

		printer_fakturere: function()
		{
			$("#page_title").text("Fakturering av utskrifter");
			var c = new bs.collections.Printers();
			var v = new bs.views.PrinterFakturere({
				collection: c
			});
			vh.push(v);
		},

		printer_last: function()
		{
			$("#page_title").text("Siste utskrifter");
			var c = new bs.collections.Prints();
			var v = new bs.views.PrinterLast({
				collection: c
			});
			vh.push(v, c.fetch());
		},

		grouplist: function()
		{
			$("#page_title").text("Gruppeliste");
			var c = new bs.collections.Groups();
			var v = new bs.views.Groups({
				collection: c
			});
			vh.push(v, c.fetch());
		},

		group: function(name)
		{
			$("#page_title").text(name+" (gruppe)");
			var m = new bs.models.Group({
				'unique_id': name
			});
			var v = new bs.views.Group({
				model: m
			});
			vh.push(v, m.fetch());
		},

		userlist: function()
		{
			$("#page_title").text("Brukerliste");
			var c = new bs.collections.Users();
			var v = new bs.views.Users({
				collection: c
			});
			vh.push(v, c.fetch());
		},

		user: function(name)
		{
			$("#page_title").text("Bruker");
			var m = new bs.models.User({
				'username': name
			});
			var v = new bs.views.User({
				model: m
			});
			vh.push(v, m.fetch());
		},

		profile: function()
		{
			$("#page_title").text("Brukerprofil");
			var v = new bs.views.Profile();
			vh.push(v);
		},

		catchAll: function(addr)
		{
			if (inited) window.location.href = bs.root + '/' + addr;
		}
	});
	bs.router = new router();

	Backbone.history.start({ pushState: true, root: window.bs.root, hashState: false });
	inited = true;
});


// make active menu element update
(function()
{
	var x = null;
	$(document).on("click", ".nav a", function()
	{
		x = $(this).parent("li");
	});
	$(function() {
		bs.router.bind("all", function(route, router, test)
		{
			// TODO: match by URL (inline links)
			$(".nav .active").removeClass("active");
			if (x) x.addClass("active");
		});
	});
})();


// push local links through router
$(document).on("click", "a:not([data-bypass])", function(evt) {
	var app = {root: window.bs.root};
	var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
	var root = location.protocol + "//" + location.host + app.root;

	if (href.prop && href.prop.slice(0, root.length) === root && href.attr != '#') {
		if (href.attr.substring(0, app.root.length) == app.root) href.attr = href.attr.substring(app.root.length);
		if (href.attr.substring(0, root.length) == root) href.attr = href.attr.substring(root.length);
		evt.preventDefault();
		Backbone.history.navigate(href.attr, true);
	}
});


// check if we can admin a group
bs.groupIsAdmin = function(groupName, realadmin)
{
	if (!window.logged_in) return false;
	if (!realadmin && window.useradmin) return true;

	var adminGroup = groupName.indexOf('_admin') != -1 ? groupName : groupName + '_admin';
	return adminGroup in window.user.groups;
};