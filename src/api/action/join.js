(function() {
	xo.api.action.join = {};

	// ---- #xo.api.action.Join ---------------------------------------------------------------------------------------

	xo.api.action.Join = class XOJoinAction extends xo.api.Action {
		constructor(teams) {
			super();

			this.teams = teams;
		}

		build(pretty) {
			let action = {
				action : 'join',
				join   : this.type,
				teams  : xo.util.toSpecifier(this.teams, pretty)
			};

			return action;
		}
	};

	// ---- #xo.api.action.join.Users ---------------------------------------------------------------------------------

	xo.api.action.join.Users = class XOJoinUsersAction extends xo.api.action.Join {
		constructor(teams, users) {
			super(teams);

			this.users = users;
			this.type = 'users';
		}

		asAdmin(admin) {
			this.admin = admin;
			return this;
		}

		build(pretty) {
			let action = super.build(pretty);

			action.users = xo.util.toSpecifier(this.users, pretty);
			if (this.admin) action.admin = true;

			return action;
		}
	};

	// ---- #xo.api.action.join.Groups --------------------------------------------------------------------------------

	xo.api.action.join.Groups = class XOJoinGroupsAction extends xo.api.action.Join {
		constructor(teams, groups) {
			super(teams);

			this.groups = groups;
			this.type = 'groups';
		}

		withPrivileges(privileges) {
			this.privileges = privileges;

			return this;
		}

		build(pretty) {
			let action = super.build(pretty);

			action.groups = xo.util.toSpecifier(this.groups, pretty);
			if (this.privileges) action.privileges = this.privileges;

			return action;
		}
	};

	// ---- #xo.api.action.join.Databases -----------------------------------------------------------------------------

	xo.api.action.join.Databases = class XOJoinDatabasesAction extends xo.api.action.Join {
		constructor(teams, databases) {
			super(teams);

			this.databases = databases;
			this.type = 'databases';
		}

		withPrivileges(privileges) {
			this.privileges = privileges;

			return this;
		}

		build(pretty) {
			let action = super.build(pretty);

			action.databases = xo.util.toSpecifier(this.databases, pretty);
			if (this.privileges) action.privileges = this.privileges;

			return action;
		}
	};
})();
