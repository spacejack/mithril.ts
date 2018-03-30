import buildQueryString = require("../querystring/build")

const FILE_PROTOCOL_REGEX = new RegExp("^file://", "i")

export = function request ($window: Window, Promise: {new(resolve: (...args: any[]) => void, reject?: (...args: any[]) => void): Promise<any>}) {
	let callbackCount = 0

	let oncompletion: () => void
	function setCompletionCallback(callback: () => void) {
		oncompletion = callback
	}

	function finalizer() {
		let count = 0
		function complete() {
			if (--count === 0 && typeof oncompletion === "function") {
				oncompletion()
			}
		}

		return function finalize(promise: Promise<any>) {
			const then = promise.then
			promise.then = function() {
				count++
				const next = then.apply(promise, arguments)
				next.then(complete, (e: any) => {
					complete()
					if (count === 0) {
						throw e
					}
				})
				return finalize(next)
			}
			return promise
		}
	}

	function normalize(args: any, extra: Record<string, any>) {
		if (typeof args === "string") {
			const url = args
			args = extra || {}
			if (args.url == null) {
				args.url = url
			}
		}
		return args
	}

	function request (args: any, extra: Record<string, any>) {
		const finalize = finalizer()
		args = normalize(args, extra)

		const promise = new Promise(function(resolve, reject) {
			if (args.method == null) {
				args.method = "GET"
			}
			args.method = args.method.toUpperCase()

			const useBody = (args.method === "GET" || args.method === "TRACE") ? false : (typeof args.useBody === "boolean" ? args.useBody : true)

			if (typeof args.serialize !== "function") {
				args.serialize = typeof FormData !== "undefined" && args.data instanceof FormData
					? (value: any) => value
					: JSON.stringify
			}
			if (typeof args.deserialize !== "function") {
				args.deserialize = deserialize
			}
			if (typeof args.extract !== "function") {
				args.extract = extract
			}

			args.url = interpolate(args.url, args.data)
			if (useBody) {
				args.data = args.serialize(args.data)
			} else {
				args.url = assemble(args.url, args.data)
			}

			let xhr: XMLHttpRequest = new ($window as any).XMLHttpRequest()
			let aborted = false
			const _abort = xhr.abort

			xhr.abort = function abort() {
				aborted = true
				_abort.call(xhr)
			}

			xhr.open(
				args.method, args.url,
				typeof args.async === "boolean" ? args.async : true,
				typeof args.user === "string" ? args.user : undefined,
				typeof args.password === "string" ? args.password : undefined
			)

			if (args.serialize === JSON.stringify && useBody && !(args.headers && args.headers.hasOwnProperty("Content-Type"))) {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8")
			}
			if (args.deserialize === deserialize && !(args.headers && args.headers.hasOwnProperty("Accept"))) {
				xhr.setRequestHeader("Accept", "application/json, text/*")
			}
			if (args.withCredentials) {
				xhr.withCredentials = args.withCredentials
			}

			if (args.timeout) {
				xhr.timeout = args.timeout
			}

			for (const key in args.headers) {
				if ({}.hasOwnProperty.call(args.headers, key)) {
					xhr.setRequestHeader(key, args.headers[key])
				}
			}

			if (typeof args.config === "function") {
				xhr = args.config(xhr, args) || xhr
			}

			xhr.onreadystatechange = function() {
				// Don't throw errors on xhr.abort().
				if (aborted) {
					return
				}

				if (xhr.readyState === 4) {
					try {
						const response = (args.extract !== extract) ? args.extract(xhr, args) : args.deserialize(args.extract(xhr, args))
						if (args.extract !== extract || (xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || FILE_PROTOCOL_REGEX.test(args.url)) {
							resolve(cast(args.type, response))
						} else {
							const error: Error & {code: number; response: string} = new Error(xhr.responseText) as any
							error.code = xhr.status
							error.response = response
							reject(error)
						}
					} catch (e) {
						reject(e)
					}
				}
			}

			if (useBody && (args.data != null)) {
				xhr.send(args.data)
			} else {
				xhr.send()
			}
		})
		return args.background === true ? promise : finalize(promise)
	}

	function jsonp (args: any, extra: any) {
		const finalize = finalizer()
		args = normalize(args, extra)

		const promise = new Promise((resolve, reject) => {
			const callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++
			const script = $window.document.createElement("script")
			;($window as any)[callbackName] = (data: any) => {
				script.parentNode!.removeChild(script)
				resolve(cast(args.type, data))
				delete ($window as any)[callbackName]
			}
			script.onerror = () => {
				script.parentNode!.removeChild(script)
				reject(new Error("JSONP request failed"))
				delete ($window as any)[callbackName]
			}
			if (args.data == null) {
				args.data = {}
			}
			args.url = interpolate(args.url, args.data)
			args.data[args.callbackKey || "callback"] = callbackName
			script.src = assemble(args.url, args.data)
			$window.document.documentElement.appendChild(script)
		})
		return args.background === true? promise : finalize(promise)
	}

	function interpolate (url: string, data?: Record<string, any>) {
		if (data == null) {
			return url
		}

		const tokens = url.match(/:[^\/]+/gi) || []
		for (let i = 0; i < tokens.length; i++) {
			const key = tokens[i].slice(1)
			if (data[key] != null) {
				url = url.replace(tokens[i], data[key])
			}
		}
		return url
	}

	function assemble (url: string, data: Record<string, any>) {
		const querystring = buildQueryString(data)
		if (querystring !== "") {
			const prefix = url.indexOf("?") < 0 ? "?" : "&"
			url += prefix + querystring
		}
		return url
	}

	function deserialize (data: any) {
		try {
			return data !== "" ? JSON.parse(data) : null
		} catch (e) {
			throw new Error(data)
		}
	}

	function extract (xhr: XMLHttpRequest) {
		return xhr.responseText
	}

	function cast (type: any, data: any) {
		if (typeof type === "function") {
			if (Array.isArray(data)) {
				for (var i = 0; i < data.length; i++) {
					data[i] = new type(data[i])
				}
			} else {
				return new type(data)
			}
		}
		return data
	}

	return {request, jsonp, setCompletionCallback}
}
