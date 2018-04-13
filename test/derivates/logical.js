'use strict';
require('../../index');
const chai = require('chai')
    , should = chai.should();

describe('Test promise logical operations', () => {

    it('should handle OR operation.', () => {
        return Promise.or([ // Both Resolve non-empty
            () => Promise.resolve('Andy'),
            () => Promise.resolve('Sandy')
        ]).then(result => {
            result.should.equal('Andy');
            return Promise.or([ // Second one resolves empty
                () => Promise.resolve('Andy'),
                () => Promise.resolve()
            ]);
        }).then(result => {
            result.should.equal('Andy');
            return Promise.or([ // First resolves empty
                () => Promise.resolve(),
                () => Promise.resolve('Sandy')
            ]);
        }).then(result => {
            result.should.equal('Sandy');
            return Promise.or([ // Both resolve empty
                () => Promise.resolve(),
                () => Promise.resolve()
            ]);
        }).catch(err => {
            should.exist(err);
            return Promise.or([ // First resolve doesn't meet check
                () => Promise.resolve('Andy'),
                () => Promise.resolve('Sandy')
            ], res => res.length > 4);
        }).then(result => {
            result.should.equal('Sandy');
            return Promise.or([ // First resolve meets check and second rejects.
                () => Promise.resolve('Andy'),
                () => Promise.reject('Sandy')
            ], res => res.length > 3);
        }).then(result => {
            result.should.equal('Andy');
            return Promise.or([ // Both resolves don't meet check
                () => Promise.resolve('Andy'),
                () => Promise.resolve('Sandy')
            ], res => res.length > 6);
        }).catch(err => {
            should.exist(err);
            return Promise.or([ // First resolves empty and second resolve meets check
                () => Promise.resolve(),
                () => Promise.resolve('Sandy')
            ], res => res.length > 4);
        }).then(result => {
            result.should.equal('Sandy');
            return Promise.or([ // First resolves meeting check, second rejects
                () => Promise.resolve('Andy'),
                () => Promise.reject('Sandy')
            ], res => res.length > 3);
        }).then(result => {
            result.should.equal('Andy');
            return Promise.resolve();
        });
    });

    it('should chain OR operations.', () => {
        return Promise.resolve('Andy')._or([
            () => Promise.resolve('Sandy'),
            () => Promise.resolve('Wendy')
        ]).then(result => {
            result.should.equal('Andy');
            return Promise.resolve()._or([
                () => Promise.resolve(),
                () => Promise.resolve('Wendy')
            ]);
        }).then(result => {
            result.should.equal('Wendy');
            return Promise.resolve('Andy')._or([
                () => Promise.reject('Sandy'),
                () => Promise.resolve('Wendy')
            ]);
        }).then(result => {
            result.should.equal('Andy');
            return Promise.or([
                () => Promise.resolve('Andy'),
                () => Promise.resolve('Sandy')
            ])._or([
                () => Promise.resolve('Wendy'),
                () => Promise.resolve('Sally')
            ], res => res.length > 4);
        }).then(result => {
            result.should.equal('Wendy');
            return Promise.or([
                () => Promise.resolve('Andy'),
                () => Promise.resolve('Sandy')
            ])._or([
                () => Promise.resolve('Wendy'),
                () => Promise.resolve('Sally')
            ], res => res.length > 3);
        }).then(result => {
            result.should.equal('Andy');
            return Promise.resolve()._or([
                () => Promise.resolve(),
                () => Promise.resolve()
            ]);
        }).catch(err => {
            should.exist(err);
            return Promise.resolve();
        });
    });

    it('should handle AND operation.', () => {
        return Promise.and([ // Both Resolve non-empty
            () => Promise.resolve('Andy'),
            () => Promise.resolve('Sandy')
        ]).then(results => {
            results.length.should.equal(2);
            results[1].should.equal('Sandy');
            return Promise.and([ // Both Resolve non-empty
                () => Promise.resolve('Andy'),
                () => Promise.reject('Sandy')
            ]);
        }).catch(err => {
            should.exist(err);
            err.should.equal('Sandy');
            return Promise.and([ // Both Resolve non-empty
                () => Promise.resolve('Andy'),
                () => Promise.resolve('Wendy')
            ], res => res.length > 3);
        }).then(results => {
            results.length.should.equal(2);
            results[1].should.equal('Wendy');
            return Promise.and([ // Both Resolve non-empty
                () => Promise.resolve('Andy'),
                () => Promise.resolve()
            ]);
        }).catch(err => {
            should.exist(err);
            err.should.equal('Some Promise checked false.');
            return Promise.and([ // Both Resolve non-empty
                () => Promise.resolve('Andy'),
                () => Promise.resolve('Wendy')
            ], res => res.length > 5);
        }).catch(err => {
            should.exist(err);
            err.should.equal('Some Promise checked false.');
            return Promise.resolve();
        });
    });

    it('should handle XOR operation.', () => {
        return Promise.xor([ // Both Resolve non-empty
            () => Promise.resolve('Andy'),
            () => Promise.resolve('Sandy')
        ]).catch(err => {
            err.should.equal('More than one Promise checked true.');
            return Promise.xor([ // Second one resolves empty
                () => Promise.resolve('Andy'),
                () => Promise.resolve()
            ]);
        }).then(result => {
            result.should.equal('Andy');
            return Promise.xor([ // First resolves empty
                () => Promise.resolve(),
                () => Promise.resolve('Sandy')
            ]);
        }).then(result => {
            result.should.equal('Sandy');
            return Promise.xor([ // Both resolve empty
                () => Promise.resolve(),
                () => Promise.resolve()
            ]);
        }).catch(err => {
            should.exist(err);
            return Promise.xor([ // First resolve doesn't meet check
                () => Promise.resolve('Andy'),
                () => Promise.resolve('Sandy')
            ], res => res.length > 4);
        }).then(result => {
            result.should.equal('Sandy');
            return Promise.xor([ // First resolve meets check and second rejects.
                () => Promise.resolve('Andy'),
                () => Promise.reject('Sandy')
            ], res => res.length > 3);
        }).catch(err => {
            should.exist(err);
            err.should.equal('Sandy');
            return Promise.xor([ // Both resolves don't meet check
                () => Promise.resolve('Andy'),
                () => Promise.resolve('Sandy')
            ], res => res.length > 6);
        }).catch(err => {
            should.exist(err);
            return Promise.xor([ // First resolves empty and second resolve meets check
                () => Promise.resolve(),
                () => Promise.resolve('Sandy')
            ], res => res.length > 4);
        }).then(result => {
            result.should.equal('Sandy');
            return Promise.xor([ // First resolves meeting check, second rejects
                () => Promise.resolve('Andy'),
                () => Promise.reject('Sandy')
            ], res => res.length > 3);
        }).catch(err => {
            should.exist(err);
            err.should.equal('Sandy');
            return Promise.resolve();
        });
    });

    it('should chain logic operation concat mix.', () => {
        return Promise.xor([
            () => Promise.resolve(),
            () => Promise.resolve('Sandy')
        ])._or([
            () => Promise.resolve('Wendy'),
            () => Promise.resolve('Selina')
        ], res => res.length > 5)._xor([
            () => Promise.resolve('McKenzie')
        ], res => res.length > 6)._and([
            () => Promise.resolve('Andy')
        ]).then(results => {
            results.length.should.equal(2);
            results[0].should.equal('McKenzie');
            return Promise.resolve();
        });
    });
});
