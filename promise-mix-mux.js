"use strict";

require("./promise-mix-concat");
require("./promise-mix-logical");

/**
 * This section contains more Promise extensions with methods to handle several Promises simultaneously.
 */

const PromiseMux = function (inputs) {

    this.init = function (inputs) {
        if (Array.isArray(inputs)) {
            this.pool = [];
        } else if (inputs instanceof Object) {
            this.pool = {};
        } else {
            throw TypeError(`PromiseMux input must be an object or an array. Current input type is ${typeof inits}`);
        }
        for (let i in inputs) {
            this.pool[i] = Promise.resolve(inputs[i]);
        }
    };

    if (inputs) this.init(inputs);

    this.then = function (func) {
        for (let p in this.pool) {
            this.pool[p] = this.pool[p].then(func);
        }
        return this;
    };

    this.deMux = function (func) {
        let output;
        if (Array.isArray(inputs)) {
            output = Promise.all(this.pool);
        } else {
            output = Promise.aggregate(this.pool);
        }
        if (func) {
            output = output.then(func);
        }
        return output;
    };

    this._filter = function (filterFunction) {
        for (let p in this.pool) {
            this.pool[p] = this.pool[p].then((item) => {
                if (filterFunction(item)) return item;
                else return;
            });
        }
        return this;
    };

    this._shuffle = function () {
        const shuffledPool = [];
        const iterable = this.pool instanceof Array ? this.pool : Object.keys(this.pool);
        while (iterable.length > 0) {
            const rIndex = Math.floor(Math.random() * iterable.length);
            shuffledPool.push(iterable.splice(rIndex, 1)[0]);
        }
        if (this.pool instanceof Array) {
            this.pool = shuffledPool;
        } else {
            const newPool = {};
            for (let i in Object.keys(this.pool)) {
                newPool[Object.keys(this.pool)[i]] = this.pool[shuffledPool[i]];
            }
            this.pool = newPool;
        }
        return this;
    };
};

Promise.mux = (inputs) => {
    return new PromiseMux(inputs);
};

PromiseMux.aggregate = (promisesMap, inputs) => {
    const promiseMux = new PromiseMux(inputs);
    for (let p in promiseMux.pool) {
        promiseMux.pool[p] = promiseMux.pool[p]._aggregate(promisesMap);
    }
    return promiseMux;
};

PromiseMux.combine = (promiseFuncMap, inputs) => {
    const promiseMux = new PromiseMux(inputs);
    for (let p in promiseMux.pool) {
        promiseMux.pool[p] = promiseMux.pool[p]._combine(promiseFuncMap);
    }
    return promiseMux;
};

PromiseMux.fCombine = (funcMap, inputs) => {
    const promiseMux = new PromiseMux(inputs);
    for (let p in promiseMux.pool) {
        promiseMux.pool[p] = promiseMux.pool[p]._fCombine(funcMap);
    }
    return promiseMux;
};

PromiseMux.merge = (promisesToMerge, inputs) => {
    const promiseMux = new PromiseMux(inputs);
    for (let p in promiseMux.pool) {
        promiseMux.pool[p] = promiseMux.pool[p]._merge(promisesToMerge);
    }
    return promiseMux;
};

PromiseMux.reduce = (promiseFuncArray, inputs) => {
    const promiseMux = new PromiseMux(inputs);
    for (let p in promiseMux.pool) {
        promiseMux.pool[p] = promiseMux.pool[p]._reduce(promiseFuncArray);
    }
    return promiseMux;
};

PromiseMux.fReduce = (funcArray, inputs) => {
    const promiseMux = new PromiseMux(inputs);
    for (let p in promiseMux.pool) {
        promiseMux.pool[p] = promiseMux.pool[p]._fReduce(funcArray);
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

PromiseMux.prototype._or = function (promiseFuncArray, check) {
    return this.then((prev) => {
        return Promise.resolve(prev)._or(promiseFuncArray, check);
    });
};

PromiseMux.prototype._and = function (promiseFuncArray, check) {
    return this.then((prev) => {
        return Promise.resolve(prev)._and(promiseFuncArray, check);
    });
};

PromiseMux.prototype._xor = function (promiseFuncArray, check) {
    return this.then((prev) => {
        return Promise.resolve(prev)._xor(promiseFuncArray, check);
    });
};

module.exports = PromiseMux;