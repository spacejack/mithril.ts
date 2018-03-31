interface Route {
	set(path: string, data: any, options: any): void
	get(): string
	prefix(prefix: string): void
	link(args: any): void
	param(key: string): Record<string, any>
}

export = Route
