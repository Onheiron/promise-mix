[![buddy pipeline](https://app.buddy.works/onheiron/promise-mix/pipelines/pipeline/130737/badge.svg?token=283a6a2985e2caa8d6cca85b846f96c4497ad84276bf38c02835ceb8085c2562 "buddy pipeline")](https://app.buddy.works/onheiron/promise-mix/pipelines/pipeline/130737)

# Promise Mix

This module contains some extension to default Node.js [Promise](https://www.promisejs.org/).

# Installation

`npm install promise-mix`

# Import

To use the extensions, simply import the module in your script:

```javascript
require('promise-mix');
```
or
```javascript
import 'promise-mix';
```

# Motif

While using promises I often find it hard to orchestrate them correctly and in an elegant, readable way.
Thus I decided to make some extension to the basic `Promise` library in order to put some order in my code.

For example, when having to return a structured JSON composed with the results of different `Promise` I'd usually just build a `Promise` chain like this:

```javascript
Promise.resolve('first promise result')
    .then((res1) => {
        return Promise.resolve('second promise result')
            .then((res2) => {
                return { res1, res2 };
            });
    })
    .then((res12) => {
        return Promise.resolve('third promise result')
            .then((res3) => {
                return {...res12, res3};
            });
    })
    .then((output) => {
        res.send(output)
    }).catch(next);
/**
 *  this would return to the caller:
 * 
 *      { 
 *          res1: 'first promise result', 
 *          res2: 'second promise result', 
 *          res3: 'third promise result' 
 *      }
 * /
```

With the `aggregate` extension, it'd be much more straight forward and clean to obtain the same result:

```javascript
Promise.aggregate({
    res1: Promise.resolve('first promise result'),
    res2: Promise.resolve('second promise result'),
    res3: Promise.resolve('third promise result'),
})
.then((output) => {
    res.send(output)
}).catch(next);
// this would return the same output as above.
```

Check out all the extensions for more useful combination methods.

# Extensions

This module adds four more composition functions to the basic `Promise` Object:

1. `aggregate` puts the results of a series of Promise into an aggregate object and passes it downstream as a single promise result.

    ```javascript
    Promise.aggregate({
        cats: Promise.resolve(['Felix', 'Garfield']),
        dogs: Promise.resolve(['Rex', 'Lessie']),
        turtles: Promise.resolve([]),
        fish: Promise.resolve('Nemo')
    })
    .then(({ cats, dogs, fish, turtle }) => {
        // { cats, dogs, fish, turtle } = { cats: ['Felix', 'Garfield'], dogs: ['Rex', 'Lessie'], fish: 'Nemo', turtle: [] }
    });
    ```

2. `compose` like `aggregate`, but each item of the input must be a function returning a Promise. Results from previous promises will be passed down as parameters to successive functions:

    ```javascript
    Promise.combine({
        cats: () => { return Promise.resolve(['Felix', 'Garfield'])),
        dogs: ({ cats }) => { return Promise.resolve(['Rex', 'Lessie']) },
        turtles: ({ cats, dogs }) => { return Promise.resolve([]) },
        fish: ({ cats, dogs, turtle }) => { return Promise.resolve('Nemo') },
        everyone: ({ cats, dogs, turtle, fish }) => { return Promise.resolve({ cats, dogs, turtle, fish }) }
    })
    .then(({ cats, dogs, fish, turtle, everyone }) => {
        // { cats, dogs, fish, turtle, everyone } = { cats: ['Felix', 'Garfield'], dogs: ['Rex', 'Lessie'], fish: 'Nemo', turtle: [], everyone: { cats: ['Felix', 'Garfield'], dogs: ['Rex', 'Lessie'], fish: 'Nemo', turtle: [] } }
    });
    ```

3. `merge` merges the results of an array of promises into a single flat array:

    ```javascript
    Promise.merge([
        Promise.resolve(['Felix', 'Garfield']),
        Promise.resolve(['Rex', 'Lessie']),
        Promise.resolve([]),
        Promise.resolve(['Nemo'])
    ])
    .then((results) => {
        // results = ['Felix', 'Garfield', 'Rex', 'Lessie', 'Nemo']
    });
    ```

4. `reduce` accepts an array of functions returning promises and returns the result of the last promise in the array. Each promise result is passed as an argument to the next function in the array:

    ```javascript
    Promise.reduce([
        () => { reutrn Promise.resolve(['Felix', 'Garfield']) },
        (cats) => { return Promise.resolve(['Rex', 'Lessie']) },
        (dogs) => { return Promise.resolve(dogs) },
        (turtles) => { return Promise.resolve(turtles) }
    ])
    .then((results) => {
        // results = ['Rex', 'Lessie']
    });
    ```

# Version History

**1.0.X:** First version with few patches, final patch `1.0.7`.

**1.1.X:** New Features:

1. `fCombine` and `fReduce` which behave like `combine` and `reduce`, but make use of functions in the format `(pars, callback(err, val))` instead of functions returning promises. This helps integrate async library functions that make use of callbacks instead of Promises.

2. All functions now accept a second parameter which will be used as initial value for the sequence. See tests and documentation for some example.

**1.2.X:** New Features:

Extensions can now be concatenated with instance-specific functions: `_aggregate`, `_combine`, `_fCombine`, `_merge`, `_reduce`, `_fReduce`. These concatenation functions help switch composition context and structure on the go, but might end up confusing as for the value passed downstream. See tests for some working examples.

**1.3.X:** New Features:

1. Added `dev` warnings and errors for concatenation special cases: `_aggregate` and `_combine` will have non-object donwstreams assigned to an `_init` variable in the aggregation object.

2. Added `mux` and `deMux` functionality to mix several promises from an array or an object of inputs as if it were one. See tests for some cool example!

**1.4.X:** New Features:

1. Added `_aside` concatenation to execute side-operations alongside the downstream without affecting the downstream itself, even ignoring errors if desired.

2. Added `or`, `and` and `xor` methods to handle logical composition of a sequence of Promises's results. For examble the `or` operator doesn't even execute a successive Promise if any previous one succeeds, while `and` doesn't executre successive Promises of a failed one. Each logical operation "fails" if the downstream is undefined or if a given check function on the result is not met.

3. Added `_or`, `_and` and `_xor` concat methods to chain logical block building with downstream data from other promises. These also work with `mux`-ed Promises.

**1.5.X:** New Features:

1. Added sone utility functions which can be useful to add expressivity to Promise chains and shorten some steps.

2. Added `_filter` and `_shuffle` methods to muxed Promises. The `_filter` method accept a filtering function and sets to undefined all the filtered out downstreams (the function should return true for passing downstreams only). Chaining a `_clean()` after the `deMux` will finally remove the filtered-out undefined items from the downstream. The `_shuffle` method simply shuffles the Promises in the mux pool (be it an Array
or an Object) and keeps the new shuffled pool for chaining.