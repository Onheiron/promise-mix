"use strict";
require("../../index");
const chai = require("chai")
    , should = chai.should();

describe("Test promise utilities", () => {

    it("should catch failed checks.", () => Promise.resolve(5)
        ._check(number => number > 6)
        .catch(err => {
            should.exist(err);
            err.should.equal('Unmet check condition.');
        })
    );

    it("should resolve succeeded checks.", () => Promise.resolve(7)
        ._check(number => number > 6)
        .then(number => {
            should.exist(number);
            number.should.equal(7);
        })
    );

    it("should revive failed promises.", () => Promise.reject(5)
        ._revive(7)
        .then(number => {
            should.exist(number);
            number.should.equal(7);
        })
    );

    it("should revive failed checks.", () => Promise.resolve(5)
        ._checkOrRevive(number => number > 6, 7)
        .then(number => {
            should.exist(number);
            number.should.equal(7);
        })
    );

    it("should clean downstream.", () => Promise.resolve({
        peter: {},
        pluto: null,
        paul: undefined,
        stacy: [],
        gwen: 'cool'
    })._clean().then(cleanOutput => {
        should.exist(cleanOutput);
        should.not.exist(cleanOutput.peter);
        should.not.exist(cleanOutput.pluto);
        should.not.exist(cleanOutput.paul);
        should.not.exist(cleanOutput.stacy);
    }));

    it("should't clean non-object or non-array donwstream.", () => Promise.resolve('String')
        ._clean()
        .then(cleanOutput => {
            should.exist(cleanOutput);
            cleanOutput.should.equal('String');
        })
    );

    it("should map downstream Promises.", () => Promise.resolve(['Annie', 'Lawrence', 'Silvio'])
        ._map(name => Promise.resolve(name.length))
        ._log("Lenghts:")
        .then(lengths => {
            should.exist(lengths);
            lengths.length.should.equal(3);
            lengths[1].should.equal(8);
        })
    );

    it("should sleep for given milliseconds.", () => Promise.resolve(new Date().getTime())
        ._sleep(100)
        .then(then => {
            const elapsed = new Date().getTime() - then;
            elapsed.should.be.gte(100);
            should.exist(then);
        })
    );

    it("should loop serveral executions.", () => Promise.resolve(1)
        ._loop((value, index) => {
            return Promise.resolve(value + index);
        }, value => value > 13)
        .then(result => {
            should.exist(result);
            result.should.equal(16);
        })
    );

    it("should execute when block.", () => Promise.resolve(1)
        ._when(number => number < 2, number => ++number)
        .then(number => {
            should.exist(number);
            number.should.equal(2);
        })
    );

    it("should NOT execute when block.", () => Promise.resolve(1)
        ._when(number => number > 2, number => ++number)
        .then(number => {
            should.exist(number);
            number.should.equal(1);
        })
    );

    it("should execute the if function.", () => Promise.resolve(3)
        ._ifElse(number => number > 2, number => ++number, number => --number)
        .then(number => {
            should.exist(number);
            number.should.equal(4);
        })
    );

    it("should execute the else function.", () => Promise.resolve(1)
        ._ifElse(number => number > 2, number => ++number, number => --number)
        .then(number => {
            should.exist(number);
            number.should.equal(0);
        })
    );

    it("should pick array output.", () => Promise.resolve(['Jenny', 'Diane', 'Lindsay', 'Alex'])
        ._pick([1, 2, 3])
        .then(girls => {
            should.exist(girls);
            girls.length.should.equal(3);
            girls[0].should.equal('Diane');
        })
    );

    it("should just-pick array output.", () => Promise.resolve(['Jenny', 'Diane', 'Lindsay', 'Alex'])
        ._just(1)
        .then(girl => {
            should.exist(girl);
            girl.should.equal('Diane');
        })
    );

    it("should pick object output.", () => Promise.resolve({
        girlfriend: 'Jenny',
        mother: 'Nadia',
        sister: 'Wendy'
    })._pick(['girlfriend', 'mother'])
        .then(girls => {
            should.exist(girls);
            should.exist(girls.girlfriend);
            should.exist(girls.mother);
            should.not.exist(girls.sister);
            girls.girlfriend.should.equal('Jenny');
            girls.mother.should.equal('Nadia');
        })
    );

    it("should just-pick object output.", () => Promise.resolve({
        girlfriend: 'Jenny',
        mother: 'Nadia',
        sister: 'Wendy'
    })._just('girlfriend')
        .then(girl => {
            should.exist(girl);
            girl.should.equal('Jenny');
        })
    );

    it("should turn keys to array and reject non array / object downstream picks.", () => Promise.resolve('Jenny')
        ._pick(2)
        .catch(err => {
            should.exist(err);
            err.should.equal('Cannot read properties 2 of Jenny');
        })
    );

    it("should turn keys to array and reject non array / object downstream just-picks.", () => Promise.resolve('Jenny')
        ._just(2)
        .catch(err => {
            should.exist(err);
            err.should.equal('Cannot read properties 2 of Jenny');
        })
    );

    it("should check downstream existence failing.", () => Promise.resolve()
        ._exists('Bummer')
        .catch(err => {
            should.exist(err);
            err.should.equal('Bummer');
        })
    );

    it("should check downstream existence succeeding.", () => Promise.resolve('Jenny')
        ._exists('Bummer')
        .then(downstream => {
            should.exist(downstream);
            downstream.should.equal('Jenny');
        })
    );
});