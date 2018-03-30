interface Vnode {
	tag: any
	key: string | number | undefined
	attrs: Record<string, any> | undefined
	state: any
	children: Vnode[] | string | undefined
	text: string | undefined
	events: any
	dom: Node | null
	domSize: number | undefined
	instance: Vnode | undefined
	skip: boolean
}

function Vnode(
	tag: any,
	key: number | string | undefined,
	attrs: Record<string, any> | undefined,
	children: Vnode[] | string | undefined,
	text: string | undefined,
	dom: Node | null
): Vnode {
	return {
		tag, key, attrs, children, text, dom,
		domSize: undefined, state: undefined,
		events: undefined, instance: undefined, skip: false
	}
}

namespace Vnode {
	export function normalize (node: Vnode | Vnode[]): Vnode {
		if (Array.isArray(node)) {
			return Vnode("[", undefined, undefined, normalizeChildren(node), undefined, null)
		}
		if (node != null && typeof node !== "object") {
			return Vnode("#", undefined, undefined, node === false ? "" : node, undefined, null)
		}
		return node
	}

	export function normalizeChildren (children: Vnode[]): Vnode[] {
		for (let i = 0; i < children.length; i++) {
			children[i] = normalize(children[i])
		}
		return children
	}
}

export = Vnode
