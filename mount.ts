import Component = require("./render/component")
import redrawService = require("./redraw")
import createMount = require("./api/mount")
export = createMount(redrawService)
