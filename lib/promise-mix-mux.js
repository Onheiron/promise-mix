"use strict";

require("./promise-mix-logical");
const baseFunctions = require('./config').base_functions;
const logicalFunctions = require('./config').logical_functions;

const initPool = (inputs) => {
    let pool;
    if (Array.isArray(inputs)) pool = [];
    else if (inputs instanceof Object) pool = {};
    else throw TypeError(`PromiseMux input must be an object or an array. Current input type is ${typeof inputs}`);
    for (let i in inputs) {
        pool[i] = Promise.resolve(inputs[i]);
    }
    return pool;
}

/**
 * This section contains more Promise extensions with methods to handle several Promises simultaneously.
 */
class PromiseMux {

    constructor(inputs) {
        this.pool = initPool(inputs);
    }

    then(func) {
        for (let p in this.pool) {
            this.pool[p] = this.pool[p].then(func.bind({ key: p }));
        }
        return this;
    };

    deMux(func) {
        let output;
        if (Array.isArray(this.pool)) output = Promise.all(this.pool);
        else output = Promise.aggregate(this.pool);

        if (func) output = output.then(func);
        return output;
    };
};

/**
 * Access point to generate a PromiseMux out of a given input.
 * @param {*} inputs the inputs to feed to the PromiseMux.
 */
Promise.mux = inputs => new PromiseMux(inputs);

/**
 * This simply adds base mix functions to PromiseMux..
 */
for (let f in baseFunctions) {
    const functionName = baseFunctions[f];
    PromiseMux[functionName] = (config, inputs) => {
        const promiseMux = new PromiseMux(inputs);
        for (let p in promiseMux.pool) {
            promiseMux.pool[p] = promiseMux.pool[p][`_${functionName}`](config);
        }
        return promiseMux;
    };
}

/**
 * ... and for logical operations
 */

for (let f in logicalFunctions) {
    const functionName = logicalFunctions[f];
    PromiseMux.prototype[`_${functionName}`] = function (promiseFuncArray, check) {
        return this.then(prev => Promise.resolve(prev)[`_${functionName}`](promiseFuncArray, check));
    };
}

/**
 * Takes the downstream of a Promise and uses it as an input for a PromiseMux.
 * 
 * @param {Function} func the function to execute on each muxed item.
 */
Promise.prototype._mux = function (func) {
    return this.then(results => func(new PromiseMux(results)));
};

/**
 * Sets to undefined all the downstreams which don't pass a given filter function.
 * 
 * @param {Function} filterFunction a function which returns true only for those downstreams which should be kept.
 * @returns {PromiseMux} the original PromiseMux.
 */
PromiseMux.prototype._filter = function (filterFunction) {
    for (let p in this.pool) {
        this.pool[p] = this.pool[p].then(item => {
            if (filterFunction(item)) return item;
            else return;
        });
    }
    return this;
};

/**
 * Shuffles the downstreams switching their positions / labels in the original muxed input.
 * 
 * @returns {PromiseMux} the original PromiseMux with shuffled pool.
 */
PromiseMux.prototype._shuffle = function () {
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

module.exports = PromiseMux;