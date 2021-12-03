(function() {
	xo.api.action.leave = {};

	// ---- #xo.api.action.Leave --------------------------------------------------------------------------------------

	xo.api.action.Leave = class XOLeaveAction extends xo.api.Action {
		constructor(teams) {
			super();

			this.teams = teams;
		}

		build(pretty) {
			let action = {
				action : 'leave',
				leave  : this.type,
				teams  : xo.util.toSpecifier(this.teams, pretty)
			};

			return action;
		}
	};

	// ---- #xo.api.action.leave.Users --------------------------------------------------------------------------------

	xo.api.action.leave.Users = class XOLeaveUsersAction extends xo.api.action.Leave {
		constructor(teams, users) {
			super(teams);

			this.users = users;
			this.type = 'users';
		}

		build(pretty) {
			let action = super.build(pretty);

			action.users = xo.util.toSpecifier(this.users, pretty);

			return action;
		}
	};

	// ---- #xo.api.action.leave.Groups -------------------------------------------------------------------------------

	xo.api.action.leave.Groups = class XOLeaveGroupsAction extends xo.api.action.Leave {
		constructor(teams, groups) {
			super(teams);

			this.groups = groups;
			this.type = 'groups';
		}

		build(pretty) {
			let action = super.build(pretty);

			action.groups = xo.util.toSpecifier(this.groups, pretty);

			return action;
		}
	};

	// ---- #xo.api.action.leave.Databases ----------------------------------------------------------------------------

	xo.api.action.leave.Databases = class XOLeaveDatabasesAction extends xo.api.action.Leave {
		constructor(teams, databases) {
			super(teams);

			this.databases = databases;
			this.type = 'databases';
		}

		build(pretty) {
			let action = super.build(pretty);

			action.databases = xo.util.toSpecifier(this.databases, pretty);

			return action;
		}
	};
})();
