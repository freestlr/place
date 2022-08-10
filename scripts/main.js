var main = {}

// var vec3 = glMatrix.vec3
// var mat4 = glMatrix.mat4

dom.ready(function() {

	main.vp    = dom.one('.viewport')
	main.cvs   = dom.one('.place')

	main.vrate = dom.one('.rate-field .value')
	main.vseek = dom.one('.seek-field .value')

	main.brate = new Bar(dom.one('.rate'))
	main.bseek = new Bar(dom.one('.seek'))

	main.get   = new Loader
	main.timer = new Timer(tick)
	main.view  = new Viewport(main.vp)

	main.viewPositionVersion = -1

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
	main.grid.fill(main.meta.startcolor || 0)


	dom.on('resize', window, onresize)
	dom.on('keydown', window, onkey)
	dom.on('keyup', window, onkey)

	var zin  = dom.one('.zoom-in')
	,   zout = dom.one('.zoom-out')
	,   zfit = dom.one('.zoom-fit')

	dom.on('tap', zin,  f.binda(zoom,  null, [1/2]))
	dom.on('tap', zout, f.binda(zoom,  null, [  2]))
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

	main.frame = 0
	main.brate.set(0.539685, true)
	main.timer.play()
	main.view.setDistance(16, Math.max(main.sizeX, main.sizeY) * 1.1)
	main.view.setBorders(main.sizeX, main.sizeY, 100)
	main.view.animationStart()

	fit()
}

function tick(t) {
	updateTransformVP()

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
		var g = main.grid[i] * 3
		var p = i * 4

		d[p +0] = main.colors[g +0]
		d[p +1] = main.colors[g +1]
		d[p +2] = main.colors[g +2]
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
			if(kbd.down) main.timer.running ? main.timer.stop() : main.timer.play()
		break

		case 'ALT':
			main.timer.rate = Math.abs(main.timer.rate) * (e.altKey ? -1 : 1)
		break

		case 'r':
			if(!kbd.down || e.ctrlKey) return
			main.timer.time = 0
		break

		default:
			hk = false
		break
	}

	if(hk) e.preventDefault()
}

function zoom(s) {
	main.view.zoom(s)
}

function fit() {
	main.view.setPosition(0, 0, main.sizeY * 1.1)
}

function updateTransformVP() {
	// var cp = main.view.getCenter()
	// var tl = main.view.getScreenPoint(-main.sizeX / 2, +main.sizeY / 2)
	// var tr = main.view.getScreenPoint(+main.sizeX / 2, +main.sizeY / 2)
	// var bl = main.view.getScreenPoint(-main.sizeX / 2, -main.sizeY / 2)
	// var br = main.view.getScreenPoint(+main.sizeX / 2, -main.sizeY / 2)

	// dom.one('.point.cp').style.transform = ['translate(', cp[0], 'px,', cp[1], 'px)'].join('')
	// dom.one('.point.tl').style.transform = ['translate(', tl[0], 'px,', tl[1], 'px)'].join('')
	// dom.one('.point.tr').style.transform = ['translate(', tr[0], 'px,', tr[1], 'px)'].join('')
	// dom.one('.point.bl').style.transform = ['translate(', bl[0], 'px,', bl[1], 'px)'].join('')
	// dom.one('.point.br').style.transform = ['translate(', br[0], 'px,', br[1], 'px)'].join('')

	if(main.viewPositionVersion !== main.view.positionUpdated) {
		main.viewPositionVersion = main.view.positionUpdated

		var t = main.view.getTransform(main.sizeX, main.sizeY)
		var s = (t[2] + t[3]) / 2

		main.cvs.style.transform = ''
			+' translate('+ t[0] +'px,'+ t[1] +'px)'
			+' scale('+ s +')'
			// +' scale('+ Math.pow(2, Math.round(Math.log2(s))) +')'

		main.cvs.style.transformOrigin = '0 0'
	}
}

function parseMeta(data) {
	var key = new URLSearchParams(location.search).get("d")
	var meta = data[key] || data.base

	main.meta = meta
	main.scale = meta.scale
	main.sizeX = meta.sizeX
	main.sizeY = meta.sizeY
	main.colors = new Uint8Array(meta.colors.length * 3)
	fillColors(main.colors, meta.colors)

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

function fillColors(result, colors) {
	colors.forEach(function(color, index) {
		var parsed = parseColor(color)
		result[index * 3 + 0] = parsed[0]
		result[index * 3 + 1] = parsed[1]
		result[index * 3 + 2] = parsed[2]
	})
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
