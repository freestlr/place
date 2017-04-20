function Timer(func, scope) {
	this.func  = func
	this.scope = scope
}

Timer.prototype = {
	time: 0,
	rate: 1,
	running: false,

	play: function() {
		if(this.running) return this
		this.running = true

		var timer = this
		,   frameCount = 0
		,   frameStart = performance.now()
		,   frameLast  = frameStart
		,   frameTime  = 0
		,   frameDelta = 0

		!function loop() {
			timer.id = requestAnimationFrame(loop)

			frameCount ++
			frameTime  = performance.now()
			frameDelta = (frameTime - frameLast) * timer.rate

			timer.time += frameDelta
			timer.func.call(timer.scope, timer.time, frameDelta, frameCount)

			frameLast = frameTime
		}()

		return this
	},

	stop: function() {
		if(this.running) {
			this.running = false

			cancelAnimationFrame(this.id)
		}

		return this
	}
}
