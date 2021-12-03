(function() {
	xo.api.action.Update = XOUpdateAction;

	function XOUpdateAction(database, records) {
		this.database = database;
		this.records = records;
		this.values = {};
	}

	XOUpdateAction.prototype = Object.create(xo.api.Action.prototype);
	XOUpdateAction.prototype.constructor = XOUpdateAction;

	XOUpdateAction.prototype.set = function(fieldOrBlob, value) {
		if (fieldOrBlob instanceof xo.core.Field) {
			this.values[fieldOrBlob.getName()] = fieldOrBlob.type.parse(value);
		} else if (fieldOrBlob instanceof xo.core.Blob) {
			this.values[fieldOrBlob.getName()] = value;
		}

		return this;
	};

	XOUpdateAction.prototype.setField = function(field, value) {
		this.values[field.getName()] = field.type.parse(value);

		return this;
	};

	XOUpdateAction.prototype.setFile = function(objectId) {
		this.values.file = objectId;
		return this;
	};

	XOUpdateAction.prototype.build = function() {
		return {
			action   : 'update',
			database : xo.util.toSpecifier(this.database),
			records  : xo.util.toSpecifier(this.records),
			set      : this.values
		};
	};
})();
