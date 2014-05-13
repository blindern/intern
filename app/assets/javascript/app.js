var bs = {views: {}, models: {}, collections: {}, root: '/intern', router: null};

moment.lang('nb');


Handlebars.registerHelper("formatNum", function(num, decimals)
{
	if (typeof(decimals) != "number") decimals = 2;
	return formatNumber(parseFloat(num), decimals);
});

function formatNumber(number, decimals)
{
    number = number.toFixed(decimals) + '';
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

bs.title = function(title)
{
	$("#page_title").text(title);
	document.title = title;
};

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
			"": "index",
			"printer/fakturere": "printer_fakturere",
			"printer/siste": "printer_last",
			'groups': 'grouplist',
			'group/:name': 'group',
			'users': 'userlist',
			'user/:name': 'user',
			'dugnaden/old/list': 'dugnaden_liste',
			'*catchAll': 'catchAll'
		},

		index: function()
		{
			bs.title("Foreningen Blindern Studenterhjem");
			var v = new bs.views.Index();
			vh.push(v);
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

		userlist: function()
		{
			bs.title("Brukerliste");
			var c = new bs.collections.Users();
			var v = new bs.views.Users({
				collection: c
			});
			vh.push(v, c.fetch());
		},

		user: function(name)
		{
			bs.title("Bruker");
			var m = new bs.models.User({
				'username': name
			});
			var v = new bs.views.User({
				model: m
			});
			vh.push(v, m.fetch());
		},

		dugnaden_liste: function()
		{
			bs.title("Dugnadsinnkallinger");
			var c = new bs.collections.DugnadOld();
			var v = new bs.views.DugnadOld({
				collection: c
			});
			vh.push(v, c.fetch());
		},

		catchAll: function(addr)
		{
			if (!addr) addr = '';
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
bs.groupIsAdmin = function(group, realadmin)
{
	if (!realadmin && window.useradmin) return true;
	return (group in window.user.groupowner_relations);
};

// check if we are in a group
bs.inGroup = function(groupNames, forceRealMember)
{
	if (!window.logged_in) return false;
	if (!forceRealMember && window.useradmin) return true;

	if (!(groupNames instanceof Array))
	{
		groupNames = [groupNames];
	}

	for (var i = 0; i < groupNames.length; i++)
	{
		var group = groupNames[i];
		if (group in window.user.group_relations) return true;
	};

	return false;
};