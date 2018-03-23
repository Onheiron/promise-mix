require('./promise-mix');

/**
 * This section contains more Promise extensions with methods derived by composing basic promise-mix methods.
 */

Promise.prototype._aggregate = function (promisesMap) {
    return this.then((prev) => {
        return Promise.aggregate(promisesMap, prev)
    });
};

Promise.prototype._combine = function (promiseFuncMap) {
    return this.then((prev) => {
        return Promise.combine(promiseFuncMap, prev)
    });
};

Promise.prototype._fCombine = function (funcMap) {
    return this.then((prev) => {
        return Promise.fCombine(funcMap, prev)
    });
};

Promise.prototype._merge = function (promisesToMerge) {
    return this.then((prev) => {
        return Promise.merge(promisesToMerge, prev)
    });
};

Promise.prototype._reduce = function (promiseFuncArray) {
    return this.then((prev) => {
        return Promise.reduce(promiseFuncArray, prev)
    });
};

Promise.prototype._fReduce = function (funcArray) {
    return this.then((prev) => {
        return Promise.fReduce(funcArray, prev)
    });
};