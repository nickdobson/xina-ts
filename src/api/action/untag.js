(function() {
	xo.api.action.Untag = XOUntagAction;

	function XOUntagAction(database, records) {
		this.database = database;
		this.records = records;
		this.tags = [];
	}

	XOUntagAction.prototype = Object.create(xo.api.Action.prototype);
	XOUntagAction.prototype.constructor = XOUntagAction;

	XOUntagAction.prototype.untag = function(tag) {
		this.tags.append(tag);
		return this;
	};

	XOUntagAction.prototype.build = function() {
		return {
			action   : 'untag',
			database : xo.util.toSpecifier(this.database),
			records  : xo.util.toSpecifier(this.records),
			tags     : this.tags
		};
	};
})();
