"use strict";

const env = process.env.NODE_ENV || "dev";
const util = require("util");

const checkNonObjectInit = (init, funcName) => {
    if (init && !(init instanceof Object)) {
        if (env == "dev") {
            process.emitWarning(`"${funcName}" called with non-object init value, that value will be assigned to an "_init" field in the output object.`);
        }
        return { _init: init };
    }
    return init;
};

/**
 * Promise plugin aggregate(promiseMap).
 * 
 * Creates a Promise that maps the incremental results of given promises in an Object with keys given by the input map.
 * Errors if any of the given promises erros.
 * 
 * @param {Object} promisesMap a dictionary of promises.
 * @param {*} init a value to initialize the aggregate output.
 * @returns {Promise} downstreaming an object containing the results of the given Promises.
 * 
 * Examples:
 * 
 *  Promise.aggregate({
 *      cats: Promise.resolve(["Felix", "Garfield"]),
 *      dogs: Promise.resolve(["Rex", "Lessie"]),
 *      turtles: Promise.resolve([]),
 *      fish: Promise.resolve("Nemo")
 *  })
 *  .then(({ cats, dogs, fish, turtle }) => {
 *      // { cats, dogs, fish, turtle } = { cats: ["Felix", "Garfield"], dogs: ["Rex", "Lessie"], fish: "Nemo", turtle: [] }
 *  });
 * 
 *  Promise.aggregate({
 *      cats: Promise.resolve(["Felix", "Garfield"]),
 *      dogs: Promise.resolve(["Rex", "Lessie"]),
 *      turtles: Promise.resolve([]),
 *      fish: Promise.resolve("Nemo"),
 *      birds: Promise.reject("Bird is the word!")
 *  })
 *  .catch((err) => {
 *      // err = "Bird is the word!"
 *  });
 */
Promise.aggregate = (promisesMap, init) => {
    init = checkNonObjectInit(init, "aggregate");
    let p = Promise.resolve(init || {});
    for (let k in promisesMap) {
        p = p.then((cumRes) => {
            let next = promisesMap[k];
            if (!(next instanceof Promise)) {
                next = Promise.resolve(next);
            }
            return next.then((res) => {
                if (res instanceof Error) {
                    throw res;
                } else {
                    cumRes[k] = res;
                    return cumRes;
                }
            });
        });
    }
    return p;
};

/**
 * Like above, but values of the map should be functions returning promises.
 * 
 * @param {Object} promiseFuncMap a dictionary of functions returning Promises.
 * @param {*} init a value to initialize the combbined output.
 * @returns {Promise} downstreaming an object containing the results of the promises returned by each function.
 * 
 * Examples:
 * 
 *  Promise.combine({
 *      cats: () => { return Promise.resolve(["Felix", "Garfield"])),
 *      dogs: ({ cats }) => { return Promise.resolve(["Rex", "Lessie"]) },
 *      turtles: ({ cats, dogs }) => { return Promise.resolve([]) },
 *      fish: ({ cats, dogs, turtle }) => { return Promise.resolve("Nemo") },
 *      everyone: ({ cats, dogs, turtle, fish }) => { return Promise.resolve({ cats, dogs, turtle, fish }) }
 *  })
 *  .then(({ cats, dogs, fish, turtle, everyone }) => {
 *      // { cats, dogs, fish, turtle, everyone } = { cats: ["Felix", "Garfield"], dogs: ["Rex", "Lessie"], fish: "Nemo", turtle: [], everyone: { cats: ["Felix", "Garfield"], dogs: ["Rex", "Lessie"], fish: "Nemo", turtle: [] } }
 *  });
 */
Promise.combine = (promiseFuncMap, init) => {
    init = checkNonObjectInit(init, "combine");
    let p = Promise.resolve(init || {});
    for (let k in promiseFuncMap) {
        p = p.then(cumRes => {
            let fun = promiseFuncMap[k];
            if (!(fun instanceof Function)) {
                const val = fun;
                fun = () => {
                    return val;
                };
            }
            let next = fun(cumRes);
            if (!(next instanceof Promise)) {
                next = Promise.resolve(next);
            }
            return next.then(res => {
                if (res instanceof Error) {
                    throw res;
                } else {
                    cumRes[k] = res;
                    return cumRes;
                }
            });
        });
    }
    return p;
};

/**
 * Like above, but values of the map are simple function which will be automatically converted to return promises.
 * 
 * @param {Object} funcMap a dictionary of callback-pattern functions.
 * @param {*} init a value to initialize the combined output.
 * @returns {Promise} downstreaming an object containing the results of the callbacks of each function.
 * 
 * Examples:
 * 
 *  Promise.fCombine({
 *      cats: ({ humans }, done) => { done(null, ["Felix", "Garfield"]) },
 *      dogs: ({ cats }, done) => { done(null, ["Rex", "Lessie"]) },
 *      turtles: ({ cats, dogs }, done) => { done(null, []) },
 *      fish: ({ cats, dogs, turtle }, done) => { done(null, "Nemo") },
 *      everyone: ({ cats, dogs, turtle, fish }, done) => { done(null, { cats, dogs, turtle, fish }) }
 *  }, { homans: ["John"] })
 *  .then(({ humans, cats, dogs, fish, turtle, everyone }) => {
 *      // { humans, cats, dogs, fish, turtle, everyone } = { humans: ["John"], cats: ["Felix", "Garfield"], dogs: ["Rex", "Lessie"], fish: "Nemo", turtle: [], everyone: { cats: ["Felix", "Garfield"], dogs: ["Rex", "Lessie"], fish: "Nemo", turtle: [] } }
 *  });
 */
