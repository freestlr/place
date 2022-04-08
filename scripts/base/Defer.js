function Defer() {
	this.set.apply(this, arguments)
	this.pending = true
}

Defer.safe = true
Defer.soft = true
Defer.silent = false

Defer.prototype = {

	set: function(onresolve, onreject, onprogress, scope) {
		this.onresolve  = typeof onresolve  === 'function' ? onresolve  : null
		this.onreject   = typeof onreject   === 'function' ? onreject   : null
		this.onprogress = typeof onprogress === 'function' ? onprogress : null
		this.scope = this.onprogress ? scope : this.onreject ? onprogress : onreject || scope
		return this
	},

	abort: function() {
		delete this.head
		delete this.tail
		return this.set(null)
	},

	then: function(onresolve, onreject, onprogress, scope) {
		return this.push(new Defer(onresolve, onreject, onprogress, scope))
	},

	'catch': function(onreject, scope) {
		return this.push(new Defer(null, onreject, null, scope))
	},

	anyway: function(func, scope) {
		return this.push(new Defer(func, func, scope))
	},

	delay: function(duration) {
		return this.push(Defer.timer(duration))
	},

	push: function(defer) {
		if(this.lastprogress) {
			defer.progress(this.lastprogress)
		}

		if(this.pending) {
			if(this.tail) {
				this.tail = this.tail.next = defer
			} else {
				this.head = this.tail = defer
			}

		} else {
			this.dispatch(defer)
		}
		return defer
	},

	willProgress: function() {
		var defer = this
		return function(value) { defer.progress(value) }
	},

	willResolve: function(value) {
		return this.willTransition(true, value)
	},

	willReject: function(value) {
		return this.willTransition(false, value)
	},

	willTransition: function(success, bound) {
		var defer = this
		return function(value) { defer.transition(success, bound == null ? value : bound) }
	},

	progress: function(value) {
		if(!this.pending) return this

		this.lastprogress = value

		if(this.onprogress) {
			this.onprogress.call(this.scope, value, this)

		} else {
			var defer = this.head
			while(defer) {
				defer.progress(value)
				defer = defer.next
			}
		}

		return this
	},

	resolve: function(value) {
		return this.transition(true, value)
	},

	reject: function(value) {
		return this.transition(false, value)
	},

	transition: function(success, value) {
		if(!this.pending) {
			console.warn('transition of complete defer:', success, value)
			return this
		}

		this.pending = false

		var func = success ? this.onresolve : this.onreject
		if(func) {
			if(!Defer.safe) {
				this.value   = func.call(this.scope, value, success)
				this.success = true

			} else try {
				this.value   = func.call(this.scope, value, success)
				this.success = true

			} catch(e) {
				this.value   = e
				this.success = false
			}

		} else {
			this.success = success
			this.value   = value
		}

		var defer = this.head
		if(defer) {
			delete this.head
			delete this.tail

			while(defer) {
				this.dispatch(defer)
				defer = defer.next
			}

		} else if(!this.success && !Defer.silent) {
			if(Defer.soft) console.error(this.value)
			else throw this.value
		}

		return this
	},

	dispatch: function(defer) {
		if(!this.pending && defer) {
			if(this.value instanceof Defer) {
				this.value.push(defer)

			} else {
				defer.transition(this.success, this.value)
			}
		}

		return this
	}
}



Defer.all = function(list) {
	var defer  = new Defer
	,   length = list && list.length || 0
	,   result = new Array(length)
	,   progri = new Array(length)
	,   loaded = 0
	,   failed = 0


	if(!length) {
		defer.resolve(result)
		return defer
	}

	for(var i = 0; i < length; i++) {
		var item = list[i]
		,   next = new Defer(check, check, progress, item)

		progri[i] = 0

		if(item instanceof Defer) {
			item.push(next)
		} else {
			next.resolve(item)
		}
	}

	function progress(value) {
		var index = list.indexOf(this)
		if(index === -1) return

		progri[index] = value

		defer.progress(progri)
	}

	function check(value, success) {
		var index = list.indexOf(this)

		if(value instanceof Defer) {
			list[index] = value.then(check, check, progress, value)
			return
		}

		success ? ++loaded : ++failed
		if(success) result[index] = value

		if(loaded + failed >= length) {
			setTimeout(function() {
				defer.transition(!failed, result)
			}, 0)
		}
	}

	return defer
}

Defer.complete = function(success, value) {
	var defer = new Defer
	defer.pending = false
	defer.success = success
	defer.value = value

	return defer
}

Defer.timer = function(duration) {
	function func(value, success) {
		var defer = new Defer

		setTimeout(function() {
			defer.transition(value, success)
		}, duration || 0)

		return defer
	}

	return new Defer(func, func)
}
