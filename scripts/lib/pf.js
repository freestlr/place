!function() {
	if(!Date.now) {
		Date.now = function() { return new Date().getTime() }
	}
	if(!window.performance) {
		window.performance = {}
	}
	if(!window.performance.now) {
		var offset = window.performance.timing && window.performance.timing.navigationStart
			? window.performance.timing.navigationStart
			: Date.now()
		window.performance.now = function() { return Date.now() - offset }
	}
}()

!function() {
	var mstart, tstart, timelast

	try {
		new MouseEvent('tap')

	} catch(e) {
		window.MouseEvent = function(type, e) {
			var tap = document.createEvent('MouseEvents')

			tap.initMouseEvent(type, e.bubbles, e.cancelable, e.view,
				e.detail, e.screenX, e.screenY, e.clientX, e.clientY,
				e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
				e.button, e.relatedTarget)

			return tap
		}
	}

	function onmousedown(e) {
		if(e.which === 1) mstart = e
	}
	function onmouseup(e) {
		ontap(mstart, e, e, false)
		mstart = null
	}

	function ontouchstart(e) {
		tstart = e.changedTouches[0]
	}
	function ontouchend(e) {
		ontap(tstart, e.changedTouches[0], e, true)
		tstart = null
	}

	function ontap(sp, ep, e, touch) {
		if(!sp) return

		var dx = ep.pageX - sp.pageX
		,   dy = ep.pageY - sp.pageY
		,   ds = touch ? 64 : 25

		if(dx * dx + dy * dy > ds) return

		var ct = window.performance.now()
		if(ct - timelast < 50 && e.isTrusted) return

		timelast = ct


		var tap = new MouseEvent('tap', {
			bubbles: true,
			cancelable: true,

			pageX: ep.pageX,
			pageY: ep.pageY,
			screenX: ep.screenX,
			screenY: ep.screenY,
			clientX: ep.clientX,
			clientY: ep.clientY,

			altKey: e.altKey,
			ctrlKey: e.ctrlKey,
			shiftKey: e.shiftKey,
			metaKey: e.metaKey,
			view: e.view
		})

		tap.touch = touch

		e.target.dispatchEvent(tap)
	}

	document.addEventListener('touchstart', ontouchstart, true)
	document.addEventListener('touchend',   ontouchend,   true)
	document.addEventListener('mousedown',  onmousedown,  true)
	document.addEventListener('mouseup',    onmouseup,    true)
}()

if(!Function.prototype.bind) {
	Function.prototype.bind = function(scope) {
		var bound_args = Array.prototype.slice.call(arguments, 1),
			func = this

		return function() {
			var passed_args = Array.prototype.slice.call(arguments)
			return func.apply(scope, bound_args.concat(passed_args))
		}
	}
}

window.requestAnimationFrame =
	window.      requestAnimationFrame ||
	window.     ORequestAnimationFrame ||
	window.    msRequestAnimationFrame ||
	window.   mozRequestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	function(fn) { return setTimeout(fn, 1000/60) }

window.cancelAnimationFrame =
	window.      cancelAnimationFrame ||
	window.     OCancelAnimationFrame ||
	window.    msCancelAnimationFrame ||
	window.   mozCancelAnimationFrame ||
	window.webkitCancelAnimationFrame ||
	window.clearTimeout
