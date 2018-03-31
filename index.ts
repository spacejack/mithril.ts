import Component = require("./render/component")
import Route = require("./api/route")
import m = require("./hyperscript")
import requestService = require("./request")
import redrawService = require("./redraw")

requestService.setCompletionCallback(redrawService.redraw)

import mount = require("./mount")
import route = require("./route")
import withAttr = require("./util/withAttr")
import renderService = require("./render")
const render = renderService.render
const redraw = redrawService.redraw
const request = requestService.request
const jsonp = requestService.jsonp
import parseQueryString = require("./querystring/parse")
import buildQueryString = require("./querystring/build")
const version = "bleeding-edge"
import vnode = require("./render/vnode")
declare function require(path: string): any
const PromisePolyfill: typeof Promise = require("./promise/polyfill")

const exp = Object.assign(m, {
	mount, route, withAttr, render, redraw, request, jsonp,
	parseQueryString, buildQueryString,
	version, vnode, PromisePolyfill
})

export = exp
