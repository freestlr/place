
function Viewport(element) {
	this.position = vec3.create()
	this.target = vec3.create()

	// this.fov = Math.PI / 2
	this.fov = Math.atan(1 / 2) * 2
	this.frictionXY = Math.pow(0.78, 60 / 1000)
	this.frictionZ = Math.pow(0.85, 60 / 1000)
	this.friction = this.frictionXY

	this.projectionMatrix = mat4.create()
	this.projectionInverse = mat4.create()

	this.worldMatrix = mat4.create()
	this.worldInverse = mat4.create()
	this.targetMatrix = mat4.create()
	this.targetInverse = mat4.create()

	this.planeNormal = vec3.fromValues(0, 0, -1)
	this.planeConstant = 0

	this.rayOrigin = vec3.create()
	this.rayDirection = vec3.create()

	this.distanceMin = 16
	this.distanceMax = 4000

	this.positionChanged = 0
	this.positionUpdated = 0

	element && this.bind(element)
}

Viewport.prototype = {
	bind: function(element) {
		element.addEventListener('mousedown', this)
		element.addEventListener('touchstart', this, { passive: false })
		element.addEventListener('wheel', this)
		element.addEventListener('contextmenu', this)
		window.addEventListener('resize', this)
		this.element = element
		this.onResize()
	},

	unbind: function(element) {
		element.removeEventListener('mousedown', this)
		element.removeEventListener('touchstart', this, { passive: false })
		element.removeEventListener('wheel', this)
		element.removeEventListener('contextmenu', this)
		window.removeEventListener('resize', this)

		this.onMouseUp()
		this.onTouchEnd()
	},

	handleEvent: function(e) {
		switch(e.type) {
			case 'mousedown':
				this.onMouseDown(e)
			break

			case 'mousemove':
				this.onMouseMove(e)
			break

			case 'mouseup':
				this.onMouseUp(e)
			break


			case 'touchstart':
				this.onTouchStart(e)
			break

			case 'touchmove':
				this.onTouchMove(e)
			break

			case 'touchend':
				this.onTouchEnd(e)
			break


			case 'wheel':
				this.onWheel(e)
			break

			case 'contextmenu':
			break

			case 'resize':
				this.onResize(e)
			break

			default:
				return
		}

		e.preventDefault()
	},

	onMouseDown: function(e) {
		window.addEventListener('mousemove', this)
		window.addEventListener('mouseup', this)

		this.worldStart = this.raycastPlane(this.getEventPoint(e))
	},

	onMouseMove: function(e) {
		var world = this.raycastPlane(this.getEventPoint(e))
		if (!world || !this.worldStart) {
			console.log('we are behind')
			return
		}
		var delta = vec3.sub(vec3.create(), world, this.worldStart)

		this.target[0] -= delta[0]
		this.target[1] -= delta[1]

		// this.position[0] -= delta[0]
		// this.position[1] -= delta[1]

		// this.positionChanged++
		this.updateMatrixTarget()
		this.checkBorders()
		// this.updateMatrixWorld()
		this.friction = this.frictionXY
	},

	onMouseUp: function(e) {
		window.removeEventListener('mousemove', this)
		window.removeEventListener('mouseup', this)
	},

	onTouchStart: function(e) {
		window.addEventListener('touchmove', this, { passive: false })
		window.addEventListener('touchend', this, { passive: false })
	},

	onTouchMove: function(e) {

	},

	onTouchEnd: function(e) {
		window.removeEventListener('touchmove', this, { passive: false })
		window.removeEventListener('touchend', this, { passive: false })
	},

	onWheel: function(e) {
		var delta = e.wheelDeltaY || -e.deltaY
		var direction = this.screenToTarget(this.getEventPoint(e))
		var currentZ = this.target[2]
		this.makeLocalTo(direction, this.target)

		vec3.scale(direction, direction, delta * Math.sqrt(currentZ) * 0.04)

		var directionZ = direction[2]
		var targetZ = currentZ + directionZ
		if(targetZ < this.distanceMin || targetZ > this.distanceMax) {
			var cz = Math.min(this.distanceMax, Math.max(this.distanceMin, targetZ))
			var scale = (cz - currentZ) / directionZ
			vec3.scale(direction, direction, scale)
		}
		vec3.add(this.target, this.target, direction)

		this.updateMatrixTarget()
		this.checkBorders()
		this.friction = this.frictionZ
	},

	onResize: function(e) {
		this.width = this.element.offsetWidth
		this.height = this.element.offsetHeight
		this.offsetX = 0
		this.offsetY = 0

		this.updateProjection()
	},


	updateProjection: function() {
		mat4.perspective(
			this.projectionMatrix,
			this.fov,
			this.width / this.height,
			0.1,
			1000,
		)

		mat4.invert(
			this.projectionInverse,
			this.projectionMatrix,
		)
	},

	updateMatrixWorld: function() {
		mat4.fromTranslation(this.worldMatrix, this.position)
		mat4.invert(this.worldInverse, this.worldMatrix)
	},

	updateMatrixTarget: function() {
		mat4.fromTranslation(this.targetMatrix, this.target)
		mat4.invert(this.targetInverse, this.targetMatrix)
	},

	getEventPoint: function(e) {
		return vec3.fromValues(
			e.pageX - this.offsetX,
			e.pageY - this.offsetY,
			0,
		)
	},

	projectWorld: function(vector) {
		vec3.transformMat4(vector, vector, this.worldInverse)
		vec3.transformMat4(vector, vector, this.projectionMatrix)
	},

	projectTarget: function(vector) {
		vec3.transformMat4(vector, vector, this.targetInverse)
		vec3.transformMat4(vector, vector, this.projectionMatrix)
	},

	unprojectWorld: function(vector) {
		vec3.transformMat4(vector, vector, this.projectionInverse)
		vec3.transformMat4(vector, vector, this.worldMatrix)
	},

	unprojectTarget: function(vector) {
		vec3.transformMat4(vector, vector, this.projectionInverse)
		vec3.transformMat4(vector, vector, this.targetMatrix)
	},

	screenToWorld: function(screen, world) {
		world = world || vec3.create()

		var cx = (screen[0] / this.width) * 2 - 1
		var cy = -(screen[1] / this.height) * 2 + 1
		vec3.set(world, cx, cy, 0.5)

		this.unprojectWorld(world)
		return world
	},

	screenToTarget: function(screen, target) {
		target = target || vec3.create()

		var cx = (screen[0] / this.width) * 2 - 1
		var cy = -(screen[1] / this.height) * 2 + 1
		vec3.set(target, cx, cy, 0.5)

		this.unprojectTarget(target)
		return target
	},

	worldToScreen: function(world, screen) {
		screen = screen || vec3.create()

		vec3.copy(screen, world)
		this.projectWorld(screen)

		screen[0] = (screen[0] *.5 +.5) * this.width
		screen[1] = -(screen[1] *.5 -.5) * this.height
		return screen
	},

	targetToScreen: function(target, screen) {
		screen = screen || vec3.create()

		vec3.copy(screen, target)
		this.projectTarget(screen)

		screen[0] = (screen[0] *.5 +.5) * this.width
		screen[1] = -(screen[1] *.5 -.5) * this.height
		return screen
	},

	makeLocalTo: function(world, to) {
		vec3.sub(world, world, to)
		vec3.normalize(world, world)
	},

	raycastPlane: function(screen) {
		this.screenToTarget(screen, this.rayDirection)
		this.makeLocalTo(this.rayDirection, this.target)
		vec3.copy(this.rayOrigin, this.target)
		return this.rayIntersectPlane(this.rayOrigin, this.rayDirection)
	},

	rayIntersectPlane: function(rOrigin, rDirection, result) {
		var denominator = vec3.dot(this.planeNormal, rDirection)

		var t = 0
		if(denominator === 0) {
			var distance = vec3.dot(this.planeNormal, rOrigin) + this.planeConstant
			if (distance !== 0) return null

		} else {
			t = -(vec3.dot(rOrigin, this.planeNormal) + this.planeConstant) / denominator
			if (t < 0) return null
		}


		if(!result) result = vec3.create()

		vec3.copy(result, rDirection)
		vec3.scale(result, result, t)
		vec3.add(result, result, rOrigin)

		return result
	},

	getScreenPoint: function(x, y) {
		return this.worldToScreen(vec3.fromValues(x, y, 0))
	},

	getCenter: function() {
		return this.getScreenPoint(0, 0)
	},

	getTransform: function(sizeX, sizeY) {
		var topLeft = this.worldToScreen(vec3.fromValues(-sizeX / 2, +sizeY / 2, 0))
		var bottomRight = this.worldToScreen(vec3.fromValues(+sizeX / 2, -sizeY / 2, 0))

		var width = bottomRight[0] - topLeft[0]
		var height = bottomRight[1] - topLeft[1]

		var scaleX = width / sizeX
		var scaleY = height / sizeY
		var translateX = topLeft[0]
		var translateY = topLeft[1]

		return [translateX, translateY, scaleX, scaleY]
	},

	setPosition: function(x, y, z) {
		// vec3.set(this.position, x, y, z)
		vec3.set(this.target, x, y, z)

		// this.updateMatrixWorld()
		this.updateMatrixTarget()
		this.checkBorders()
		this.friction = this.frictionZ
		// this.positionChanged++
	},

	setDistance: function(min, max) {
		this.distanceMin = min
		this.distanceMax = max
	},

	setBorders: function(width, height, padding) {
		this.borderTL = vec3.fromValues(-width / 2, +height / 2, 0)
		this.borderBR = vec3.fromValues(+width / 2, -height / 2, 0)
		this.padding = padding
	},

	checkBorders: function() {
		if(!this.borderTL || !this.borderBR) return
		var pTL = this.targetToScreen(this.borderTL)
		var pBR = this.targetToScreen(this.borderBR)

		var sw = this.width
		var sh = this.height

		var p = this.padding || 0
		var l = pTL[0]
		var t = pTL[1]
		var r = pBR[0]
		var b = pBR[1]
		var w = r - l
		var h = b - t

		var dl = l - 0 - p
		var dt = t - 0 - p
		var dr = sw - r - p
		var db = sh - b - p

		if(dl <= 0 && dt <= 0 && dr <= 0 && db <= 0) return

		var fw = w + p * 2 < sw
		var fh = h + p * 2 < sh

		var ox = fw ? (dl + dr) / 2 -dl : dl > 0 ? -dl : dr > 0 ? dr : 0
		var oy = fh ? (dt + db) / 2 -dt : dt > 0 ? -dt : db > 0 ? db : 0

		var centerT = this.raycastPlane(vec3.fromValues(sw / 2 - ox, sh / 2 - oy, 0))
		this.target[0] = centerT[0]
		this.target[1] = centerT[1]

		this.updateMatrixTarget()
	},

	zoom: function(scale) {
		this.target[2] *= scale
		this.friction = this.frictionZ
		this.updateMatrixTarget()
		this.checkBorders()
	},

	animationStart: function() {
		var scope = this
		var start = Math.round(performance.now())
		function loop() {
			var time = performance.now()
			var delta = Math.round(time - start)
			scope.timer = requestAnimationFrame(loop)
			scope.update(time, delta)
			start += delta
		}
		loop()
	},

	animationEnd: function() {
		cancelAnimationFrame(this.timer)
	},

	update: function(t, dt) {
		var E = 1e-3
		var a = Math.pow(this.friction, dt)

		var z = this.target[2]
		if(z < this.distanceMin || z > this.distanceMax) {
			this.target[2] = Math.min(this.distanceMax, Math.max(this.distanceMin, z))
			this.updateMatrixTarget()
		}

		var dx = (this.target[0] - this.position[0]) * a
		var dy = (this.target[1] - this.position[1]) * a
		var dz = (this.target[2] - this.position[2]) * a

		if(dx || dy || dz) {
			this.position[0] = this.target[0] - (Math.abs(dx) < E ? 0 : dx)
			this.position[1] = this.target[1] - (Math.abs(dy) < E ? 0 : dy)
			this.position[2] = this.target[2] - (Math.abs(dz) < E ? 0 : dz)

			this.positionChanged++
		}

		if(this.positionUpdated !== this.positionChanged) {
			this.positionUpdated = this.positionChanged

			this.updateMatrixWorld()
		}
	}
}
