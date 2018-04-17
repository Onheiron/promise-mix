"use-strict";

/** 
 * These utilities functions aren't quite on spot in this library as it should really execut operations on Promises not on the
 * downstream itself (which can be easily manipulated with a simple .then), but they might result useful sometimes/somehow to
 * shorten or make more readable a Promise chain.
 */

/**
 * This function checks the downstream against a check function and throws an error if the condition isn't met.
 * 
 * @param {check} function to check the downstream.
 * @returns {Promise} a Promise resolving if the check function returns true, rejecting otherwise.
 */
Promise.prototype._check = function (check) {
    return this.then(res => {
        if (check(res)) {
            return res;
        } else {
            throw 'Unmet check condition.';
        }
    });
};

/**
 * This function revives the downstream of a rejected Promise passing downstream the error itself or a new value if specified.
 * 
 * @param {newDownstream} the new value to pass downstream to the revived Promise.
 * @returns {Promise} a Promise resolving the original caught error or the newDownstream value, if any.
 */
Promise.prototype._revive = function (newDownstream) {
    return this.catch(err => {
        return Promise.resolve(newDownstream ? newDownstream : err);
    });
};

/**
 * This function combines the previous two checking and blocking the downstream on check failed, but immediately reviving it,
 * passing downstream the error or a new value if specified.
 * 
 * @param {check} function to check the downstream.
 * @param {newDownstream} the new value to pass downstream to the revived Promise.
 * @returns {Promise} a Promise resolving the original caught error or the newDownstream value, if any.
 */
Promise.prototype._checkOrRevive = function (check, newDownstream) {
    return this._check(check)._revive(newDownstream);
};

/**
 * Removes all undefined, null or empty items from any downstream object or array.
 * @returns {Promise} a Promise with a clean downstream.
 */
Promise.prototype._clean = function () {
    return this.then((datas) => {
        let cleanData;
        if (datas instanceof Array) cleanData = [];
        else if (datas instanceof Object) cleanData = {};
        else return datas;
        for (let d in datas) {
            const data = datas[d];
            if (data !== null &&
                data !== undefined &&
                data !== '' &&
                (!(data instanceof Object) || Object.keys(data).length > 0) &&
                (!(data instanceof Array) || data.length > 0)) {
                if (cleanData instanceof Array) {
                    cleanData.push(data);
                } else {
                    cleanData[d] = data;
                }
            }
        }
        return cleanData;
    });
};

/**
 * This util hides a mux/deMux operation on a Promise downstream.
 * Basically splits the downstream into an array of Promises each handling a single item of the downstream,
 * uses each single downstream as input for a mapFunction which returns a new Promise to be replaced with
 * the original item one.
 * Finally it merges everything back with a deMux.
 * 
 * @param {mapFunction} a function that accepts a single downstream item and returns a new Promise.
 * @returns {Promise} the deMux of the mapped Promises.
 */
Promise.prototype._map = function (mapFunction) {
    return this._mux((mux) => {
        return mux.then(mapFunction).deMux();
    });
};

/**
 * Stops the downstream for the given amount of milliseconds.
 * 
 * @param {milliseconds} ms milliseconds to wait.
 * @returns {Promise} a Promise continuing the downstream after the given amount of milliseconds.
 */
Promise.prototype._sleep = function (milliseconds) {
    return this.then((donwstream) => {
        return new Promise((res) => {
            setTimeout(() => res(donwstream), milliseconds);
        });
    });
};

/**
 * Really simple chain method which simply logs the downstream with a given tag.
 * This can be helpful to track the value of a downstream without having to write a whole .then(...) clause.
 * 
 * @param {tag} a tag to identify the log.
 * @returns {Promise} a Promise resolving the original downstream.
 */
Promise.prototype._log = function (tag) {
    return this.then((donwstream) => {
        // eslint-disable-next-line no-console
        console.log(tag, donwstream);
        return donwstream;
    });
};

const loop = (prev, func, check, index = 0) => {
    return prev.then((dwn) => func(dwn, index)).then((dwn) => {
        if (check(dwn, index)) return dwn;
        else return loop(Promise.resolve(dwn), func, check, ++index);
    });
};

/**
 * Loops the execution of a function (may be returning Promises) until a given condition is met.
 * Then passes downstream the last result.
 * 
 * @param {iterationFunction} the function to execute on the downstream at each iteration.
 * @param {breakCheck} the function that evaluates if the loop should break.
 * @returns {Promise} a Promise looping until the breakCheck returns true.
 */
Promise.prototype._loop = function (iterationFunction, breakCheck) {
    return loop(this, iterationFunction, breakCheck);
};

/**
 * Excecutes a given function on the downstream only if a certain condition is met.
 * 
 * @param {functionToExecute} a function to be executed on the downstream if the check returns true.
 * @param {check} a function to evaluate wether to execute the function or not.
 * @returns {Promise} a promise resolving the downstream or the result of the function if the check returns true.
 */
Promise.prototype._when = function (functionToExecute, check) {
    return this.then((downstream) => {
        if(check(downstream)) return functionToExecute(downstream);
        return downstream;
    });
};