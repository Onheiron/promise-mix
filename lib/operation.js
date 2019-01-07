'use-strict';
const util = require("util");

const handleFunction = (fnc, data, promisify) => {
    if (promisify) {
        return util.promisify(fnc)(data);
    } else {
        return handleValue(fnc(data));
    }
}

const handleValue = (value) => {
    if (value instanceof Promise) return value;
    if (value instanceof Error) return Promise.reject(value);
    return Promise.resolve(value);
}

/**
 * This class represents an atomic operation you want to handle.
 * It might consist of a Promise to chain, a function that returns a fixed value or a Promise or a fixed value itself.
 */
module.exports = class Operation {

    constructor(value, promisify = false) {
        this.value = value;
        this.promisify = promisify;
    }

    /**
     * Converts the wrapped value into a Promise.
     * If the value is a function returning a Promise, it returns that Promise.
     * If the value is a function returning a fixed value it wraps that value in a Promise.
     * If the value is a fixed value itself, it wraps that value in a Promise.
     * If any params are provided and the value is a function, it invokes the function with those parameters.
     * @param {*} params 
     */
    get(params) {
        if (this.value instanceof Operation) return this.value.get(params);
        if (this.value instanceof Function) return handleFunction(this.value, params, this.promisify);
        else return handleValue(this.value);
    }
};