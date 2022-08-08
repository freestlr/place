/**
 * extra-light version of gl-matrix
 * source: https://github.com/toji/gl-matrix
 */

let isTyped = typeof Float32Array !== "undefined"
let glMatrix = {
	IS_TYPED: isTyped,
	ARRAY_TYPE: isTyped ? Float32Array : Array,
}




let vec3 = {}

vec3.create = function() {
	let out = new glMatrix.ARRAY_TYPE(3)
	if(!glMatrix.IS_TYPED) {
		out[0] = 0
		out[1] = 0
		out[2] = 0
	}
	return out
}

vec3.fromValues = function(x, y, z) {
	let out = new glMatrix.ARRAY_TYPE(3)
	out[0] = x
	out[1] = y
	out[2] = z
	return out
}

vec3.copy = function(out, a) {
	out[0] = a[0]
	out[1] = a[1]
	out[2] = a[2]
	return out
}

vec3.set = function(out, x, y, z) {
	out[0] = x
	out[1] = y
	out[2] = z
	return out
}

vec3.add = function(out, a, b) {
	out[0] = a[0] + b[0]
	out[1] = a[1] + b[1]
	out[2] = a[2] + b[2]
	return out
}

vec3.sub = function(out, a, b) {
	out[0] = a[0] - b[0]
	out[1] = a[1] - b[1]
	out[2] = a[2] - b[2]
	return out
}

vec3.scale = function(out, a, b) {
	out[0] = a[0] * b
	out[1] = a[1] * b
	out[2] = a[2] * b
	return out
}

vec3.normalize = function(out, a) {
	let x = a[0]
	let y = a[1]
	let z = a[2]
	let len = x * x + y * y + z * z
	if(len > 0) {
		len = 1 / Math.sqrt(len)
	}
	out[0] = a[0] * len
	out[1] = a[1] * len
	out[2] = a[2] * len
	return out
}

vec3.dot = function(a, b) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

vec3.transformMat4 = function(out, a, m) {
	let x = a[0]
	let y = a[1]
	let z = a[2]
	let w = m[3] * x + m[7] * y + m[11] * z + m[15]

	w = 1 / (w || 1.0)
	out[0] = (m[0] * x + m[4] * y + m[ 8] * z + m[12]) * w
	out[1] = (m[1] * x + m[5] * y + m[ 9] * z + m[13]) * w
	out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) * w
	return out
}



let mat4 = {}

mat4.create = function() {
	let out = new glMatrix.ARRAY_TYPE(16)
	if(!glMatrix.IS_TYPED) {
		out[ 1] = 0
		out[ 2] = 0
		out[ 3] = 0
		out[ 4] = 0
		out[ 6] = 0
		out[ 7] = 0
		out[ 8] = 0
		out[ 9] = 0
		out[11] = 0
		out[12] = 0
		out[13] = 0
		out[14] = 0
	}
	out[ 0] = 1
	out[ 5] = 1
	out[10] = 1
	out[15] = 1
	return out
}

mat4.copy = function(out, a) {
	out[ 0] = a[ 0]
	out[ 1] = a[ 1]
	out[ 2] = a[ 2]
	out[ 3] = a[ 3]
	out[ 4] = a[ 4]
	out[ 5] = a[ 5]
	out[ 6] = a[ 6]
	out[ 7] = a[ 7]
	out[ 8] = a[ 8]
	out[ 9] = a[ 9]
	out[10] = a[10]
	out[11] = a[11]
	out[12] = a[12]
	out[13] = a[13]
	out[14] = a[14]
	out[15] = a[15]
	return out
}

mat4.transpose = function(out, a) {
  if(out === a) {
	  let a01 = a[ 1]
	  let a02 = a[ 2]
	  let a03 = a[ 3]
	  let a12 = a[ 6]
	  let a13 = a[ 7]
	  let a23 = a[11]

	  out[ 1] = a[4]
	  out[ 2] = a[8]
	  out[ 3] = a[12]
	  out[ 4] = a01
	  out[ 6] = a[9]
	  out[ 7] = a[13]
	  out[ 8] = a02
	  out[ 9] = a12
	  out[11] = a[14]
	  out[12] = a03
	  out[13] = a13
	  out[14] = a23

  } else {
	  out[ 0] = a[ 0]
	  out[ 1] = a[ 4]
	  out[ 2] = a[ 8]
	  out[ 3] = a[12]
	  out[ 4] = a[ 1]
	  out[ 5] = a[ 5]
	  out[ 6] = a[ 9]
	  out[ 7] = a[13]
	  out[ 8] = a[ 2]
	  out[ 9] = a[ 6]
	  out[10] = a[10]
	  out[11] = a[14]
	  out[12] = a[ 3]
	  out[13] = a[ 7]
	  out[14] = a[11]
	  out[15] = a[15]
  }

  return out
}

