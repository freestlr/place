f = {}

f.nop = function() {}

f.identity = function(a) {
	return a
}

f.sum = function(a, b) {
	return a + b
}
f.sub = function(a, b) {
	return a - b
}

f.nsort = function(name, invert) {
	var v = Math.pow(-1, +!!invert)
	return function(a, b) {
		return a == null || b == null ? -1 : v * (a[name] - b[name])
	}
}

f.zerosort = function(a, b) {
	return a && b ? a[0] - b[0] : 0
}

f.sort = function(array, func, scope) {
	var l = array.length
	,   r = []
	for(var i = 0; i < l; i++) {
		var e = array[i]
		r.push( [func.call(scope, e), e] )
	}
	r.sort(f.zerosort)
	for(var i = 0; i < l; i++) {
		array[i] = r[i][1]
	}
	return array
}

f.max = function(array) {
	return Math.max.apply(0, array)
}

f.min = function(array) {
	return Math.min.apply(0, array)
}

f.amap = function(array, func, scope, a, b, c) {
	if(array && array.length && typeof func === 'function') {

		for(var i = 0, r = []; i < array.length; i++) {
			r.push(func.call(scope, array[i], a, b, c))
		}
	}

	return r
}

f.apick = function(array, name, value, negate) {
	if(array) for(var i = 0, l = array.length, item; i < l; i++) {
		item = array[i]
		if((item && item[name] === value) ^ negate) return item
	}
}
f.apickf = function(array, func, scope, negate) {
	if(array) for(var i = 0, l = array.length, item; i < l; i++) {
		item = array[i]
		if(func.call(scope, item) ^ negate) return item
	}
}

f.afind = function(array, name, value, negate) {
	if(array) for(var i = 0, l = array.length, item, r = []; i < l; i++) {
		item = array[i]
		if((item && item[name] === value) ^ negate) r.push(item)
	}
	return r
}
f.afindf = function(array, func, scope, negate) {
	if(array) for(var i = 0, l = array.length, item, r = []; i < l; i++) {
		item = array[i]
		if(func.call(scope, item) ^ negate) r.push(item)
	}
	return r
}

f.adiff = function(next, prev) {
	var diff = {
		prev : prev || [],
		next : next || [],
		rem  : [],
		remi : [],
		remc : 0,
		add  : [],
		addi : [],
		addc : 0
	}

	for(var a = diff.prev.length -1; a >= 0; a--) {
		var e = diff.prev[a]
		,   b = diff.next.indexOf(e)

		if(b === -1) {
			diff.rem.push(e)
			diff.remi.push(a)
			diff.remc++
		}
	}

	for(var b = 0; b < diff.next.length; b++) {
		var e = diff.next[b]
		,   a = diff.prev.indexOf(e)

		if(a === -1) {
			diff.add.push(e)
			diff.addi.push(b)
			diff.addc++
		}
	}

	return diff
}

f.adrop = function(array, item) {
	var index = array.indexOf(item)
	if(~index) array.splice(index, 1)
	return array
}

f.aflat = function(array) {
	return [].concat.apply([], array)
}

f.sor = function() {
	var c = []
	for(var i = 0; i < arguments.length; i++) {
		var a = arguments[i]

		if(a) for(var j = 0; j < a.length; j++) {
			var e = a[j]
			if(c.indexOf(e) === -1) c.push(e)
		}
	}
	return c
}
f.sand = function(a, b) {
	if(!a || !b) return []

	var c = []
	for(var i = 0, l = a.length; i < l; i++) {
		var e = a[i]
		if(b.indexOf(e) !== -1 && c.indexOf(e) === -1) c.push(e)
	}
	return c
}
f.sxor = function(a, b) {
	if(!a || !b) return a ? a : b ? b : []

	var c = [].concat(a, b)
	for(var i = c.length -1; i >= 0; i--) {
		var j = c.indexOf(c[i])

		if(i !== j) {
			c.splice(i, 1)
			c.splice(j, 1)
			i--
		}
	}
	return c
}
f.snot = function(a, b) {
	a = a || []
	b = b || []

	var c = []
	for(var i = 0, l = a.length; i < l; i++) {
		var e = a[i]
		if(b.indexOf(e) === -1 && c.indexOf(e) === -1) c.push(e)
	}
	return c
}


f.uniqp = function(invert, dropMultiple) {
	return function(e, i, a) {
		return !invert ^ (a.indexOf(e) === (dropMultiple ? a.lastIndexOf(e) : i))
	}
}
f.uniq = function(e, i, a) {
	return a.indexOf(e) === i
}
f.uniqi = function(e, i, a) {
	return a.indexOf(e) !== i
}
f.uniqm = function(e, i, a) {
	return a.indexOf(e) === a.lastIndexOf(e)
}
f.uniqim = function(e, i, a) {
	return a.indexOf(e) !== a.lastIndexOf(e)
}


