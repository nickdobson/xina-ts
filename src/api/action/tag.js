(function() {
	xo.api.action.Tag = XOTagAction;

	function XOTagAction(database, records) {
		this.database = database;
		this.records = records;
		this.tags = [];
	}

	XOTagAction.prototype = Object.create(xo.api.Action.prototype);
	XOTagAction.prototype.constructor = XOTagAction;

	XOTagAction.prototype.tag = function(tag) {
		this.tags.append(tag);
		return this;
	};

	XOTagAction.prototype.build = function() {
		return {
			action   : 'tag',
			database : xo.util.toSpecifier(this.database),
			records  : xo.util.toSpecifier(this.records),
			tags     : this.tags
		};
	};
})();
