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

**1.0.X:** 