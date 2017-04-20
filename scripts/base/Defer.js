function Defer(onresolve, onreject, scope) {
	this.init(onresolve, onreject, scope)

	this.pending = true
}

Defer.all = function(list) {
	var defer  = new Defer(check, check)
	,   length = list.length
	,   loaded = 0
	,   failed = 0

	for(var i = 0; i < length; i++) {
		list[i].push(defer)
	}

	function check(value, success) {
		success ? ++loaded : ++failed

		if(loaded + failed < length) {
			defer.pending = true

		} else if(failed) {
			defer.success = false
		}
	}

	if(!list.length) defer.resolve()

	return defer
}

Defer.wait = function(duration) {
	return function(value) {
		return Defer.timer(duration, value)
	}
}
Defer.timer = function(duration, value) {
	var defer = new Defer

	setTimeout(function() { defer.resolve(value) }, duration)

	return defer
}

Defer.prototype = {
	init: function(onresolve, onreject, scope) {
		if(typeof onresolve === 'function') this.onresolve = onresolve
		if(typeof onreject  === 'function') this.onreject  = onreject
		this.scope = this.onreject ? scope : onreject || scope
	},

	then: function(onresolve, onreject, scope) {
		return this.push(new Defer(onresolve, onreject, scope))
	},

	anyway: function(func, scope) {
		return this.push(new Defer(func, func, scope))
	},

	push: function(defer) {
		if(this.head) {
			this.tail = this.tail.next = defer
		} else {
			this.head = this.tail = defer
		}

		this.dispatch()
		return defer
	},

	resolve: function(value) {
		this.transition(true, value)
	},

	reject: function(value) {
		this.transition(false, value)
	},

	transition: function(success, value) {
		if(this.debug) {
			console.log('defer', this.debug, success ? 'resolve' : 'reject', this.pending ? 'ok' : 'no', value)
		}
		if(!this.pending) return
		this.pending = false

		var func = success ? this.onresolve : this.onreject
		if(func) {
			try {
				this.success = true
				this.value   = func.call(this.scope, value, success)

			} catch(e) {
				this.success = false
				this.value   = e
			}

		} else {
			this.success = success
			this.value   = value
		}

		this.dispatch()
	},

	dispatch: function() {
		if(this.pending) return

		var defer = this.head
		delete this.head

		if(defer) {
			if(this.value instanceof Defer) {
				this.value.push(defer)

			} else while(defer) {
				defer.transition(this.success, this.value)
				defer = defer.next
			}

		} else if(!this.success) {
			throw this.value
		}
	}
}
