
service("AuthService", function($http, $location, FlashService) {

	var self = this;

	// check if we can admin a group
	this.groupIsAdmin = function(group, realadmin) {
		if (!realadmin && useradmin) return true;
		return (group in user.groupowner_relations);
	};

	// check if we are in a group
	this.inGroup = function(groupNames, forceRealMember) {
		if (!logged_in) return false;
		if (!forceRealMember && useradmin) return true;

		if (!(groupNames instanceof Array))
		{
			groupNames = [groupNames];
		}

		for (var i = 0; i < groupNames.length; i++)
		{
			var group = groupNames[i];
			if (group in user.group_relations) return true;
		};

		return false;
	};

	// require login
	// returns true if access is granted
	// redirect to login if needed
	this.requireUser = function() {
		if (self.isLoggedIn()) return true;
		FlashService.add({'message': 'Denne siden krever innlogging.', 'type': 'danger'});
		self.setRedirectUrl($location.path());
		$location.path('login');
		return false;
	};

	// require group access
	// returns true if access is granted, false if not
	// give error message or redirect to login if needed
	this.requireGroup = function(groupNames, forceRealMember) {
		if (!self.requireUser()) return false;
		if (self.inGroup(groupNames, forceRealMember)) return true;
		return false;
	};

}).