Promise.fCombine = (funcMap, init) => {
    init = checkNonObjectInit(init, "fCombine");
    let p = Promise.resolve(init || {});
    for (let k in funcMap) {
        p = p.then(cumRes => {
            let fun = funcMap[k];
            if (!(fun instanceof Function)) {
                const val = fun;
                fun = (arg, cb) => {
                    cb(null, val);
                };
            }
            return util.promisify(fun)(cumRes)
                .then(res => {
                    if (res instanceof Error) {
                        throw res;
                    } else {
                        cumRes[k] = res;
                        return cumRes;
                    }
                });
        });
    }
    return p;
};

/**
 * Merges the results of an array of promises into a single array of results.
 * 
 * @param {Array} promisesToMerge an array of Promises to merge.
 * @param {*} init an array of values which will be kept in the output array.
 * @returns {Promise} downstreaming an array containing the flattened results of each Promise.
 * 
 * Examples:
 * 
 *  Promise.merge([
 *      Promise.resolve(["Felix", "Garfield"]),
 *      Promise.resolve(["Rex", "Lessie"]),
 *      Promise.resolve([]),
 *      Promise.resolve("Nemo")
 *  ])
 *  .then((results) => {
 *      // results = ["Felix", "Garfield", "Rex", "Lessie", "Nemo"]
 *  });
 */
Promise.merge = (promisesToMerge, init) => {
    if (init && !Array.isArray(init)) init = [init];
    let p = Promise.resolve(init || []);
    for (let k in promisesToMerge) {
        p = p.then(cumRes => {
            let next = promisesToMerge[k];
            if (!(next instanceof Promise)) {
                next = Promise.resolve(next);
            }
            return next.then(res => {
                if (res instanceof Error) {
                    throw res;
                } else {
                    if (!Array.isArray(res)) res = [res];
                    Array.prototype.push.apply(cumRes, res);
                    return cumRes;
                }
            });
        });
    }
    return p;
};

/**
 * Sequentially executes an array of functions returning a Promise passing on the previous promise"s results.
 * Finally returns the results of the last created Promise.
 * 
 * @param {Array} promiseFuncArray an array of functions returning Promises.
 * @param {*} init a value to serve as input for the first function.
 * @returns {Promise} downstreaming the value returned by the last generated Promise.
 * 
 * Examples:
 * 
 *  Promise.reduce([
 *      () => { reutrn Promise.resolve(["Felix", "Garfield"]) },
 *      (cats) => { return Promise.resolve(["Rex", "Lessie"]) },
 *      (dogs) => { return Promise.resolve(dogs) },
 *      (turtles) => { return Promise.resolve(turtles) }
 *  ])
 *  .then((results) => {
 *      // results = ["Rex", "Lessie"]
 *  });
 */
Promise.reduce = (promiseFuncArray, init) => {
    let p = Promise.resolve(init || {});
    for (let k in promiseFuncArray) {
        p = p.then(cumRes => {
            let fun = promiseFuncArray[k];
            if (!(fun instanceof Function)) {
                const val = fun;
                fun = () => {
                    return val;
                };
            }
            let next = fun(cumRes);
            if (!(next instanceof Promise)) {
                next = Promise.resolve(next);
            }
            return next.then(res => {
                if (res instanceof Error) {
                    throw res;
                } else {
                    return res;
                }
            });
        });
    }
    return p;
};

/**
 * Sequentially executes an array of functions (after automatically converting them to return promises) passing on the previous promise"s results.
 * Finally returns the results of the last created Promise.
 * 
 * @param {Array} funcArray an array of callback-pattern functions.
 * @param {*} init a value to serve as input for the first function.
 * @returns {Promise} downstreaming the value returned to the last invoked callback.
 * 
 * Examples:
 * 
 *  Promise.fReduce([
 *      (humans, done) => { done(null, ["Felix", "Garfield"]) },
 *      (cats, done) => { done(null, ["Rex", "Lessie"]) },
 *      (dogs, done) => { done(null, dogs) },
 *      (turtles, done) => { done(null, turtles) }
 *  ], "John")
 *  .then((results) => {
 *      // results = ["Rex", "Lessie"]
 *  });
 */
Promise.fReduce = (funcArray, init) => {
    let p = Promise.resolve(init || {});
    for (let k in funcArray) {
        p = p.then(cumRes => {
            let fun = funcArray[k];
            if (!(fun instanceof Function)) {
                const val = fun;
                fun = (arg, cb) => {
                    cb(null, val);
                };
            }
            return util.promisify(fun)(cumRes)
                .then(res => {
                    if (res instanceof Error) {
                        throw res;
                    } else {
                        return res;
                    }
                });
        });
    }
    return p;
};