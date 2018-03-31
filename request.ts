import PromisePolyfill = require("./promise/promise")
import createRequest = require("./request/request")
export = createRequest(window, PromisePolyfill)
