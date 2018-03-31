import Vnode = require("./render/vnode")
import hyperscript = require("./render/hyperscript")
import trust = require("./render/trust")
import fragment = require("./render/fragment")

interface Hyperscript {
	(selector: string): Vnode
	trust(html: string): Vnode
	fragment(attrs: Record<string, any>, children: Vnode[]): Vnode
}

const Hyperscript: Hyperscript = hyperscript as Hyperscript
Hyperscript.trust = trust
Hyperscript.fragment = fragment

export = Hyperscript
