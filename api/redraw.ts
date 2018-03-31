import Vnode = require("../render/vnode")
import coreRenderer = require("../render/render")
import RedrawService = require("./redrawservice")

function throttle (callback: () => void) {
	//60fps translates to 16.6ms, round it down since setTimeout requires int
	const delay = 16
	let last = 0
	let pending: number | null = null
	const timeout: (cb: () => void, t: number) => number = typeof requestAnimationFrame === "function" ? requestAnimationFrame : setTimeout
	return function() {
		const elapsed = Date.now() - last
		if (pending === null) {
			pending = timeout(function() {
				pending = null
				callback()
				last = Date.now()
			}, delay - elapsed)
		}
	}
}

export = function redraw ($window: Window, throttleMock?: (callback: () => void) => void): RedrawService {
	const renderService = coreRenderer($window)
	renderService.setEventCallback(function(e) {
		if (e.redraw === false) {
			e.redraw = undefined
		} else {
			redraw()
		}
	})

	const callbacks: (Element | (() => void))[] = []
	let rendering = false

	function subscribe (key: Element, callback: () => void) {
		unsubscribe(key)
		callbacks.push(key, callback)
	}

	function unsubscribe (key: Element) {
		const index = callbacks.indexOf(key)
		if (index > -1) {
			callbacks.splice(index, 2)
		}
	}

	function sync() {
		if (rendering) {
			throw new Error("Nested m.redraw.sync() call")
		}
		rendering = true
		for (let i = 1; i < callbacks.length; i += 2) {
			try {
				(callbacks[i] as () => void)()
			} catch (e) {
				if (typeof console !== "undefined") {
					console.error(e)
				}
			}
		}
		rendering = false
	}

	const redraw: any = (throttleMock || throttle)(sync)
	redraw.sync = sync
	return {subscribe, unsubscribe, redraw, render: renderService.render}
}
