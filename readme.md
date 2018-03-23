# Promise Mix

This module contains some extension to default Node.js [Promise](https://www.promisejs.org/).

# Installation

`npm install promise-mix`

# Usage

To use the extensions, simply import the module in your script:

```javascript
require('promise-mix');
```
or
```javascript
import 'promise-mix';
```

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
        Promise.resolve('Nemo')
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

**1.0.X:** First version with few patches, final patch `1.0.7`

**1.1.X:** New Features:

  1. `fCombine` and `fReduce` which behave like `combine` and `reduce`, but make use of functions in the format `(pars, callback(err, val))` instead of functions returning promises. This helps integrate async library functions that make use of callbacks instead of Promises.

  2. All functions now accept a second parameter which will be used as initial value for the sequence. See tests and documentation for some example.

**1.2.X:** New Features:

  1. Extensions can now be concatenated with instance-specific functions: `_aggregate`, `_combine`, `_fCombine`, `_merge`, `_reduce`, `_fReduce`. These concatenation functions help switch composition context and structure on the go, but might end up confusing as for the value passed downstream. See tests for some working examples.