(function() {
	// ---- #xo.api.action.view.Tasks ------------------------------------------------------------------------------------

	xo.api.action.view.Tasks = class XOViewTasksAction extends xo.api.Action {
		constructor(tasks) {
			super();

			this.tasks = tasks;
		}

		build() {
			let action = {
				action : 'view',
				view   : 'tasks',
				tasks  : this.tasks
			};

			return action;
		}
	};

	// ---- #xo.api.action.view.Notifications ----------------------------------------------------------------------------

	xo.api.action.view.Notifications = class XOViewNotificationsAction extends xo.api.Action {
		constructor(notifications) {
			super();

			this.notifications = notifications;
		}

		build() {
			let action = {
				action        : 'view',
				view          : 'notifications',
				notifications : this.notifications
			};

			return action;
		}
	};
})();
