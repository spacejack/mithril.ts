declare function require(path: string): any
declare const global: any
const PromisePolyfill = require("./polyfill")

let exp: typeof Promise

if (typeof window !== "undefined") {
	if (typeof (window as any).Promise === "undefined") {
		(window as any).Promise = PromisePolyfill
	} else if (!(window as any).Promise.prototype.finally) {
		(window as any).Promise.prototype.finally = PromisePolyfill.prototype.finally
	}
	exp = (window as any).Promise
} else if (typeof global !== "undefined") {
	if (typeof global.Promise === "undefined") {
		global.Promise = PromisePolyfill
	} else if (!global.Promise.prototype.finally) {
		global.Promise.prototype.finally = PromisePolyfill.prototype.finally
	}
	exp = global.Promise
} else {
	exp = PromisePolyfill
}

export = exp
