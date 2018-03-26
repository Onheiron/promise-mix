"use strict";

require("./promise-mix-concat");

/**
 * This section contains more Promise extensions with methods to handle several Promises simultaneously.
 */

const PromiseMux = function (inputs) {

    this.init = function (inits) {
        if (Array.isArray(inits)) {
            this.pool = inits.map((init) => {
                return Promise.resolve(init);
            });
        } else if (inits instanceof Object) {
            this.pool = {};
            for (let i in inits) {
                const init = inits[i];
                this.pool[i] = Promise.resolve(init);
            }
        } else {
            throw TypeError(`PromiseMux input must be an object or an array. Current input type is ${typeof inits}`);
        }
    };

    if (inputs) this.init(inputs);

    this.then = function (func) {
        for (let p in this.pool) {
            const promise = this.pool[p];
            this.pool[p] = promise.then(func);
        }
        return this;
    };

    this.deMux = function (func) {
        if (Array.isArray(inputs)) {
            return Promise.all(this.pool).then(func);
        } else {
            return Promise.aggregate(this.pool).then(func);
        }
    };
};

Promise.mux = (inputs) => {
    return new PromiseMux(inputs);
};

PromiseMux.aggregate = (promisesMap, inputs) => {
    const promiseMux = new PromiseMux(inputs);
    for (let p in promiseMux.pool) {
        const promise = promiseMux.pool[p];
        promiseMux.pool[p] = promise._aggregate(promisesMap);
    }
    return promiseMux;
};

PromiseMux.combine = (promiseFuncMap, inputs) => {
    const promiseMux = new PromiseMux(inputs);
    for (let p in promiseMux.pool) {
        const promise = promiseMux.pool[p];
        promiseMux.pool[p] = promise._combine(promiseFuncMap);
    }
    return promiseMux;
};

PromiseMux.fCombine = (funcMap, inputs) => {
    const promiseMux = new PromiseMux(inputs);
    for (let p in promiseMux.pool) {
        const promise = promiseMux.pool[p];
        promiseMux.pool[p] = promise._fCombine(funcMap);
    }
    return promiseMux;
};

PromiseMux.merge = (promisesToMerge, inputs) => {
    const promiseMux = new PromiseMux(inputs);
    for (let p in promiseMux.pool) {
        const promise = promiseMux.pool[p];
        promiseMux.pool[p] = promise._merge(promisesToMerge);
    }
    return promiseMux;
};

PromiseMux.reduce = (promiseFuncArray, inputs) => {
    const promiseMux = new PromiseMux(inputs);
    for (let p in promiseMux.pool) {
        const promise = promiseMux.pool[p];
        promiseMux.pool[p] = promise._reduce(promiseFuncArray);
    }
    return promiseMux;
};

PromiseMux.fReduce = (funcArray, inputs) => {
    const promiseMux = new PromiseMux(inputs);
    for (let p in promiseMux.pool) {
        const promise = promiseMux.pool[p];
        promiseMux.pool[p] = promise._fReduce(funcArray);
    }
    return promiseMux;
};

Promise.prototype._mux = function (func) {
    return this.then((results) => {
        return func(new PromiseMux(results));
    });
};

PromiseMux.prototype._aggregate = function (promisesMap) {
    return this.then((prev) => {
        return Promise.aggregate(promisesMap, prev);
    });
};

PromiseMux.prototype._combine = function (promiseFuncMap) {
    return this.then((prev) => {
        return Promise.combine(promiseFuncMap, prev);
    });
};

PromiseMux.prototype._fCombine = function (funcMap) {
    return this.then((prev) => {
        return Promise.fCombine(funcMap, prev);
    });
};

PromiseMux.prototype._merge = function (promisesToMerge) {
    return this.then((prev) => {
        return Promise.merge(promisesToMerge, prev);
    });
};

PromiseMux.prototype._reduce = function (promiseFuncArray) {
    return this.then((prev) => {
        return Promise.reduce(promiseFuncArray, prev);
    });
};

PromiseMux.prototype._fReduce = function (funcArray) {
    return this.then((prev) => {
        return Promise.fReduce(funcArray, prev);
    });
};

module.exports = PromiseMux;