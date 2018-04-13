"use strict";

require("./promise-mix-mux");

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
                        return;
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

Promise.prototype._or = function (promisesFunctionsArray, check) {
    return Promise.or([() => this].concat(promisesFunctionsArray), check);
};

Promise.prototype._and = function (promisesFunctionsArray, check) {
    return Promise.and([() => this].concat(promisesFunctionsArray), check);
};

Promise.prototype._xor = function (promisesFunctionsArray, check) {
    return Promise.xor([() => this].concat(promisesFunctionsArray), check);
};