export = function parseQueryString (str: string): Record<string, any> {
	if (str === "" || str == null) {
		return {}
	}
	if (str.charAt(0) === "?") {
		str = str.slice(1)
	}

	const entries = str.split("&")
	const data: Record<string, any> = {}
	const counters: Record<string, any> = {}
	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i].split("=")
		const key = decodeURIComponent(entry[0])
		let value: string | boolean = entry.length === 2 ? decodeURIComponent(entry[1]) : ""

		if (value === "true") {
			value = true
		} else if (value === "false") {
			value = false
		}

		const levels = key.split(/\]\[?|\[/)
		let cursor = data
		if (key.indexOf("[") > -1) {
			levels.pop()
		}
		for (let j = 0; j < levels.length; j++) {
			let level: string | number = levels[j]
			const nextLevel = levels[j + 1]
			const isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10))
			const isValue = j === levels.length - 1
			if (level === "") {
				const key = levels.slice(0, j).join()
				if (counters[key] == null) {
					counters[key] = 0
				}
				level = counters[key]++
			}
			if (cursor[level] == null) {
				cursor[level] = isValue ? value : isNumber ? [] : {}
			}
			cursor = cursor[level]
		}
	}
	return data
}
