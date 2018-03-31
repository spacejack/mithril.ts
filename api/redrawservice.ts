import Vnode = require("../render/vnode")

interface RedrawService {
	redraw(): void
	render(root: Element, vnodes: Vnode | Vnode[]): void
	subscribe(root: Element, run: () => void): void
	unsubscribe(root: Element): void
}

export = RedrawService
