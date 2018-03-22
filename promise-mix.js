/**
 * Promise plugin aggregate(promiseMap).
 * 
 * Creates a Promise that maps the incremental results of given promises in an Object with keys given by the input map.
 * Errors if any of the given promises erros.
 * 
 * Examples:
 * 
 *  Promise.aggregate({
 *      cats: Promise.resolve(['Felix', 'Garfield']),
 *      dogs: Promise.resolve(['Rex', 'Lessie']),
 *      turtles: Promise.resolve([]),
 *      fish: Promise.resolve('Nemo')
 *  })
 *  .then(({ cats, dogs, fish, turtle }) => {
 *      // { cats, dogs, fish, turtle } = { cats: ['Felix', 'Garfield'], dogs: ['Rex', 'Lessie'], fish: 'Nemo', turtle: [] }
 *  });
 * 
 *  Promise.aggregate({
 *      cats: Promise.resolve(['Felix', 'Garfield']),
 *      dogs: Promise.resolve(['Rex', 'Lessie']),
 *      turtles: Promise.resolve([]),
 *      fish: Promise.resolve('Nemo'),
 *      birds: Promise.reject('Bird is the word!')
 *  })
 *  .catch((err) => {
 *      // err = 'Bird is the word!'
 *  });
 */
Promise.aggregate = (promisesMap) => {
    let p = Promise.resolve({});
    for (let k in promisesMap) {
        p = p.then((cumRes) => {
            return promisesMap[k]
                .then((res) => {
                    cumRes[k] = res;
                    return cumRes;
                });
        });
    }
    return p;
};

/**
 * Like above, but values of the map should be functions returning promises.
 * 
 * Examples:
 * 
 *  Promise.combine({
 *      cats: () => { return Promise.resolve(['Felix', 'Garfield'])),
 *      dogs: ({ cats }) => { return Promise.resolve(['Rex', 'Lessie']) },
 *      turtles: ({ cats, dogs }) => { return Promise.resolve([]) },
 *      fish: ({ cats, dogs, turtle }) => { return Promise.resolve('Nemo') },
 *      everyone: ({ cats, dogs, turtle, fish }) => { return Promise.resolve({ cats, dogs, turtle, fish }) }
 *  })
 *  .then(({ cats, dogs, fish, turtle, everyone }) => {
 *      // { cats, dogs, fish, turtle, everyone } = { cats: ['Felix', 'Garfield'], dogs: ['Rex', 'Lessie'], fish: 'Nemo', turtle: [], everyone: { cats: ['Felix', 'Garfield'], dogs: ['Rex', 'Lessie'], fish: 'Nemo', turtle: [] } }
 *  });
 */
Promise.combine = (promiseFuncMap) => {
    let p = Promise.resolve({});
    for (let k in promiseFuncMap) {
        p = p.then((cumRes) => {
            return promiseFuncMap[k](cumRes)
                .then((res) => {
                    cumRes[k] = res;
                    return Promise.resolve(cumRes);
                });
        });
    }
    return p;
};

/**
 * Merges the results of an array of promises into a single array of results.
 * 
 * Examples:
 * 
 *  Promise.merge([
 *      Promise.resolve(['Felix', 'Garfield']),
 *      Promise.resolve(['Rex', 'Lessie']),
 *      Promise.resolve([]),
 *      Promise.resolve('Nemo')
 *  ])
 *  .then((results) => {
 *      // results = ['Felix', 'Garfield', 'Rex', 'Lessie', 'Nemo']
 *  });
 */
Promise.merge = (promisesToMerge) => {
    let p = Promise.resolve([]);
    for (let k in promisesToMerge) {
        p = p.then((cumRes) => {
            return promisesToMerge[k]
                .then((res) => {
                    Array.prototype.push.apply(cumRes, res);
                    return Promise.resolve(cumRes);
                });
        });
    }
    return p;
};

/**
 * Sequentially executes an array of functions returning a Promise passing on the previous promise's results.
 * Finally returns the results of the last created Promise.
 * 
 * Examples:
 * 
 *  Promise.reduce([
 *      () => { reutrn Promise.resolve(['Felix', 'Garfield']) },
 *      (cats) => { return Promise.resolve(['Rex', 'Lessie']) },
 *      (dogs) => { return Promise.resolve(dogs) },
 *      (turtles) => { return Promise.resolve(turtles) }
 *  ])
 *  .then((results) => {
 *      // results = ['Rex', 'Lessie']
 *  });
 */
Promise.reduce = (promiseFuncArray) => {
    let p = Promise.resolve({});
    for (let k in promiseFuncArray) {
        p = p.then((cumRes) => {
            return promiseFuncArray[k](cumRes)
                .then((res) => {
                    return Promise.resolve(res);
                });
        });
    }
    return p;
};