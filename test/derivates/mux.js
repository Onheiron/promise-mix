"use strict";

const PromiseMux = require("../../index").promiseMux;
const chai = require("chai")
    , should = chai.should();

const users = [
    {
        id: "dumbass",
        name: "Dumb Ass",
        interests: ["cash", "TV", "girls"]
    },
    {
        id: "avgass",
        name: "Avg Ass",
        interests: ["reading", "movies", "girls"]
    },
    {
        id: "smartass",
        name: "Smart Ass",
        interests: ["reading", "chess", "anthropy"]
    }
];

const userLocalPosts = [
    {
        author: "dumbass",
        text: "YOLO!!!"
    },
    {
        author: "avgass",
        text: "Hello world!"
    },
    {
        author: "smartass",
        text: "E = mc^2"
    }
];

const userRemotePosts = [
    {
        author: "dumbass",
        text: "Studied @ Street University"
    },
    {
        author: "avgass",
        text: "Looking for a job"
    },
    {
        author: "smartass",
        text: "Working on my second PhD"
    }
];

describe("Test promise explosion", () => {

    it("should handle parallel Promise combinations", () => PromiseMux.fReduce([
        (init, done) => done(null, init + 1),
        (step1, done) => done(null, step1 * 2),
        (step2, done) => done(null, step2 / 3)
    ], [2, 5, 8]).then(function (result) {
        return `Result is ${result} for key ${this.key}`;
    }).deMux(reports => {
        should.exist(reports);
        reports.length.should.equal(3);
        reports[1].should.equal("Result is 4 for key 1");
    }));

    it("should handle parallel Promise combinations with named streams", () => PromiseMux.fReduce([
        (init, done) => done(null, init + 1),
        (step1, done) => done(null, step1 * 2),
        (step2, done) => done(null, step2 / 3)
    ], {
            easy: 2,
            normal: 5,
            hard: 8
        }).then(function (result) {
            return `Result is ${result} for ${this.key}`;
        }).deMux(reports => {
            should.exist(reports);
            should.exist(reports.easy);
            should.exist(reports.normal);
            should.exist(reports.hard);
            reports.normal.should.equal("Result is 4 for normal");
        })
    );

    it("should notify wrong input types", () => {
        try {
            return Promise.mux('String');
        } catch (err) {
            should.exist(err);
            err.message.should.equal(`PromiseMux input must be an object or an array. Current input type is string`);
        }
    });

    it("should switch from Promise to PromiseMux and back to promise.", () => Promise.mux(["girls", "reading"])
        ._combine({ // for each topic, select the users interested in it
            users: ({ _init }) => {
                should.exist(_init);
                return Promise.resolve(users.filter(user => {
                    return user.interests.indexOf(_init) >= 0;
                }));
            },
            posts: ({ users }) => { // select posts of those users
                return Promise.mux(users)
                    ._reduce([ // for each interested user, build an array of local and remote posts
                        user => {
                            should.exist(user);
                            return Promise.resolve({
                                user, localPosts: userLocalPosts.filter(post => {
                                    return post.author == user.id;
                                })
                            });
                        },
                        ({ user, localPosts }) => {
                            return Promise.resolve(localPosts.concat(userRemotePosts.filter(post => {
                                return post.author == user.id;
                            })));
                        }
                    ]).deMux(posts => { // merge the results, then flatten the array of all posts.
                        return [].concat.apply([], posts);
                    });
            }
        }).deMux(results => {
            should.exist(results);
            results.length.should.equal(2);
            should.exist(results[0].posts);
            results[0].posts.length.should.equal(4);
            // now let's merge all posts in a single array
            let allPosts = results[0].posts;
            allPosts = allPosts.concat(results[1].posts);
            return allPosts;
        })._mux(mux => { // handle muxed data
            return mux._reduce([ // for each post
                post => { // retrieve post author
                    return Promise.resolve({
                        user: users.find(user => {
                            return post.author == user.id;
                        }),
                        post
                    });
                },
                ({ user, post }) => { // format post feed
                    return Promise.resolve(`${user.name} said: "${post.text}"`);
                }
            ]).deMux();
        })
        .then(feeds => { // here we have demuxed data.
            feeds.indexOf("Dumb Ass said: \"YOLO!!!\"").should.equal(0);
            feeds.indexOf("Avg Ass said: \"Looking for a job\"").should.equal(3);
            feeds.indexOf("Smart Ass said: \"Working on my second PhD\"").should.equal(7);
        })
    );

    it("should handle logical concatenation of muxed promises.", () => Promise.mux(["Andy", "Wendy"])._or([
        () => Promise.resolve("Sandy")
    ], res => res.length > 4)._xor([
        () => Promise.resolve("Lia")
    ], res => res.length > 3)._and([
        () => Promise.resolve("Selina")
    ], res => res.length > 4).deMux(results => {
        should.exist(results);
        results.length.should.equal(4);
        results[0].should.equal('Sandy');
        results[2].should.equal('Wendy');
        return Promise.resolve();
    }));

    it("should filter pooled Promises.", () => Promise.mux(["Andy", "Wendy", "Sammy"])
        ._filter(name => name.length > 4).deMux()
        ._clean()
        .then(names => {
            should.exist(names);
            names.length.should.equal(2);
        })
    );

    it("should shuffle Promises.", () => Promise.mux(["Andy", "Wendy", "Sammy"])
        ._shuffle()
        .deMux()
        ._log("Shuffled:")
        .then(names => {
            should.exist(names);
            names.length.should.equal(3);
        })
    );

    it("should execute Promises in blocking sequence.", () => {
        let start = Date.now();
        return Promise.mux([0, 1, 2])
            .then(item => Promise.resolve(item)
                ._sleep(100)
                ._aside(item => {
                    const delta = Date.now() - start;
                    const check = delta >= 100;
                    check.should.equal(true);
                    start = delta;
                    return Promise.resolve(item);
                }))
            .deMux();
    });

    it("should shuffle object Promises.", () => Promise.mux({
        wife: "Andy",
        sister: "Wendy",
        boss: "Sammy"
    })
        ._shuffle()
        .deMux()
        ._log("Shuffled:")
        .then(names => {
            should.exist(names);
            Object.keys(names).length.should.equal(3);
        })
    );
});
