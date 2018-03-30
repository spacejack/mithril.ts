export = function buildQueryString (object: Record<string, any>): string {
	if (Object.prototype.toString.call(object) !== "[object Object]") {
		return ""
	}
	const args: string[] = []
	for (var key in object) {
		destructure(key, object[key])
	}

	return args.join("&")

	function destructure (key: string, value: any) {
		if (Array.isArray(value)) {
			for (let i = 0; i < value.length; i++) {
				destructure(key + "[" + i + "]", value[i])
			}
		} else if (Object.prototype.toString.call(value) === "[object Object]") {
			for (var i in value) {
				destructure(key + "[" + i + "]", value[i])
			}
		} else {
			args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""))
		}
	}
}
