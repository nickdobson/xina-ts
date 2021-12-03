

(function() {
	xo.api.action.create = {};

	// ---- #xo.api.action.Create --------------------------------------------------------------------------------------

	xo.api.action.Create = class XOCreateAction extends xo.api.Action {
		constructor() {
			super();
		}

		childOf(parent) {
			this.parent = parent;
			return this;
		}

		build() {
			let action = {
				action : 'create',
				create : this.type,
				team   : this.create
			};

			if (!xo.util.isUndefinedOrNull(this.parent)) action.parent = xo.util.toSpecifier(this.parent);

			return action;
		}
	};

	// ---- #xo.api.action.create.Group --------------------------------------------------------------------------------

	xo.api.action.create.Group = class XOCreateGroupAction extends xo.api.action.Create {
		constructor(group) {
			super();

			this.create = group;
			this.type = 'group';
		}
	};

	// ---- #xo.api.action.create.Database -----------------------------------------------------------------------------

	xo.api.action.create.Database = class XOCreateDatabaseAction extends xo.api.action.Create {
		constructor(database) {
			super();

			this.create = database;
			this.type = 'database';
		}
	};

	// ---- #xo.api.action.create.Team ---------------------------------------------------------------------------------

	xo.api.action.create.Team = class XOCreateTeamAction extends xo.api.action.Create {
		constructor(team) {
			super();

			this.create = team;
			this.type = 'team';
		}
	};
})();
