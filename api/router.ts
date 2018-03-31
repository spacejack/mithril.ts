import Vnode = require("../render/vnode")
import Promise = require("../promise/promise")
import coreRouter = require("../router/router")
import RedrawService = require("./redrawservice")
import Route = require("./route")

export = function Router ($window: Window, redrawService: RedrawService) {
	const routeService = coreRouter($window)
	const identity = function(v: any) {return v}
	let render: (vnode: Vnode) => Vnode
	let component: any
	let attrs: Record<string, any>
	let currentPath: string
	let lastUpdate: Function | null

	const route: Route = function(root: Element, defaultRoute: string, routes: any) {
		if (root == null) {
			throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined")
		}
		function run() {
			if (render != null) {
				redrawService.render(root, render(Vnode(component, attrs.key, attrs, undefined, undefined, null)))
			}
		}
		let redraw = function() {
			run()
			redraw = redrawService.redraw
		}
		redrawService.subscribe(root, run)
		const bail = function(path: string) {
			if (path !== defaultRoute) {
				routeService.setPath(defaultRoute, null, {replace: true})
			} else {
				throw new Error("Could not resolve default route " + defaultRoute)
			}
		}
		routeService.defineRoutes(routes, function(payload, params, path) {
			const update = lastUpdate = function(routeResolver: any, comp: any) {
				if (update !== lastUpdate) {
					return
				}
				component = comp != null && (typeof comp.view === "function" || typeof comp === "function") ? comp : "div"
				attrs = params
				currentPath = path
				lastUpdate = null
				render = (routeResolver.render || identity).bind(routeResolver)
				redraw()
			}
			if (payload.view || typeof payload === "function") {
				update({}, payload)
			} else {
				if (payload.onmatch) {
					Promise.resolve(payload.onmatch(params, path)).then(function(resolved: any) {
						update(payload, resolved)
					}, bail)
				} else {
					update(payload, "div")
				}
			}
		}, bail)
	} as any

	;(route as any).set = function(path: string, data: any, options: any): void {
		if (lastUpdate != null) {
			options = options || {}
			options.replace = true
		}
		lastUpdate = null
		routeService.setPath(path, data, options)
	}

	;(route as any).get = function() {
		return currentPath
	}

	route.prefix = function(prefix: string) {
		routeService.prefix = prefix
	}

	const link = function(options: Record<string, any>, vnode: Vnode) {
		(vnode.dom as Element).setAttribute("href", routeService.prefix + vnode.attrs!.href)
		;(vnode.dom as HTMLElement).onclick = function(this: Element, e: MouseEvent & {redraw?: false}) {
			if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) {
				return
			}
			e.preventDefault()
			e.redraw = false
			let href = this.getAttribute("href")!
			if (href.indexOf(routeService.prefix) === 0) {
				href = href.slice(routeService.prefix.length)
			}
			route.set(href, undefined, options)
		}
	}

	route.link = function(args: any) {
		if (args.tag == null) {
			return link.bind(link, args)
		}
		return link({}, args)
	}

	route.param = function(key: string) {
		if(typeof attrs !== "undefined" && typeof key !== "undefined") {
			return attrs[key]
		}
		return attrs
	}

	return route
}
