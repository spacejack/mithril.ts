"use strict";
module.exports = function buildQueryString(object) {
    if (Object.prototype.toString.call(object) !== "[object Object]") {
        return "";
    }
    var args = [];
    for (var key in object) {
        destructure(key, object[key]);
    }
    return args.join("&");
    function destructure(key, value) {
        if (Array.isArray(value)) {
            for (var i_1 = 0; i_1 < value.length; i_1++) {
                destructure(key + "[" + i_1 + "]", value[i_1]);
            }
        }
        else if (Object.prototype.toString.call(value) === "[object Object]") {
            for (var i in value) {
                destructure(key + "[" + i + "]", value[i]);
            }
        }
        else {
            args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""));
        }
    }
};
