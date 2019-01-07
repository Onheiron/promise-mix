'use-strict';
const util = require("util");

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
        if (this.value instanceof Promise) return this.value;
        let result;
        if (this.value instanceof Function) {
            if (this.promisify) {
                return util.promisify(this.value)(params);
            } else {
                result = this.value(params);
            }
        } else {
            result = this.value;
        }
        if (result instanceof Promise) {
            return result;
        } else {
            if(result instanceof Error) return Promise.reject(result);
            else return Promise.resolve(result);
        }
    }
};