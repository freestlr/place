function EventEmitter() {
	this.list  = []
	this.links = []
}

EventEmitter.prototype = {

	when: function(list, scope, data, once) {
		for(var type in list) {
			this.on(type, list[type], scope, data, once)
		}
	},

	relay: function(type, emitter, data) {
		this.on(type, emitter.emit, emitter, [type].concat(data || []))
	},

	once: function(type, func, scope, data) {
		this.on(type, func, scope, data, true)
	},

	on: function(type, func, scope, data, once) {
		if('function' !== typeof func) return

		this.list.push({
			type  : type,
			func  : func,
			scope : scope,
			data  : data == null ? [] : [].concat(data),
			once  : once
		})
	},

	off: function(type, func, scope) {

		for(var i = this.list.length -1; i >= 0; i--) {
			var item = this.list[i]

			if((type  == null || type  === item.type)
			&& (func  == null || func  === item.func)
			&& (scope == null || scope === item.scope)) this.list.splice(i, 1)
		}
	},

	will: function(type, data) {
		var self  = this
		,   bound = data == null ? [] : [].concat(data)

		return function() {
			var args = bound.slice()
			for(var i = 0; i < arguments.length; i++) args.push(arguments[i])
			self.emit(type, args)
		}
	},

	emit: function(type, data) {
		if(this.debug) {
			console.log(this.debug +' emit', type, data)
		}

		if(data == null) data = []

		var list = this.list.slice()

		for(var i = 0; i < list.length; i++) {
			var item = list[i]

			if(item.type === type || item.type === Infinity) {
				item.func.apply(item.scope, item.data.concat(data))

				if(item.once) {
					var index = this.list.indexOf(item)
					if(~index)  this.list.splice(index, 1)
				}
			}
		}

		for(var i = 0; i < this.links.length; i++) {
			var link = this.links[i]
			var type = link.prefix ? link.prefix + type : type

			link.emitter.emit(type, link.data.concat(data))
		}
	},

	link: function(emitter, prefix, data) {
		this.links.push({
			emitter : emitter,
			prefix  : prefix,
			data    : data == null ? [] : [].concat(data)
		})
	},

	unlink: function(emitter, prefix) {
		for(var i = this.links.length -1; i >= 0; i--) {
			var link = this.links[i]

			if((emitter == null || emitter === link.emitter)
			&& (prefix  == null || prefix  === link.prefix )) this.links.splice(i, 1)
		}
	}
}
