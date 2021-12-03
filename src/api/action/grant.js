(function() {
	// ---- #xo.api.action.Grant ---------------------------------------------------------------------------------------

	xo.api.action.Grant = XOGrantAction;

	function XOGrantAction(mode, users) {
		this.mode = mode;
		this.users = users;
	}

	XOGrantAction.prototype.super = function() {
		return new XOGrantSuperAction(this.mode, this.users);
	};

	XOGrantAction.prototype.groups = function(groups, privileges) {
		return new XOGrantGroupsAction(this.mode, this.users, groups, privileges);
	};

	XOGrantAction.prototype.databases = function(databases, privileges) {
		return new XOGrantDatabasesAction(this.mode, this.users, databases, privileges);
	};

	// ---- #xo.api.action.grant.Super ---------------------------------------------------------------------------------

	xo.api.action.grant.Super = XOGrantSuperAction;

	function XOGrantSuperAction(mode, users) {
		this.mode = mode;
		this.users = users;
	}

	XOGrantSuperAction.prototype = Object.create(xo.api.Action.prototype);
	XOGrantSuperAction.prototype.constructor = XOGrantSuperAction;

	XOGrantSuperAction.prototype.build = function() {
		var action = {};

		action.action = this.mode;
		action[this.mode] = 'super';
		action.users = this.users;

		return action;
	};

	// ---- #xo.api.action.grant.Groups ---------------------------------------------------------------------------------

	xo.api.action.grant.Groups = XOGrantGroupsAction;

	function XOGrantGroupsAction(mode, users, groups, privileges) {
		this.mode = mode;
		this.users = users;
		this.groups = groups;
		this.privileges = privileges;
	}

	XOGrantGroupsAction.prototype = Object.create(xo.api.Action.prototype);
	XOGrantGroupsAction.prototype.constructor = XOGrantGroupsAction;

	XOGrantGroupsAction.prototype.build = function() {
		var action = {};

		action.action = this.mode;
		action[this.mode] = 'groups';
		action.users = this.users;
		action.groups = this.groups;
		action.privileges = this.privileges;

		return action;
	};

	// ---- #xo.api.action.grant.Databases ---------------------------------------------------------------------------------

	xo.api.action.grant.Databases = XOGrantDatabasesAction;

	function XOGrantDatabasesAction(mode, users, databases, privileges) {
		this.mode = mode;
		this.users = users;
		this.databases = databases;
		this.privileges = privileges;
	}

	XOGrantDatabasesAction.prototype = Object.create(xo.api.Action.prototype);
	XOGrantDatabasesAction.prototype.constructor = XOGrantDatabasesAction;

	XOGrantDatabasesAction.prototype.build = function() {
		var action = {};

		action.action = this.mode;
		action[this.mode] = 'databases';
		action.users = this.users;
		action.databases = this.databases;
		action.privileges = this.privileges;

		return action;
	};
})();
