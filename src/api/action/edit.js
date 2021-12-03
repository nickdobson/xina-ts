(function() {
	xo.api.action.Edit = XOEditAction;

	function XOEditAction(postId) {
		this.postId = postId;
	}

	XOEditAction.prototype = Object.create(xo.api.Action.prototype);
	XOEditAction.prototype.constructor = XOEditAction;

	XOEditAction.prototype.setText = function(text) {
		this.text = text;
		return this;
	};

	XOEditAction.prototype.setActive = function(active) {
		this.active = active;
		return this;
	};

	XOEditAction.prototype.build = function() {
		return {
			action : 'edit',
			post   : this.postId,
			text   : this.text,
			active : this.active
		};
	};
})();
