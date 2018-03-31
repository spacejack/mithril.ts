"use strict";
module.exports = function parseQueryString(str) {
    if (str === "" || str == null) {
        return {};
    }
    if (str.charAt(0) === "?") {
        str = str.slice(1);
    }
    var entries = str.split("&");
    var data = {};
    var counters = {};
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i].split("=");
        var key = decodeURIComponent(entry[0]);
        var value = entry.length === 2 ? decodeURIComponent(entry[1]) : "";
        if (value === "true") {
            value = true;
        }
        else if (value === "false") {
            value = false;
        }
        var levels = key.split(/\]\[?|\[/);
        var cursor = data;
        if (key.indexOf("[") > -1) {
            levels.pop();
        }
        for (var j = 0; j < levels.length; j++) {
            var level = levels[j];
            var nextLevel = levels[j + 1];
            var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10));
            var isValue = j === levels.length - 1;
            if (level === "") {
                var key_1 = levels.slice(0, j).join();
                if (counters[key_1] == null) {
                    counters[key_1] = 0;
                }
                level = counters[key_1]++;
            }
            if (cursor[level] == null) {
                cursor[level] = isValue ? value : isNumber ? [] : {};
            }
            cursor = cursor[level];
        }
    }
    return data;
};
