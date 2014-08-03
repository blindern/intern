bs.views.Arrplan = bs.views.BaseView.extend({
	view: 'arrplan.oversikt',

	events: {
		"click .nav a": 'semChanged'
	},

	initialize: function()
	{
		var d = new Date();
		this.sem = (d.getMonth() >= 6 ? "h" : "v") + d.getFullYear().toString().substr(2, 2);
	},

	render: function()
	{
		// find sections
		var sections = [];
		var sections_id = {};
		this.collection.each(function(x)
		{
			$.each(x.getSem(), function(i, sem)
			{
				var x = sem.substr(0, 1);
				var year = '20' + sem.substring(1);
				if (!sections_id[sem])
				{
					sections.push({
						'sem': sem,
						'text': (x == "h" ? "Høst " : "Vår ") + year,
						'link': '/intern/arrplan/' + sem,
						'active': false
					});
					sections_id[sem] = year + (x == "h" ? '2' : '1');
				}
			});
		});

		// sort sections
		sections.sort(function(e1, e2)
		{
			return sections_id[e1.sem] < sections_id[e2.sem];
		});

		this.$el.html(this.template({
			'sections': sections
		}));

		this.subel = this.$(".arrplan_content");
		this.subv = new bs.views.ArrplanSemester({
			el: this.subel
		});
		this.subv.par = this;
		this.setSem();
	},

	semChanged: function(e)
	{
		var el = $(e.currentTarget);
		if (!el.parent("li").data("sem")) return;
		this.sem = el.parent("li").data("sem");

		e.preventDefault();
		this.setSem();
	},

	setSem: function()
	{
		this.$(".nav li").removeClass("active");
		
		Backbone.history.navigate('arrplan/' + this.sem);
		this.subv.render();

		this.$(".nav li[data-sem="+this.sem+"]").addClass("active");
	}
});

bs.views.ArrplanSemester = bs.views.BaseView.extend({
	view: 'arrplan.sem',

	render: function() {
		var x = this.par.sem.substr(0, 1);
		var year = '20' + this.par.sem.substring(1);

		var t = {
			'sem': this.par.sem,
			'title': (x == "h" ? "Høst " : "Vår ") + year,
			'events': [],
			'recurring': [],
			'comments': []
		};

		// fetch data and add to template-data
		$.each(this.par.collection.filterSem(this.par.sem), function(i, x)
		{
			var c = x.toJSON();
			if (c['priority'])
			{
				if (c['priority'] == "low") c['lowPriority'] = true;
				if (c['priority'] == "high") c['highPriority'] = true;
			}

			if (x.get("type") == "event")
			{
				t.events.push(c);
			}

			else if (x.get("type") == "event_recurring")
			{
				t.recurring.push(c);
			}

			else if (x.get("type") == "comment")
			{
				t.comments.push(c);
			}

			else
			{
				console.log("doh", c);
			}
		});

		this.$el.html(this.template(t));
	}
});