mat4.invert = function(out, a) {
	let a00 = a[ 0]
	let a01 = a[ 1]
	let a02 = a[ 2]
	let a03 = a[ 3]
	let a10 = a[ 4]
	let a11 = a[ 5]
	let a12 = a[ 6]
	let a13 = a[ 7]
	let a20 = a[ 8]
	let a21 = a[ 9]
	let a22 = a[10]
	let a23 = a[11]
	let a30 = a[12]
	let a31 = a[13]
	let a32 = a[14]
	let a33 = a[15]

	let b00 = a00 * a11 - a01 * a10
	let b01 = a00 * a12 - a02 * a10
	let b02 = a00 * a13 - a03 * a10
	let b03 = a01 * a12 - a02 * a11
	let b04 = a01 * a13 - a03 * a11
	let b05 = a02 * a13 - a03 * a12
	let b06 = a20 * a31 - a21 * a30
	let b07 = a20 * a32 - a22 * a30
	let b08 = a20 * a33 - a23 * a30
	let b09 = a21 * a32 - a22 * a31
	let b10 = a21 * a33 - a23 * a31
	let b11 = a22 * a33 - a23 * a32

	let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06
	if(!det) return null
	det = 1.0 / det

	out[ 0] = (a11 * b11 - a12 * b10 + a13 * b09) * det
	out[ 1] = (a02 * b10 - a01 * b11 - a03 * b09) * det
	out[ 2] = (a31 * b05 - a32 * b04 + a33 * b03) * det
	out[ 3] = (a22 * b04 - a21 * b05 - a23 * b03) * det
	out[ 4] = (a12 * b08 - a10 * b11 - a13 * b07) * det
	out[ 5] = (a00 * b11 - a02 * b08 + a03 * b07) * det
	out[ 6] = (a32 * b02 - a30 * b05 - a33 * b01) * det
	out[ 7] = (a20 * b05 - a22 * b02 + a23 * b01) * det
	out[ 8] = (a10 * b10 - a11 * b08 + a13 * b06) * det
	out[ 9] = (a01 * b08 - a00 * b10 - a03 * b06) * det
	out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det
	out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det
	out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det
	out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det
	out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det
	out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det

	return out
}

mat4.determinant = function(a) {
	let a00 = a[ 0]
	let a01 = a[ 1]
	let a02 = a[ 2]
	let a03 = a[ 3]
	let a10 = a[ 4]
	let a11 = a[ 5]
	let a12 = a[ 6]
	let a13 = a[ 7]
	let a20 = a[ 8]
	let a21 = a[ 9]
	let a22 = a[10]
	let a23 = a[11]
	let a30 = a[12]
	let a31 = a[13]
	let a32 = a[14]
	let a33 = a[15]

	let b0 = a00 * a11 - a01 * a10
	let b1 = a00 * a12 - a02 * a10
	let b2 = a01 * a12 - a02 * a11
	let b3 = a20 * a31 - a21 * a30
	let b4 = a20 * a32 - a22 * a30
	let b5 = a21 * a32 - a22 * a31
	let b6 = a00 * b5 - a01 * b4 + a02 * b3
	let b7 = a10 * b5 - a11 * b4 + a12 * b3
	let b8 = a20 * b2 - a21 * b1 + a22 * b0
	let b9 = a30 * b2 - a31 * b1 + a32 * b0

	return a13 * b6 - a03 * b7 + a33 * b8 - a23 * b9
}

mat4.multiply = function(out, a, b) {
	let a00 = a[0]
	let a01 = a[1]
	let a02 = a[2]
	let a03 = a[3]
	let a10 = a[4]
	let a11 = a[5]
	let a12 = a[6]
	let a13 = a[7]
	let a20 = a[8]
	let a21 = a[9]
	let a22 = a[10]
	let a23 = a[11]
	let a30 = a[12]
	let a31 = a[13]
	let a32 = a[14]
	let a33 = a[15]

	let b0 = b[0]
	let b1 = b[1]
	let b2 = b[2]
	let b3 = b[3]
	out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
	out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
	out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
	out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

	b0 = b[4]
	b1 = b[5]
	b2 = b[6]
	b3 = b[7]
	out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
	out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
	out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
	out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

	b0 = b[ 8]
	b1 = b[ 9]
	b2 = b[10]
	b3 = b[11]
	out[ 8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
	out[ 9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
	out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
	out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

	b0 = b[12]
	b1 = b[13]
	b2 = b[14]
	b3 = b[15]
	out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
	out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
	out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
	out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33
	return out
}

mat4.fromTranslation = function(out, v) {
	out[ 0] = 1
	out[ 1] = 0
	out[ 2] = 0
	out[ 3] = 0
	out[ 4] = 0
	out[ 5] = 1
	out[ 6] = 0
	out[ 7] = 0
	out[ 8] = 0
	out[ 9] = 0
	out[10] = 1
	out[11] = 0
	out[12] = v[0]
	out[13] = v[1]
	out[14] = v[2]
	out[15] = 1
	return out
}

mat4.perspective = function(out, fovy, aspect, near, far) {
	const f = 1 / Math.tan(fovy / 2)
	out[ 0] = f / aspect
	out[ 1] = 0
	out[ 2] = 0
	out[ 3] = 0
	out[ 4] = 0
	out[ 5] = f
	out[ 6] = 0
	out[ 7] = 0
	out[ 8] = 0
	out[ 9] = 0
	out[11] = -1
	out[12] = 0
	out[13] = 0
	out[15] = 0
	if(far != null && far !== Infinity) {
		const nf = 1 / (near - far)
		out[10] = (far + near) * nf
		out[14] = 2 * far * near * nf
	} else {
		out[10] = -1
		out[14] = -2 * near
	}
	return out
}
