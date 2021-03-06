"use strict";

module.exports = {
    operation: require("./lib/operation"),
    basic: require("./lib/promise-mix"),
    concat: require("./lib/promise-mix-concat"),
    promiseMux: require("./lib/promise-mix-mux"),
    logical: require("./lib/promise-mix-logical"),
    utils: require("./lib/promise-mix-utils")
};