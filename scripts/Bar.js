function Bar(element) {
	this.element = element
	this.cursor  = dom.one('.cursor', element)

	dom.on('mousedown', this.element, this)
	dom.on('touchstart', this.element, this)
}

Bar.prototype = {
	position: 0,

	handleEvent: function(e) {
		switch(e.type) {
			case 'mousedown':
				if(e.button !== 0) return
			case 'touchstart':
				dom.on('mousemove', window, this)
				dom.on('mouseup',   window, this)
				dom.on('touchmove', window, this)
				dom.on('touchend',  window, this)
				// dom.addclass(this.element, 'active')

				this.seek(e)
			break

			case 'mouseup':
			case 'touchend':
				dom.off('mousemove', window, this)
				dom.off('mouseup',   window, this)
				dom.off('touchmove', window, this)
				dom.off('touchend',  window, this)
				// dom.remclass(this.element, 'active')
			break

			case 'mousemove':
			case 'touchmove':
				this.seek(e)
			break
		}

		e.preventDefault()
	},

	seek: function(e) {
		var point  = e.touches ? e.touches[0] : e
		,   offset = dom.offset(this.element)

		this.set((point.pageX - offset.x) / this.element.offsetWidth, true)
	},

	set: function(value, emitEvent) {
		var position = Math.min(1, Math.max(0, value))

		if(this.position === position) return
		this.position = position

		this.cursor.style.left = this.position * 100 +'%'

		if(emitEvent) {
			this.changed = true
		}
	}
}
