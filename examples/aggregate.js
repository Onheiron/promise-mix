'use strict';
require('../index');

/**
 * Here's some sample code for the aggregate function.
 */

/**
 * Organize unlinked Promises results
 */
exports.getStuff = () => {
    return Promise.aggregate({
        apples: Promise.resolve(['Green Apple', 'Red Apple']),
        dogs: Promise.resolve(['Lessie', 'Milo'])
    });
};

/**
 * Add items to an object retrieving them asynchronously.
 */
exports.addAnimals = (stuffILike) => {
    return Promise.aggregate({
        cats: Promise.resolve(['Felix', 'Garfield']),
        dogs: Promise.resolve(['Lessie', 'Milo'])
    }, stuffILike);
};

/**
 * Update items of an object asynchronously.
 */
exports.updateStuff = ({ cats, dogs }) => {
    return Promise.aggregate({
        cats: Promise.resolve(cats.concat(['Felix', 'Garfield'])),
        dogs: Promise.resolve(dogs.concat(['Lessie', 'Milo']))
    }, { cats, dogs });
};

/**
 * Build complex objects.
 */
exports.getStuff = () => {
    return Promise.aggregate({
        food: Promise.aggregate({
            fruit: Promise.resolve(['Green Apple', 'Red Apple']),
            dessert: Promise.resolve(['Cake', 'Cookies'])
        }),
        animals: Promise.aggregate({
            cats: Promise.resolve(['Felix', 'Garfield']),
            dogs: Promise.resolve(['Lessie', 'Milo'])
        })
    });
};

/**
 * You can use _check to check and throw item-specific errors.
 */
exports.getStuff = () => {
    return Promise.aggregate({
        cats: Promise.resolve([])._check(cats => cats.length, 'You have to like cats.'),
        dogs: Promise.resolve(['Lessie', 'Milo'])
    });
};

/**
 * You can use _clean to remove empty results.
 */
exports.getStuff = () => {
    return Promise.aggregate({
        cats: Promise.resolve([]),
        dogs: Promise.resolve(['Lessie', 'Milo'])
    })._clean();
};