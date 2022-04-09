function BitReader(array) {
	this.position = 0
	this.buffer = 0
	this.offset = 0
	this.array = array // Uint8Array
}

BitReader.prototype = {
	read: function(size) {
		if(!size) return 0

		while(this.offset < size) {
			this.buffer |= this.array[this.position ++] << this.offset
			this.offset += 8
		}

		var value = this.buffer & ((1 << size) -1)

		this.buffer >>= size
		this.offset -= size

		return value
	}
}


function BitWriter(size) {
	this.position = 0
	this.buffer = 0
	this.offset = 0
	this.array = new Uint8Array(size)
}

BitWriter.prototype = {
	write: function(size, value) {
		if(!size) return

		this.buffer |= value << this.offset
		this.offset += size

		while(this.offset > 7) {
			this.array[this.position ++] = this.buffer & 0xff
			this.buffer >>= 8
			this.offset -= 8
		}
	},

	writeEnd: function() {
		this.write(8 - this.offset, 0)
	},
}


if (typeof module !== 'undefined') {
	module.exports = { BitReader, BitWriter }
}
