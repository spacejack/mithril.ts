export = function (attrName: string, callback: (value: any) => void, context: any) {
	return function (this: any, e: any) {
		callback.call(context || this, attrName in e.currentTarget ? e.currentTarget[attrName] : e.currentTarget.getAttribute(attrName))
	}
}
