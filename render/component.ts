interface Component {
	oninit?(vnode: any): void
	oncreate?(vnode: any): void
	onbeforeupdate?(vnode: any, old: any): void | false
	onupdate?(vnode: any): void
	onbeforeremove?(vnode: any): Promise<any>
	onremove?(vnode: any): void
	view(vnode: any): any
}

export = Component