f.clamp = function(num, min, max) {
	return num < min ? min : num > max ? max : num
}

f.rand = function(num) {
	return Math.random() * (+num || 1) |0
}

f.any = function(array) {
	return array && array[f.rand(array.length)]
}

f.exp = function(val) {
	var exp  = 0
	,   absv = Math.abs(val)

	if(absv === 0
	|| absv === Infinity
	|| absv === NaN) return absv

	if(absv < 1) for(; Math.pow(10, exp    ) >  absv; exp--);
	else         for(; Math.pow(10, exp + 1) <= absv; exp++);
	return exp
}

f.hround = function(val) {
	return Math.round(val * 100) / 100
}

f.pround = function(val, exp) {
	var precision = +exp || 0

	if(precision < 0) {
		var add = Math.pow(10, -precision)
		return Math.round(val / add) * add
	} else {
		var add = Math.pow(10,  precision)
		return Math.round(val * add) / add
	}
}

f.mround = function(val, mant) {
	return f.pround(val, mant - f.exp(val))
}

f.xrad = Math.PI / 180
f.torad = function(val) {
	return val * f.xrad
}

f.xdeg = 180 / Math.PI
f.todeg = function(val) {
	return val * f.xdeg
}

f.prop = function(name) {
	var args = arguments

	return function(item) {
		for(var i = 0; item && i < args.length; i++) item = item[args[i]]
		return item
	}
}

f.pset = function(name, value) {
	return function(item) {
		item[name] = value
	}
}

f.func = function(name) {
	for(var args = [], i = 1; i < arguments.length; i++) args.push(arguments[i])

	return function(item) {
		return item[name] && item[name].apply && item[name].apply(item, args)
	}
}

f.range = function(length) {
	length = +length || 0
	for(var r = [], i = 0; i < length; i++) r.push(i)
	return r
}

f.rangep = function(length, start, step) {
	length = isNaN(length) ? 0 : +length
	start  = start == null ? 0 : start
	step   = step  == null ? typeof start === 'number' ? 1 : 0 : step
	for(var r = [], i = 0; i < length; i++) r.push(step ? i * step + start : start)
	return r
}

f.qsenc = function(object) {
	var pairs = []
	for(var key in object) {
		var ken = encodeURIComponent(key)
		,   val = object[key]
		if(val == null) continue

		if(val instanceof Array) {
			for(var i = 0; i < val.length; i++) {
				pairs.push(ken +'='+ encodeURIComponent(val[i]))
			}
		} else {
			pairs.push(ken +'='+ encodeURIComponent(val))
		}
	}
	return pairs.join('&')
}

f.qsdec = function(string) {
	var object = {}
	,   pairs  = string.split('&')

	for(var i = 0; i < pairs.length; i++) {
		var pair = pairs[i].split('=')
		,   key = decodeURIComponent(pair[0])
		,   val = decodeURIComponent(pair[1])

		if(key in object) {
			var old = object[key]
			if(old instanceof Array) old.push(val)
			else object[key] = [old, val]

		} else {
			object[key] = val
		}
	}
	return object
}

f.follow = function(item, name) {
	for(var stack = []; item; item = item[name]) {
		stack.push(item)
	}
	return stack
}

f.copy = function(destination, source) {
	for(var name in source) {
		if(Object.prototype.hasOwnProperty.call(source, name)) {
			destination[name] = source[name]
		}
	}
	return destination
}

f.merge = function() {
	for(var r = {}, i = 0; i < arguments.length; i++) f.copy(r, arguments[i])
	return r
}

f.throttle = function(delay, fn) {
	var last = 0
	return function() {
		var now = new Date
		if(now - last > delay) {
			last = now
			return fn.apply(this, arguments)
		}
	}
}

f.postpone = function(delay, fn) {
	var timer
	return function() {
		clearTimeout(timer)
		timer = setTimeout(fn, delay)
	}
}

f.implode = function(string, data, skip) {
	return string.replace(/#\{(\w+)\}/g, function(match, name) {
		return name in data ? data[name] : skip ? match : ''
	})
}

f.nzformat = function(num, size) {
	if(isNaN(num)) return num +''

	var abs  = Math.abs(num)
	,   diff = size - Math.max(0, f.exp(abs))
	,   gap  = diff > 1 ? Array(diff).join('0') : ''
	return (num < abs ? '-' : '') + gap + abs
}

