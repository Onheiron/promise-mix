"use strict";

require("./promise-mix");

/**
 * This section contains more Promise extensions with methods to concatenate promises using the base extensions.
 * 
 * Downstreams will be passed as init value for the chained method.
 */

Promise.prototype._aggregate = function (promisesMap) {
    return this.then((prev) => {
        return Promise.aggregate(promisesMap, prev);
    });
};

Promise.prototype._combine = function (promiseFuncMap) {
    return this.then((prev) => {
        return Promise.combine(promiseFuncMap, prev);
    });
};

Promise.prototype._fCombine = function (funcMap) {
    return this.then((prev) => {
        return Promise.fCombine(funcMap, prev);
    });
};

Promise.prototype._merge = function (promisesToMerge) {
    return this.then((prev) => {
        return Promise.merge(promisesToMerge, prev);
    });
};

Promise.prototype._reduce = function (promiseFuncArray) {
    return this.then((prev) => {
        return Promise.reduce(promiseFuncArray, prev);
    });
};

Promise.prototype._fReduce = function (funcArray) {
    return this.then((prev) => {
        return Promise.fReduce(funcArray, prev);
    });
};

/**
 * Executes a given function returning a promise inserting the result in the current
 * promise chain, but discards any results from that Promise, keeping the original
 * downstream.
 * This is useful to execute async side-operations which should not influence the downstream.
 * You can also disregard any errors in the aside promise by setting ignoreErros to true.
 */
Promise.prototype._aside = function (asidePromiseFunction, ignoreErrors = false) {
    return this.then((result) => {
        return asidePromiseFunction(result).then((/*don't care!*/) => {
            return result;
        }).catch((error) => {
            if(ignoreErrors) {
                return Promise.resolve(result);
            } else {
                throw error;
            }
        });
    });
};