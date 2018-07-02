"use strict";

require("./promise-mix");
require("./promise-mix-logical");
const PromiseMux = require("./promise-mix-mux");

const baseFunctions = require('./config').base_functions;
const logicalFunctions = require('./config').logical_functions;

/**
 * This simply adds concat version of base mix functions which can be chained after a promise and
 * use the downstream as init value.
 */
for(let f in baseFunctions) {
    const functionName = baseFunctions[f];
    Promise.prototype[`_${functionName}`] = function (config) {
        return this.then((prev) => {
            return Promise[functionName](config, prev);
        });
    };
    PromiseMux.prototype[`_${functionName}`] = function (config) {
        return this.then((prev) => {
            return Promise[functionName](config, prev);
        });
    };
}

/**
 * This simply adds concat version of logical mix functions which can be chained after a promise and
 * use the downstream as init value.
 */
for(let f in logicalFunctions) {
    const functionName = logicalFunctions[f];
    Promise.prototype[`_${functionName}`] = function (promisesFunctionsArray, check) {
        return Promise[functionName]([() => this].concat(promisesFunctionsArray), check);
    };
}

/**
 * Executes a given function returning a promise inserting the result in the current
 * promise chain, but discards any results from that Promise, keeping the original
 * downstream.
 * This is useful to execute async side-operations which should not influence the downstream.
 * You can also disregard any errors in the aside promise by setting ignoreErros to true.
 * 
 * @param {Function} asidePromiseFunction a function returning the Promise to execute aside from the downstream.
 * @param {Boolean} ignoreErrors a flag telling the function to also ignore rejects of the aside function.
 * 
 * Examples:
 * 
 * Promise.resolve('Jake')
 *  ._aside((dwn) => Promise.resolve('Wolly'))
 *  .then((dwn) => {
 *      // Here dwn should equal 'Jake'
 *  });
 * 
 * Promise.resolve('Jake')
 *  ._aside((dwn) => Promise.reject('Wolly'), true)
 *  .then((dwn) => {
 *      // Here dwn should equal 'Jake' and the main Promise should still be going.
 *  });
 */
Promise.prototype._aside = function (asidePromiseFunction, ignoreErrors = false) {
    return this.then((result) => {
        let res = asidePromiseFunction(result);
        if(!(res instanceof Promise)) res = Promise.resolve(eval);
        return res.then((/*don't care!*/) => {
            return result;
        }).catch((error) => {
            if (ignoreErrors) {
                return Promise.resolve(result);
            } else {
                throw error;
            }
        });
    });
};