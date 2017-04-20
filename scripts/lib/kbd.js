kbd = {
	name: {
		L_ARR : 37,
		U_ARR : 38,
		R_ARR : 39,
		D_ARR : 40,

		SHIFT : 16,
		CTRL  : 17,
		ALT   : 18,
		CAPS  : 20,

		ESC   : 27,
		SPACE : 32,
		DEL   : 46,
		ENTER : 13,
		TAB   : 9,
		BKSP  : 8,

		'`': 192,
		'-': 189, '=': 187,
		'[': 219, ']': 221, '\\': 220,
		';': 186, "'": 222,
		',': 188, '.': 190, '/': 191,
	},

	map: [],
	state: {},

	init: function() {
		kbd.setmap()
		kbd.reset()

		window.addEventListener('keydown', kbd.onkeydown, true)
		window.addEventListener('keyup',   kbd.onkeyup,   true)
	},

	setmap: function() {
		for(var i = 48; i <= 57; i++) // 0-9
			kbd.map[i] = String.fromCharCode(i)

		for(var i = 65; i <= 90; i++) // a-z
			kbd.map[i] = String.fromCharCode(i).toLowerCase()

		for(var n in kbd.name) kbd.map[kbd.name[n]] = n
	},

	reset: function() {
		for(var i = 0; i < 0xff; i++) kbd.state[kbd.map[i]] = 0
	},

	onkeydown: function(e) {
		kbd.setkey(e, 1) },

	onkeyup: function(e) {
		kbd.setkey(e, 0) },

	setkey: function(e, down) {
		kbd.event = e
		kbd.down = down
		kbd.key = kbd.map[e.keyCode]
		kbd.changed = kbd.state[kbd.key] !== kbd.down
		kbd.state[kbd.key] = kbd.down

		kbd.state.SHIFT = +e.shiftKey
		kbd.state.CTRL  = +e.ctrlKey
		kbd.state.ALT   = +e.altKey


		var seq = []
		if(kbd.state.CTRL ) seq.push('CTRL')
		if(kbd.state.ALT  ) seq.push('ALT')
		if(kbd.state.SHIFT) seq.push('SHIFT')

		if(kbd.key !== 'CTRL'
		&& kbd.key !== 'ALT'
		&& kbd.key !== 'SHIFT') seq.push(kbd.key)

		kbd.seq = seq.join('+')
	}
}

kbd.init()
