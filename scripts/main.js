var main = {}

dom.ready(function() {

	main.vp    = dom.one('.viewport')
	main.cvs   = dom.one('.place')

	main.vrate = dom.one('.rate-field .value')
	main.vseek = dom.one('.seek-field .value')

	main.brate = new Bar(dom.one('.rate'))
	main.bseek = new Bar(dom.one('.seek'))

	main.get   = new Loader
	main.timer = new Timer(tick)
	main.pan   = new Drag(main.vp)

	main.get.json('data/place-meta.json').defer.then(parseMeta)

	main.bootTimer = new Timer(bootFunc).play()
})

function bootFunc() {
	bootProgress((1 - 1e-8) * main.get.bytesLoaded / main.get.bytesTotal)
}

function init() {
	main.bootTimer.stop()


	main.cvs.width  = main.sizeX
	main.cvs.height = main.sizeY
	main.ctx = main.cvs.getContext('2d')
	main.ctx.imageSmoothingEnabled = false

	main.ctx.fillStyle = 'white'
	main.ctx.fillRect(0, 0, main.sizeX, main.sizeY)
	main.idat = main.ctx.getImageData(0, 0, main.sizeX, main.sizeY)
	main.grid = new Uint8Array(main.sizeX * main.sizeY)
	main.grid.fill(main.meta.colors.indexOf('#FFFFFF'))

	main.pan.events.on('drag', updateTransform)

	dom.on('wheel', main.vp, onwheel)
	dom.on('resize', window, onresize)
	dom.on('keydown', window, onkey)

	var zin  = dom.one('.zoom-in')
	,   zout = dom.one('.zoom-out')
	,   zfit = dom.one('.zoom-fit')

	dom.on('tap', zin,  f.binda(zoom,  null, [  2, 0, 0]))
	dom.on('tap', zout, f.binda(zoom,  null, [1/2, 0, 0]))
	dom.on('tap', zfit, fit)

	var zic = zin.getContext('2d')
	zic.scale(4, 4)
	zic.fillRect(1, 3, 5, 1)
	zic.fillRect(3, 1, 1, 5)

	var zoc = zout.getContext('2d')
	zoc.scale(4, 4)
	zoc.fillRect(1, 3, 5, 1)

	var zfc = zfit.getContext('2d')
	zfc.scale(4, 4)
	zfc.fillRect(1, 1, 5, 5)
	zfc.clearRect(2, 2, 3, 3)
	zfc.clearRect(3, 1, 1, 5)
	zfc.clearRect(1, 3, 5, 1)

	setTimeout(run)
}

function run() {
	bootProgress(1)
	onresize()
	updateTransform()

	main.frame = 0
	main.brate.set(0.539685, true)
	main.timer.play()
}

function tick(t) {

	if(main.brate.changed) {
		main.brate.changed = false

		var pos  = main.brate.position * 2 - 1
		,   dir  = pos / Math.abs(pos)
		,   rate = dir * Math.pow(Math.abs(pos), 3) * 5000

		main.timer.rate = isNaN(dir) ? 0 : rate
		dom.text(main.vrate, f.hround(main.timer.rate))
	}

	if(main.bseek.changed) {
		main.bseek.changed = false

		t = main.timer.time = main.bseek.position * main.hitLength
	}


	if(t < 0) {
		t = main.timer.time = 0
	}

	if(t > main.hitLoaded -1) {
		t = main.timer.time = main.hitLoaded -1
	}

	var frames = Math.round(t - main.frame)
	if(!frames) {
		main.bseek.set(main.frame / main.hitLength)
		return
	}

	var hits = frames > 0 ? main.hitColors : main.hitBackwd
	,   step = frames / Math.abs(frames)
	,   end = main.frame + frames

	for(var i = main.frame; i !== end; i += step) {
		main.grid[main.hitCoords[i]] = hits[i]
	}
	main.frame = end


	var d = main.idat.data
	for(var i = 0; i < main.grid.length; i++) {
		var c = main.colors[main.grid[i]]
		,   p = i * 4

		d[p +0] = c[0]
		d[p +1] = c[1]
		d[p +2] = c[2]
	}
	main.ctx.putImageData(main.idat, 0, 0)

	main.bseek.set(main.frame / main.hitLength)
	dom.text(main.vseek, main.frame)
}

