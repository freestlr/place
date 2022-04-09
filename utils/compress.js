const fs = require('fs');
const stream = require('stream');
const { BitWriter } = require('../scripts/base/Bit');

const [node, script, format, fileIn, fileOut] = process.argv;
if (!format || !fileIn || !fileOut || !fs.statSync(fileIn).isFile()) {
	console.log(`usage: node compress.js format fileIn fileOut\n
       [format] is "x,y,c" where each digit is a number of bits for the field
                for example, "10,10,4" gives 10 bits for x and y, and 4 bits for color\n
       [fileIn] should be text file of the following format:
                x1 y1 c1
                x2 y2 c2
                x3 y3 c3
                ...
                where x and y is point coordinates, and c is color index`)
	process.exit(1)
}

const [sx, sy, sc] = format.split(',').map(Number)
const rs = fs.createReadStream(fileIn)
const ws = fs.createWriteStream(fileOut)
const ts = new stream.Transform({ transform, flush })


let prev = ''
function transform(data, encoding, callback) {
	const lines = Buffer.concat([Buffer.from(prev), data]).toString().split('\n')
	const tail = lines.length % 8
	prev = lines.splice(-tail, tail).join('\n')
	callback(null, compressLines(lines))
}

function flush(callback) {
	callback(null, compressLines([prev]))
}

function compressLines(lines) {
	const bin = new BitWriter(Math.ceil(lines.length * (sx + sy + sc) / 8))

	for(let i = 0; i < lines.length; i++) {
		const [x, y, c] = lines[i].split(' ')

		bin.write(sx, +x)
		bin.write(sy, +y)
		bin.write(sc, +c)
	}
	bin.writeEnd()
	return bin.array
}


ts.pipe(ws)
rs.pipe(ts)
