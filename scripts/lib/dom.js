dom = {}

dom.one = function(selector, root) {
	return (root || document).querySelector(selector)
}

dom.all = function(selector, root) {
	return [].slice.call((root || document).querySelectorAll(selector))
}

dom.elem = function(tag, name, root) {
	var elem = document.createElement(tag)
	if(name) elem.className = name
	if(root) root.appendChild(elem)
	return elem
}

dom.div = function(name, root) {
	return dom.elem('div', name, root)
}

dom.img = function(src, name, root) {
	var img = dom.elem('img', name, root)
	if(src) img.src = src
	return img
}

dom.a = function(href, name, root) {
	var a = dom.elem('a', name, root)
	a.href = href
	return a
}

dom.append = function(root, elem) {
	if(root instanceof Node
	&& elem instanceof Node) root.appendChild(elem)
}

dom.prepend = function(root, elem) {
	if(root instanceof Node
	&& elem instanceof Node) root.insertBefore(elem, root.firstChild)
}

dom.insert = function(root, elem, next) {
	if(root instanceof Node
	&& elem instanceof Node) root.insertBefore(elem, next instanceof Node ? next : null)
}

dom.remove = function(elem) {
	elem && elem.parentNode && elem.parentNode.removeChild(elem)
}

dom.empty = function(elem) {
	// can throw Not Found Exception (wtf?) on blur event
	while(elem.firstChild) elem.removeChild(elem.firstChild)
}

dom.children = (function() {
	var _slice = Array.prototype.slice
	function isElement(node) {
		return node.nodeType === Node.ELEMENT_NODE
	}
	return function(elem) {
		return _slice.call(elem.childNodes).filter(isElement)
	}
})()

dom.ancestor = function(child, parent) {
	while(child) {
		if(child === parent) return true
		child = child.parentNode
	}
}

dom.onceover = function(event, element) {
	return !dom.ancestor(event.relatedTarget, element)
		&&  dom.ancestor(event.target, element)
}

dom.onceout = function(event, element) {
	return !dom.ancestor(event.relatedTarget, element)
}

dom.on = function(type, elem, fn, capture) {
	elem.addEventListener(type, fn, !!capture)
}

dom.off = function(type, elem, fn, capture) {
	elem.removeEventListener(type, fn, !!capture)
}

dom.pos = function(elem, x, y) {
	if(!elem) return

	if(x != null) elem.style.left = typeof x === 'number' ? Math.round(x) +'px' : x
	if(y != null) elem.style.top  = typeof y === 'number' ? Math.round(y) +'px' : y
}
dom.size = function(elem, w, h) {
	if(!elem) return

	if(w != null) elem.style.width  = typeof w === 'number' ? Math.round(w) +'px' : w
	if(w != null) elem.style.height = typeof h === 'number' ? Math.round(h) +'px' : h
}

dom.style = function(elem, props) {
	f.copy(elem.style, props)
}

dom.xstyle = function(elem, name, value) {
	var s = elem.style
	s['-webkit-'+ name] = value
	s[   '-moz-'+ name] = value
	s[    '-ms-'+ name] = value
	s[     '-o-'+ name] = value
	s[            name] = value
}

dom.html = function(elem, content) {
	elem.innerHTML = content
}

dom.text = function(elem, content) {
	elem.textContent = content
}

dom.display = function(elem, visible, value) {
	elem.style.display = visible ? value != null ? value : 'block' : 'none'
}

dom.visible = function(elem, visible) {
	elem.style.visibility = visible ? 'visible' : 'hidden'
}

dom.respace = /\s+/

dom.addclass = function(elem, name) {
	if(!elem || !name) return

	var left = elem.className.split(dom.respace)
	,   right = name.split(dom.respace)
	,   rest = f.sor(left, right)

	if(f.snot(rest, left).length) elem.className = rest.join(' ')
}

dom.remclass = function(elem, name) {
	if(!elem || !name) return

	var left = elem.className.split(dom.respace)
	,   right = name.split(dom.respace)
	,   rest = f.snot(left, right)

	if(f.snot(left, rest).length) elem.className = rest.join(' ')
}

dom.hasclass = function(elem, name, any) {
	if(!elem || !name) return

	var left = elem.className.split(dom.respace)
	,   right = name.split(dom.respace)
	,   found = f.sand(left, right).length

	return any ? found : found === right.length
}

dom.togclass = function(elem, name, state) {
	if(!elem || !name) return

	if(arguments.length <3) state = !dom.hasclass(elem, name)
	;(state ? dom.addclass : dom.remclass)(elem, name)
}

dom.offset = function(elem, root, scroll) {
	for(var x = 0, y = 0; elem && elem !== root; elem = elem.offsetParent) {
		x += elem.offsetLeft || 0
		y += elem.offsetTop  || 0

		if(scroll) {
			x -= elem.scrollLeft || 0
			y -= elem.scrollTop  || 0
		}
	}
	return { x: x, y: y }
}

dom.out = function(text) {
	var ta = dom.elem('textarea', null, document.body)
	dom.style(ta, {
		position: 'absolute', zIndex: 9000,
		top: 0, left: 0, right: 0, bottom: 0,
		width: '80%', height: '80%', margin: 'auto'
	})
	dom.text(ta, text)
	ta.focus()
}

dom.ready = function(callback) {
	if('complete' === document.readyState) {
		callback()
	} else {
		document.addEventListener('DOMContentLoaded', complete)
		window.addEventListener('load', complete)
	}
	function complete() {
		document.removeEventListener('DOMContentLoaded', complete)
		window.removeEventListener('load', complete)
		callback()
	}
}
