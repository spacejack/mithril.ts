import redrawService = require("./redraw")
import Route = require("./api/route")
import createRouter = require("./api/router")
export = createRouter(window, redrawService)
