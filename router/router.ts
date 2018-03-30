import buildQueryString = require("../querystring/build")
import parseQueryString = require("../querystring/parse")

interface Router {
	prefix: string
	getPath(): string
	setPath(path: string, data?: Record<string, any>, options?: Record<string, any>): void
	defineRoutes(routes: Record<string, any>, resolve: (...args: any[]) => void, reject: (...args: any[]) => void): void
}

function Router ($window: Window) {
	const supportsPushState = typeof $window.history.pushState === "function"
	const callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout

	//$window.location.

	function normalize (fragment: string): string {
		let data: string = ($window.location as any)[fragment].replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent)
		if (fragment === "pathname" && data[0] !== "/") {
			data = "/" + data
		}
		return data
	}

	let asyncId: number | null | undefined
	function debounceAsync (callback: () => void) {
		return function() {
			if (asyncId != null) {
				return
			}
			asyncId = callAsync(function() {
				asyncId = null
				callback()
			})
		}
	}

	function parsePath (path: string, queryData: Record<string, any>, hashData: Record<string, string>): string {
		const queryIndex = path.indexOf("?")
		const hashIndex = path.indexOf("#")
		const pathEnd = queryIndex > -1 ? queryIndex : hashIndex > -1 ? hashIndex : path.length
		if (queryIndex > -1) {
			const queryEnd = hashIndex > -1 ? hashIndex : path.length
			const queryParams = parseQueryString(path.slice(queryIndex + 1, queryEnd))
			for (const key in queryParams) {
				queryData[key] = queryParams[key]
			}
		}
		if (hashIndex > -1) {
			const hashParams = parseQueryString(path.slice(hashIndex + 1))
			for (const key in hashParams) {
				hashData[key] = hashParams[key]
			}
		}
		return path.slice(0, pathEnd)
	}

	const router: Router = {prefix: "#!"} as Router

	router.getPath = function() {
		const type = router.prefix.charAt(0)
		switch (type) {
			case "#": return normalize("hash").slice(router.prefix.length)
			case "?": return normalize("search").slice(router.prefix.length) + normalize("hash")
			default: return normalize("pathname").slice(router.prefix.length) + normalize("search") + normalize("hash")
		}
	}

	router.setPath = function(path, data, options) {
		const queryData: Record<string, string> = {}
		const hashData: Record<string, string> = {}
		path = parsePath(path, queryData, hashData)
		if (data != null) {
			for (var key in data) {
				queryData[key] = data[key]
			}
			path = path.replace(/:([^\/]+)/g, function(match, token) {
				delete queryData[token]
				return data[token]
			})
		}

		const query = buildQueryString(queryData)
		if (query) {
			path += "?" + query
		}

		const hash = buildQueryString(hashData)
		if (hash) {
			path += "#" + hash
		}

		if (supportsPushState) {
			const state = options ? options.state : null
			const title = options ? options.title : null
			;($window.onpopstate as any)()
			if (options && options.replace) {
				$window.history.replaceState(state, title, router.prefix + path)
			} else {
				$window.history.pushState(state, title, router.prefix + path)
			}
		} else {
			$window.location.href = router.prefix + path
		}
	}

	router.defineRoutes = function(routes, resolve, reject) {
		function resolveRoute() {
			const path = router.getPath()
			const params: Record<string, string> = {}
			const pathname = parsePath(path, params, params)

			const state = $window.history.state
			if (state != null) {
				for (var k in state) {
					params[k] = state[k]
				}
			}
			for (var route in routes) {
				const matcher = new RegExp("^" + route.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$")

				if (matcher.test(pathname)) {
					pathname.replace(matcher, function() {
						const keys = route.match(/:[^\/]+/g) || []
						const values = [].slice.call(arguments, 1, -2)
						for (var i = 0; i < keys.length; i++) {
							params[keys[i].replace(/:|\./g, "")] = decodeURIComponent(values[i])
						}
						resolve(routes[route], params, path, route)
						// Typescript requires us to return a string
						return ''
					})
					return
				}
			}

			reject(path, params)
		}

		if (supportsPushState) {
			$window.onpopstate = debounceAsync(resolveRoute)
		} else if (router.prefix.charAt(0) === "#") {
			$window.onhashchange = resolveRoute
		}
		resolveRoute()
	}

	return router
}

export = Router
