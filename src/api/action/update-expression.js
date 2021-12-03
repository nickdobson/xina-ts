(function() {
	xo.api.action.UpdateExpression = class XOUpdateExpressionAction extends xo.api.Action {
		constructor(database, records) {
			super();

			this.database = database;
			this.records = records;
			this.values = {};
		}

		setField(field, value) {
			if (field instanceof xo.core.Field) {
				this.values[field.getName()] = value;
			} else {
				this.values[field] = value;
			}

			return this;
		}

		build(pretty) {
			let built = {};

			Object.forEach(this.values, (v, k) => {
				built[k] = v.build(pretty);
			});

			return {
				action   : 'update_expression',
				database : xo.util.toSpecifier(this.database),
				records  : xo.util.toSpecifier(this.records),
				set      : built
			};
		}
	};
})();
