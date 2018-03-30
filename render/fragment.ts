import Vnode = require("./vnode")

export = function fragment (attrs: Record<string, any>, children: any[]): Vnode {
	return Vnode("[", attrs.key, attrs, Vnode.normalizeChildren(children), undefined, null)
}
