import Component = require("../render/component")
import Vnode = require("../render/vnode")
import RedrawService = require('./redrawservice')

export = function mount (redrawService: RedrawService) {
	return function(root: Element, component: Component) {
		if (component === null) {
			redrawService.render(root, [])
			redrawService.unsubscribe(root)
			return
		}

		if (component.view == null && typeof component !== "function") {
			throw new Error("m.mount(element, component) expects a component, not a vnode")
		}

		const run = function() {
			redrawService.render(root, Vnode(component, undefined, undefined, undefined, undefined, null))
		}
		redrawService.subscribe(root, run)
		run()
	}
}