function onresize() {

}

function onkey(e) {
	if(!kbd.changed) return

	var hk = true
	switch(kbd.key) {
		case 'SPACE':
			main.timer.running ? main.timer.stop() : main.timer.play()
		break

		case 'r':
			if(e.ctrlKey) return
			main.timer.time = 0
		break

		default:
			hk = false
		break
	}

	if(hk) e.preventDefault()
}

function onwheel(e) {
	var delta = e.wheelDeltaY || -e.deltaY
	,   value = delta / Math.abs(delta)

	var x = e.pageX - main.sizeX / 2
	,   y = e.pageY - main.sizeY / 2
	,   s = value > 0 ? 2 : 1/2

	zoom(s, x, y)

	e.preventDefault()
}

function zoom(s, x, y) {
	scale(main.scale * s, x, y)
}

function fit() {
	main.pan.offset.x = 0
	main.pan.offset.y = 0


	var sx = window.innerWidth / main.sizeX
	,   sy = window.innerHeight / main.sizeY
	,   sv = Math.floor(Math.log2(Math.min(sx, sy)))

	scale(sv > 0 ? 1 << sv : 1 / (1 << Math.abs(sv)), 0, 0)
}

function scale(v, x, y) {
	var s = Math.min(32, Math.max(1/8, v))

	var os = main.scale
	,   ds = 1 / s - 1 / os

	if(arguments.length <3) {
		x = 0
		y = 0
	}

	main.pan.offset.x += x * ds
	main.pan.offset.y += y * ds
	main.pan.scale = 1 / s

	main.scale = s

	updateTransform()
}

function updateTransform() {
	var s = main.scale
	,   x = main.pan.offset.x - main.sizeX / 2 + main.vp.offsetWidth  / 2
	,   y = main.pan.offset.y - main.sizeY / 2 + main.vp.offsetHeight / 2

	main.cvs.style.transform = ''
		+' scale('+ s +')'
		+' translate('+ x +'px,'+ y +'px)'
}

function parseMeta(data) {
	var key = new URLSearchParams(location.search).get("d")
	var meta = data[key] || data.base

	main.meta = meta
	main.scale = meta.scale
	main.sizeX = meta.sizeX
	main.sizeY = meta.sizeY
	main.colors = meta.colors.map(parseColor)

	main.hitLength = meta.points
	main.hitLoaded = 0
	main.hitCoords = new Uint32Array(meta.points)
	main.hitColors = new Uint8Array(meta.points)
	main.hitBackwd = new Uint8Array(meta.points)

	main.gridTemp = new Uint8Array(main.sizeX * main.sizeY)
	main.gridTemp.fill(main.meta.colors.indexOf('#FFFFFF'))

	downloadChunk(0)
	main.get.ready(init)
}

function parseColor(color) {
	var r = parseInt(color.slice(1, 3), 16)
	,   g = parseInt(color.slice(3, 5), 16)
	,   b = parseInt(color.slice(5, 7), 16)

	return [r, g, b]
}

function downloadChunk(index) {
	var chunk = main.meta.chunks[index]
	if (!chunk) return

	main.get.buffer(chunk.path).defer.then(data => {
		decode(chunk, data)
		downloadChunk(index + 1)
	})
}

function decode(chunk, data) {
	var step = chunk.format.reduce(f.sum)
	var size = data.byteLength
	var hits = Math.min(chunk.points, Math.floor(size / step * 8))
	var offset = main.hitLoaded
	var [sx, sy, sc] = chunk.format
	var bin = new BitReader(new Uint8Array(data))

	for(var i = 0; i < hits; i++) {
		var x = bin.read(sx)
		var y = bin.read(sy)
		var c = bin.read(sc)

		var p = x + y * main.sizeX
		var k = i + offset

		main.hitColors[k] = c
		main.hitCoords[k] = p
		main.hitBackwd[k] = main.gridTemp[p]

		main.gridTemp[p] = c
	}

	main.hitLoaded += hits

	var pending = Math.max(0, (main.hitLength - main.hitLoaded) / main.hitLength)
	var elem = dom.one('.pending', main.bseek.element)

	elem.style.width = (pending * 100) +'%'
	elem.style.display = pending ? 'block' : 'none'
}
