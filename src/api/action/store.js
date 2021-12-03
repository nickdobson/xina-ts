(function() {
	// ---- #xo.api.action.Store --------------------------------------------------------------------------------------

	xo.api.action.Store = class XOStoreAction extends xo.api.Action {
		constructor(name, key, type, value, desc) {
			super();

			this.name = name;
			this.key = key;
			this.type = type;
			this.value = value;
			this.desc = desc;
		}

		build() {
			let action = {
				action : 'store',
				name   : this.name,
				key    : this.key,
				type   : this.type,
				value  : this.value,
				desc   : this.desc
			};

			return action;
		}
	};
})();