f.nformat = function(num, size, zero) {
	var abs  = Math.abs(num)
	,   neg  = num < abs
	,   exp  = isNaN(num) ? 2 : f.exp(abs)
	,   fill = zero ? '0' : ' '
	,   diff = size - Math.max(0, exp) - neg - 1
	,   gap  = diff > 1 ? Array(diff).join(fill) : ''
	,   sign =  zero && neg ? '-' : fill
	,   val  = !zero && neg ? num : abs
	return sign + gap + val
}

f.dformat = function(date, format) {
	var map = {
		'Y': 'getFullYear',
		'M': 'getMonth',
		'D': 'getDate',
		'h': 'getHours',
		'i': 'getMinutes',
		's': 'getSeconds'
	}
	var add = {
		'M': 1
	}
	return format.replace(/([YMDhis])(\1+)?/g, function(all, one) {
		return f.nzformat(date[map[one]]() + (add[one] || 0), all.length)
	})
}

f.rgb = function(rgb) {
	return 'rgb('+ [
		rgb[0] * 255 |0,
		rgb[1] * 255 |0,
		rgb[2] * 255 |0 ] +')'
}

f.rgba = function(rgb, a) {
	return 'rgba('+ [
		rgb[0] * 255 |0,
		rgb[1] * 255 |0,
		rgb[2] * 255 |0
	].concat(isNaN(a) ? 1 : +a) +')'
}

f.rcolor = function(alpha) {
	return 'rgba('+ [255,255,255].map(f.rand).concat(+alpha || 1) +')'
}

f.softcolor = function(frac) {
	var t = 2 * Math.PI
	var r = t * frac

	return [
		Math.cos(r          ) / 2 + 0.5,
		Math.cos(r + 2/3 * t) / 2 + 0.5,
		Math.cos(r + 1/3 * t) / 2 + 0.5 ]
}

f.mitm = function(object, method, watcher, modify) {
	var original = object[method]
	,   callable = typeof original === 'function'
	object[method] = function() {
		var result = watcher.call(this, method, arguments, original)
		return modify ? result : callable ? original.apply(this, arguments) : original
	}
}

f.inspect = function(object, func) {
	for(var name in object) if(typeof object[name] === 'function') {
		f.mitm(object, name, func)
	}
}

f.binds = function(func, scope) {
	if(typeof func !== 'function') {
		throw Error('object to bind is not a function')
	}

	return function() {
		return func.apply(scope, arguments)
	}
}
f.binda = function(func, scope, bound) {
	if(typeof func !== 'function') {
		throw Error('object to bind is not a function')
	}

	return function() {
		return func.apply(scope, bound)
	}
}
f.bindr = function(func, scope, bound, replace) {
	if(typeof func !== 'function') {
		throw Error('object to bind is not a function')
	}

	return function() {
		var args = []

		for(var a = 0, b = 0; b < bound.length; b++) {
			args.push(bound[b] === replace ? arguments[a++] : bound[b])
		}
		while(a < arguments.length) args.push(arguments[a++])
		return func.apply(scope, args)
	}
}
f.bind = function(func, scope, bound) {
	if(typeof func !== 'function') throw Error('object to bind is not a function')

	return bound ? function() {
		var args = []

		for(var a = 0, b = 0; b < bound.length; b++) {
			args.push(bound[b] == null ? arguments[a++] : bound[b])
		}
		while(a < arguments.length) args.push(arguments[a++])
		return func.apply(scope, args)

	} : function() {
		return func.apply(scope, arguments)
	}
}

f.callown = function(name, scope) {
	return function(item) {
		if(item
		&& Object.prototype.hasOwnProperty.call(item, name)
		&& typeof item[name] === 'function')
			return item[name].call(scope || item)
	}
}

f.unit = function(parent, object) {
	if(arguments.length <2) {
		object = parent
		parent = null
	}
	var proto = parent ? f.copy(Object.create(parent.prototype), object) : object

	// function Unit() {
	// 	if(typeof this.init === 'function') this.init.apply(this, arguments)
	// }

	var Unit = eval('(function '+ (proto.unitName || 'Unit') +'() {'+
		'if(typeof this.init === "function") this.init.apply(this, arguments)'+
	'})')

	Unit.New = function() {
		var unit = Object.create(Unit.prototype)
		Unit.apply(unit, arguments)
		return unit
	}
	Unit.prototype = proto
	proto.protochain = proto.protochain ? proto.protochain.concat(proto) : [proto]
	proto.constructor = Unit
	return Unit
}
