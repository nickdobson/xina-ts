(function() {
	xo.api.action.Post = XOPostAction;

	function XOPostAction(wall, post) {
		this.wall = wall;
		this.post = post;
	}

	XOPostAction.prototype = Object.create(xo.api.Action.prototype);
	XOPostAction.prototype.constructor = XOPostAction;

	XOPostAction.prototype.setThread = function(thread) {
		this.thread = thread;
		return this;
	};

	XOPostAction.prototype.build = function() {
		return {
			action : 'post',
			wall   : this.wall.build(),
			thread : this.thread,
			post   : this.post
		};
	};
})();
