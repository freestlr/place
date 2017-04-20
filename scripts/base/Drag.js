function Drag(element) {
	this.element = element
	this.events  = new EventEmitter

	this.offset  = {}
	this.origin  = {}
	this.begin   = {}
	this.point   = {}
	this.delta   = {}

	this.min = {}
	this.max = {}

	this.reset()

	this.bind('mousedown',  this.element)
	this.bind('touchstart', this.element)
}

Drag.prototype = {
	active: false,
	disabled: false,
	scale: 1,

	reset: function() {
		this.offset.x = this.offset.y = 0
		this.origin.x = this.origin.y = 0
		this.begin .x = this.begin .y = 0
		this.point .x = this.point .y = 0
		this.delta .x = this.delta .y = 0

		this.max.x = this.max.y =  Infinity
		this.min.x = this.min.y = -Infinity
	},

	start: function(x, y) {
		this.active  = true
		this.changed = false

		this.delta.x = 0
		this.delta.y = 0

		this.begin.x = x
		this.begin.y = y

		this.origin.x = this.offset.x
		this.origin.y = this.offset.y
	},

	move: function(x, y) {
		if(!this.active) return

		this.changed = true

		this.delta.x = x - this.begin.x
		this.delta.y = y - this.begin.y

		this.offset.x = this.origin.x + this.delta.x * this.scale
		this.offset.y = this.origin.y + this.delta.y * this.scale

		this.offset.x = Math.min(this.max.x, Math.max(this.min.x, this.offset.x))
		this.offset.y = Math.min(this.max.y, Math.max(this.min.y, this.offset.y))
	},

	end: function() {
		this.active = false
	},

	enable: function() {
		this.disabled = false
	},

	disable: function() {
		this.active && this.end()
		this.disabled = true
	},


	bind: function(type, elem) {
		if(elem) elem.addEventListener(type, this)
	},

	unbind: function(type, elem) {
		if(elem) elem.removeEventListener(type, this)
	},

	handleEvent: function(e) {
		if(this.disabled) return

		this.point.x = 0
		this.point.y = 0

		if(e.touches) {
			var l = e.touches.length
			for(var i = 0; i < l; i++) {
				var p = e.touches[i]

				this.point.x += p.pageX
				this.point.y += p.pageY
			}

			this.point.x /= l
			this.point.y /= l

		} else {
			this.point.x = e.pageX
			this.point.y = e.pageY
		}


		var emitEvent
		switch(e.type) {
			case 'mousedown':
				if(e.which !== 1) return

				if(!this.mouseActive) {
					this.mouseActive = true
					this.bind('mousemove', window)
					this.bind('mouseup', window)
				}
				this.start(this.point.x, this.point.y)
				emitEvent = 'start'
			break

			case 'mousemove':
				if(!this.mouseActive) return

				this.move(this.point.x, this.point.y)
				emitEvent = 'drag'
			break

			case 'mouseup':
				if(!this.mouseActive) return
				this.mouseActive = false
				this.unbind('mousemove', window)
				this.unbind('mouseup', window)

				this.end()
				emitEvent = 'end'
			break



			case 'touchstart':
				if(!this.touchActive) {
					this.touchActive = true
					this.bind('touchstart', window)
					this.bind('touchmove', window)
					this.bind('touchend', window)
					this.unbind('touchstart', this.element)
				}
				this.start(this.point.x, this.point.y)
				emitEvent = 'start'
			break

			case 'touchmove':
				if(!this.touchActive) return

				this.move(this.point.x, this.point.y)
				emitEvent = 'drag'
			break

			case 'touchend':
				if(!this.touchActive) return

				if(e.touches.length) {
					this.start(this.point.x, this.point.y)

				} else {
					this.touchActive = false
					this.unbind('touchstart', window)
					this.unbind('touchmove', window)
					this.unbind('touchend', window)
					this.bind('touchstart', this.element)

					this.end()
					emitEvent = 'end'
				}
			break
		}

		if(emitEvent) this.events.emit(emitEvent, [this.offset, e])

		e.preventDefault()
	}
}
