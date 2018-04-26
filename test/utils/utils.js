"use strict";
require("../../index");
const chai = require("chai")
    , should = chai.should();

describe("Test promise utilities", () => {

    it("should catch failed checks.", () => {
        return Promise.resolve(5)
            ._check(number => number > 6)
            .catch((err) => {
                should.exist(err);
                err.should.equal('Unmet check condition.');
            });
    });

    it("should resolve succeeded checks.", () => {
        return Promise.resolve(7)
            ._check(number => number > 6)
            .then((number) => {
                should.exist(number);
                number.should.equal(7);
            });
    });

    it("should revive failed promises.", () => {
        return Promise.reject(5)
            ._revive(7)
            .then(number => {
                should.exist(number);
                number.should.equal(7);
            });
    });

    it("should revive failed checks.", () => {
        return Promise.resolve(5)
            ._checkOrRevive(number => number > 6, 7)
            .then(number => {
                should.exist(number);
                number.should.equal(7);
            });
    });

    it("should clean downstream.", () => {
        return Promise.resolve({
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
        });
    });

    it("should't clean non-object or non-array donwstream.", () => {
        return Promise.resolve('String')
            ._clean()
            .then(cleanOutput => {
                should.exist(cleanOutput);
                cleanOutput.should.equal('String');
            });
    });

    it("should map downstream Promises.", () => {
        return Promise.resolve(['Annie', 'Lawrence', 'Silvio'])
            ._map((name) => {
                return Promise.resolve(name.length);
            })
            ._log("Lenghts:")
            .then((lengths) => {
                should.exist(lengths);
                lengths.length.should.equal(3);
                lengths[1].should.equal(8);
            });
    });

    it("should sleep for given milliseconds.", () => {
        return Promise.resolve(new Date().getTime())
            ._sleep(100)
            .then((then) => {
                const elapsed = new Date().getTime() - then;
                elapsed.should.be.gte(100);
                should.exist(then);
            });
    });

    it("should loop serveral executions.", () => {
        return Promise.resolve(1)
            ._loop((value, index) => {
                return Promise.resolve(value + index);
            }, value => value > 13)
            .then((result) => {
                should.exist(result);
                result.should.equal(16);
            });
    });

    it("should execute when block.", () => {
        return Promise.resolve(1)
            ._when(number => ++number, number => number < 2)
            .then((number) => {
                should.exist(number);
                number.should.equal(2);
            });
    });

    it("should NOT execute when block.", () => {
        return Promise.resolve(1)
            ._when(number => ++number, number => number > 2)
            .then((number) => {
                should.exist(number);
                number.should.equal(1);
            });
    });

    it("should pick array output.", () => {
        return Promise.resolve(['Jenny', 'Diane', 'Lindsay', 'Alex'])
            ._pick([1, 2, 3])
            .then((girls) => {
                should.exist(girls);
                girls.length.should.equal(3);
                girls[0].should.equal('Diane');
            });
    });

    it("should pick object output.", () => {
        return Promise.resolve({
            girlfriend: 'Jenny',
            mother: 'Nadia',
            sister: 'Wendy'
        })._pick(['girlfriend', 'mother'])
            .then((girls) => {
                should.exist(girls);
                should.exist(girls.girlfriend);
                should.exist(girls.mother);
                should.not.exist(girls.sister);
                girls.girlfriend.should.equal('Jenny');
                girls.mother.should.equal('Nadia');
            });
    });

    it("should turn keys to array and reject non array / object downstream picks.", () => {
        return Promise.resolve('Jenny')
            ._pick(2)
            .catch((err) => {
                should.exist(err);
                err.should.equal('Cannot read properties 2 of Jenny');
            });
    });
});