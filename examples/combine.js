'use strict';
require('../index');

/**
 * Here's some sample code for the combine function.
 */

/**
 * Organize unrealted Promises results
 */
exports.getStuff = () => {
    return Promise.combine({
        apples: Promise.resolve(['Green Apple', 'Red Apple']),
        dogs: Promise.resolve(['Lessie', 'Milo'])
    });
};

/**
 * Add items to an object retrieving them asynchronously.
 */
exports.addAnimals = (stuffILike) => {
    return Promise.combine({
        cats: Promise.resolve(['Felix', 'Garfield']),
        dogs: Promise.resolve(['Lessie', 'Milo'])
    }, stuffILike);
};
/**
 * Add 
 */
exports.addAnimals = (stuffILike) => {
    return Promise.resolve(stuffILike) // this might be an ansync call to retrieve stuff you like
        ._combine({
            cats: Promise.resolve(['Felix', 'Garfield']),
            dogs: Promise.resolve(['Lessie', 'Milo'])
        });
};

/**
 * Update items of an object asynchronously.
 */
exports.updateStuff = ({ cats, dogs }) => {
    return Promise.combine({
        cats: Promise.resolve(cats.concat(['Felix', 'Garfield'])),
        dogs: Promise.resolve(dogs.concat(['Lessie', 'Milo']))
    }, { cats, dogs });
};

/**
 * Build complex objects.
 */
exports.getStuff = () => {
    return Promise.combine({
        food: Promise.combine({
            fruit: Promise.resolve(['Green Apple', 'Red Apple']),
            dessert: Promise.resolve(['Cake', 'Cookies'])
        }),
        animals: Promise.combine({
            cats: Promise.resolve(['Felix', 'Garfield']),
            dogs: Promise.resolve(['Lessie', 'Milo'])
        })
    });
};

/**
 * You can use _check to check and throw item-specific errors.
 */
exports.getStuff = () => {
    return Promise.combine({
        cats: Promise.resolve([])._check(cats => cats.length, 'You have to like cats.'),
        dogs: Promise.resolve(['Lessie', 'Milo'])
    });
};

/**
 * You can use _clean to remove empty results.
 */
exports.getStuff = () => {
    return Promise.combine({
        cats: Promise.resolve([]),
        dogs: Promise.resolve(['Lessie', 'Milo'])
    })._clean();
};