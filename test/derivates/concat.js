'use strict';
require('../../index');
const chai = require('chai')
    , should = chai.should();

describe('Test promise concatenation', () => {

    it('should switch to/from callback functions combine', () => {
        return Promise.fCombine({
            step1: (init, done) => done(null, 'step1'),
            step2: (step1Result, done) => done(null, 'step2')
        }, { init: 'init' })._combine({
            step3: () => { return Promise.resolve('step3'); }
        })._fCombine({
            step4: (step3Result, done) => done(null, 'step4')
        }).then((data) => {
            should.exist(data);
            should.exist(data.init);
            should.exist(data.step1);
            should.exist(data.step3);
            should.exist(data.step4);
        });
    });

    it('concat object remix!', () => {
        return Promise.aggregate({
            step1: Promise.resolve('step1')
        }, { init: 'init' })._combine({
            step2: ({ step1 }) => {
                return Promise.resolve(step1);
            }
        })._fCombine({
            step3: ({ step1, step2 }, done) => done(null, { step2 })
        })._aggregate({
            step4: Promise.resolve('step4')
        }).then((data) => {
            should.exist(data);
            should.exist(data.init);
            should.exist(data.step1);
            should.exist(data.step2);
            should.exist(data.step3);
            should.exist(data.step3.step2);
            should.exist(data.step4);
        });
    });

    it('concat array remix!', () => {
        return Promise.merge([
            Promise.resolve(['step1'])
        ], ['init'])._reduce([
            (step1) => {
                step1.push('step2');
                return Promise.resolve(step1);
            }
        ])._fReduce([
            (step2, done) => {
                step2.push('step3');
                done(null, step2 );
            }
        ])._merge([
            Promise.resolve(['step4'])
        ]).then((data) => {
            should.exist(data);
            data.indexOf('init').should.equal(0);
            data.indexOf('step1').should.equal(1);
            data.indexOf('step2').should.equal(2);
            data.indexOf('step3').should.equal(3);
        });
    });

    it('execute aside task.', () => {
        return Promise.resolve('Original')
            ._aside((stream) => {
                return Promise.resolve(`Aside from ${stream}`);
            })
            .then((stream) => {
                stream.should.equal('Original');
            });
    });

    it('execute aside task no promise.', () => {
        return Promise.resolve('Original')
            ._aside((stream) => {
                return `Aside from ${stream}`;
            })
            .then((stream) => {
                stream.should.equal('Original');
            });
    });

    it('execute aside task with breaking error.', () => {
        return Promise.resolve('Original')
            ._aside((stream) => {
                return Promise.reject(`Aside from ${stream}`);
            })
            .catch((error) => {
                error.should.equal('Aside from Original');
            });
    });

    it('execute aside task ignoring error.', () => {
        return Promise.resolve('Original')
            ._aside((stream) => {
                return Promise.reject(`Aside from ${stream}`);
            }, true)
            .then((stream) => {
                stream.should.equal('Original');
            });
    });
});
