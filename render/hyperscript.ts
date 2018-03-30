import Vnode = require("./vnode")

const selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g
const selectorCache: Record<string, any> = {}
const hasOwn = {}.hasOwnProperty

function isEmpty (object: Record<string, any>): boolean {
	for (const key in object) {
		if (hasOwn.call(object, key)) {
			return false
		}
	}
	return true
}

function compileSelector (selector: string): Record<string, any> {
	let match: RegExpExecArray | null
	let tag = "div"
	const classes: string[] = []
	const attrs: Record<string, any> = {}
	while (match = selectorParser.exec(selector)) {
		const type = match[1]
		const value = match[2]
		if (type === "" && value !== "") {
			tag = value
		} else if (type === "#") {
			attrs.id = value
		} else if (type === ".") {
			classes.push(value)
		} else if (match[3][0] === "[") {
			let attrValue = match[6]
			if (attrValue) {
				attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\")
			}
			if (match[4] === "class") {
				classes.push(attrValue)
			} else {
				attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true
			}
		}
	}
	if (classes.length > 0) {
		attrs.className = classes.join(" ")
	}
	return selectorCache[selector] = {tag, attrs}
}

function execSelector (state: any, attrs: Record<string, any>, children: any[]): Vnode {
	let hasAttrs = false
	let childList: any[] | undefined
	let text: string | undefined
	const className: string = attrs.className || attrs.class

	if (!isEmpty(state.attrs) && !isEmpty(attrs)) {
		const newAttrs: Record<string, any> = {}

		for (const key in attrs) {
			if (hasOwn.call(attrs, key)) {
				newAttrs[key] = attrs[key]
			}
		}

		attrs = newAttrs
	}

	for (const key in state.attrs) {
		if (hasOwn.call(state.attrs, key)) {
			attrs[key] = state.attrs[key]
		}
	}

	if (className !== undefined) {
		if (attrs.class !== undefined) {
			attrs.class = undefined
			attrs.className = className
		}

		if (state.attrs.className != null) {
			attrs.className = state.attrs.className + " " + className
		}
	}

	for (const key in attrs) {
		if (hasOwn.call(attrs, key) && key !== "key") {
			hasAttrs = true
			break
		}
	}

	if (Array.isArray(children) && children.length === 1 && children[0] != null && children[0].tag === "#") {
		text = children[0].children
	} else {
		childList = children
	}

	return Vnode(state.tag, attrs.key, hasAttrs ? attrs : undefined, childList, text, null)
}

function hyperscript (selector: any): Vnode {
	// Because sloppy mode sucks
	let attrs: Record<string, any> | undefined = arguments[1]
	let start = 2
	let children: any[]
	let cached: any

	if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
		throw Error("The selector must be either a string or a component.")
	}

	if (typeof selector === "string") {
		cached = selectorCache[selector] || compileSelector(selector)
	}

	if (attrs == null) {
		attrs = {}
	} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
		attrs = {}
		start = 1
	}

	if (arguments.length === start + 1) {
		children = arguments[start]
		if (!Array.isArray(children)) {
			children = [children]
		}
	} else {
		children = []
		while (start < arguments.length) {
			children.push(arguments[start++])
		}
	}

	const normalized = Vnode.normalizeChildren(children)

	if (typeof selector === "string") {
		return execSelector(cached, attrs, normalized)
	} else {
		return Vnode(selector, attrs.key, attrs, normalized, undefined, null)
	}
}

export = hyperscript
