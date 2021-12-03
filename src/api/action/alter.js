(function() {
	// ---- #xo.api.action.Alter ---------------------------------------------------------------------------------------

	xo.api.action.Alter = XOAlterAction;

	function XOAlterAction() {}

	XOAlterAction.prototype = Object.create(xo.api.Action.prototype);
	XOAlterAction.prototype.constructor = XOAlterAction;

	xo.api.action.alter.UserPutObjects = XOAlterUserPutObjectsAction;

	function XOAlterUserPutObjectsAction(user, objects) {
		this.user = user;
		this.objects = objects;
	}

	XOAlterUserPutObjectsAction.prototype = Object.create(xo.api.action.Alter.prototype);
	XOAlterUserPutObjectsAction.prototype.constructor = XOAlterUserPutObjectsAction;

	XOAlterUserPutObjectsAction.prototype.build = function() {
		return {
			action  : 'alter',
			alter   : 'user',
			op      : 'objects',
			user    : xo.util.toSpecifier(this.user),
			objects : this.objects
		};
	};
})();
