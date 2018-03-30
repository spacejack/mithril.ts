import Vnode = require("./vnode")

export = function trust (html: string): Vnode {
	if (html == null) {
		html = ""
	}
	return Vnode("<", undefined, undefined, html, undefined, null)
}
