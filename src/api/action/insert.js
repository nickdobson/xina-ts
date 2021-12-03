(function() {
	// ---- #xo.api.action.Insert --------------------------------------------------------------------------------------

	xo.api.action.Insert = XOInsertAction;

	function XOInsertAction(database, records) {
		this.database = database;
		this.records = records;
		this.mode = null;
	}

	XOInsertAction.prototype = Object.create(xo.api.Action.prototype);
	XOInsertAction.prototype.constructor = XOInsertAction;

	XOInsertAction.prototype.onDuplicate = function(mode) {
		this.mode = mode;
		return this;
	};

	XOInsertAction.prototype.onDuplicateUpdate = function() {
		return this.onDuplicate('update');
	};

	XOInsertAction.prototype.build = function(pretty) {
		if (!Object.isArray(this.records)) this.records = [this.records];

		let records = this.records.map((record) => {
			if (!record.expressions) return record;

			let clone = Object.clone(record);
			let exprs = {};

			Object.forEach(record.expressions, (val, key) => {
				exprs[key] = val instanceof xo.api.Expression ? val['build'](pretty) : val;
			});

			clone.expressions = exprs;

			return clone;
		});

		return {
			action       : 'insert',
			database     : xo.util.toSpecifier(this.database, pretty),
			records      : records,
			on_duplicate : this.mode
		};
	};
})();
