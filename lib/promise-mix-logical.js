"use strict";

/**
 * Evaluates the first function in the given array and checks the returned Promise output.
 * If the output is undefined or it doesn't pass a given check, then the next function is evaluated.
 * So on until any Proimise result passes the check.
 * 
 * @param {Array} promisesFunctionsArray the array of functions returning Promises to evaluate.
 * @param {Function} check the function to check the downstream.
 */
Promise.or = (promisesFunctionsArray, check) => {
    let p = Promise.resolve();
    for (let k in promisesFunctionsArray) {
        p = p.then((success) => {
            if (success) {
                return success;
            } else {
                return promisesFunctionsArray[k]()
                    .then((res) => {
                        if (res && (!check || (check && check(res)))) {
                            return res;
                        } else {
                            return;
                        }
                    });
            }
        });
    }
    p = p.then((success) => {
        if (!success) {
            throw 'No Promise checked true.';
        } else {
            return success;
        }
    });
    return p;
};

/**
 * Evaluates the first function in the given array and checks the returned Promise output.
 * If the output isn't undefined and passes a given check, then the next function is evaluated.
 * So on until any Proimise result is undefined or it doesn't pass the check.
 * 
 * @param {Array} promisesFunctionsArray the array of functions returning Promises to evaluate.
 * @param {Function} check the function to check the downstream.
 */
Promise.and = (promisesFunctionsArray, check) => {
    let p = promisesFunctionsArray[0]();
    let results = [];
    for (let k in promisesFunctionsArray.splice(0, 1)) {
        p = p.then((success) => {
            if (!success || (check && !check(success))) {
                throw 'Some Promise checked false.';
            } else {
                results.push(success);
                return promisesFunctionsArray[k]();
            }
        });
    }
    return p.then((success) => {
        if (!success || (check && !check(success))) {
            throw 'Some Promise checked false.';
        } else {
            results.push(success);
            return results;
        }
    });
};

/**
 * Evaluates the first function in the given array and checks the returned Promise output.
 * If two Promises donwstreams are not undefined and do pass the check, then the xor rejects 
 * and no more functions will be evaluated.
 * 
 * @param {Array} promisesFunctionsArray the array of functions returning Promises to evaluate.
 * @param {Function} check the function to check the downstream.
 */
Promise.xor = (promisesFunctionsArray, check) => {
    let p = Promise.resolve();
    for (let k in promisesFunctionsArray) {
        p = p.then((success) => {
            return promisesFunctionsArray[k]()
                .then((res) => {
                    if (res && (!check || (check && check(res)))) {
                        if (success) {
                            throw 'More than one Promise checked true.';
                        } else {
                            return res;
                        }
                    } else {
                        return success;
                    }
                });
        });
    }
    p = p.then((success) => {
        if (!success) {
            throw 'No Promise checked true.';
        } else {
            return success;
        }
    });
    return p;
};