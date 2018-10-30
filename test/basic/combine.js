"use strict";
require("../../index");
const chai = require("chai")
    , should = chai.should();

const userPosts = [
    {
        author: "dumbass",
        text: "YOLO!!!"
    },
    {
        author: "smartass",
        text: "E = mc^2"
    }
];

describe("Test combine function", () => {

    it("should create combined data", () => {
        return Promise.combine({
            user: () => { // select an user
                return Promise.resolve({
                    id: "dumbass",
                    name: "Dumb Ass"
                });
            },
            posts: ({ user }) => { // retrieve its posts
                should.exist(user);
                return Promise.resolve(userPosts.filter(item => {
                    return item.author == user.id;
                }));
            }
        }).then(({ user, posts }) => {
            should.exist(user);
            should.exist(posts);
            user.name.should.equal("Dumb Ass");
            posts[0].text.should.equal("YOLO!!!");
            posts.length.should.equal(1);
        });
    });

    it("should auto-throw Errors.", () => {
        return Promise.combine({
            user: () => { // select an user
                return Promise.resolve({
                    id: "dumbass",
                    name: "Dumb Ass"
                });
            },
            posts: () => new Error('No Posts'),
            likes: () => Promise.resolve([])
        }).catch(err => {
            should.exist(err);
            err.message.should.equal('No Posts');
        });
    });

    it("should create combined data with non Promise return", () => {
        return Promise.combine({
            user: () => {
                return {
                    id: "dumbass",
                    name: "Dumb Ass"
                };
            },
            posts: ({ user }) => { // retrieve its posts
                should.exist(user);
                return userPosts.filter(item => {
                    return item.author == user.id;
                });
            }
        }).then(({ user, posts }) => {
            should.exist(user);
            should.exist(posts);
            user.name.should.equal("Dumb Ass");
            posts[0].text.should.equal("YOLO!!!");
            posts.length.should.equal(1);
        });
    });

    it("should create combined data with static values", () => Promise.combine({
        user: {
            id: "dumbass",
            name: "Dumb Ass"
        },
        posts: ({ user }) => { // retrieve its posts
            should.exist(user);
            return userPosts.filter(item => item.author == user.id);
        }
    }).then(({ user, posts }) => {
        should.exist(user);
        should.exist(posts);
        user.name.should.equal("Dumb Ass");
        posts[0].text.should.equal("YOLO!!!");
        posts.length.should.equal(1);
    })
    );

    it("should create combined data with initial value", () => Promise.combine({
        posts: ({ user }) => { // retrieve its posts
            should.exist(user);
            return Promise.resolve(userPosts.filter(item => item.author == user.id));
        }
    }, { user: { id: "dumbass", name: "Dumb Ass" } })
        .then(({ user, posts }) => {
            should.exist(user);
            should.exist(posts);
            user.name.should.equal("Dumb Ass");
            posts[0].text.should.equal("YOLO!!!");
            posts.length.should.equal(1);
        })
    );

    it("should create combined data with non-obbject initial value", () => Promise.combine({
        posts: ({ _init }) => { // retrieve its posts
            should.exist(_init);
            return Promise.resolve(userPosts.filter(item => item.author == _init));
        }
    }, "dumbass").then(({ _init, posts }) => {
        should.exist(_init);
        should.exist(posts);
        _init.should.equal("dumbass");
        posts[0].text.should.equal("YOLO!!!");
        posts.length.should.equal(1);
    }));

    it("should create combined data from \"promisified\" functions", () => Promise.fCombine({
        user: (val, done) => done(null, {
            id: "dumbass",
            name: "Dumb Ass"
        }),
        posts: ({ user }, done) => { // retrieve its posts
            should.exist(user);
            done(null, userPosts.filter(item => item.author == user.id));
        }
    }).then(({ user, posts }) => {
        should.exist(user);
        should.exist(posts);
        user.name.should.equal("Dumb Ass");
        posts[0].text.should.equal("YOLO!!!");
        posts.length.should.equal(1);
    }));

    it("should create combined data from \"promisified\" functions, but being passed static values instead", () => Promise.fCombine({
        user: {
            id: "dumbass",
            name: "Dumb Ass"
        },
        posts: ({ user }, done) => { // retrieve its posts
            should.exist(user);
            done(null, userPosts.filter(item => item.author == user.id));
        }
    }).then(({ user, posts }) => {
        should.exist(user);
        should.exist(posts);
        user.name.should.equal("Dumb Ass");
        posts[0].text.should.equal("YOLO!!!");
        posts.length.should.equal(1);
    }));

    it("should auto-thow Errors.", () => Promise.fCombine({
        user: {
            id: "dumbass",
            name: "Dumb Ass"
        },
        posts: new Error('No Posts')
    }).catch(err => {
        should.exist(err);
        err.message.should.equal('No Posts');
    }));

    it("should create nested combined data", () => Promise.combine({
        users: () => Promise.resolve([
            {
                id: "dumbass",
                name: "Dumb Ass"
            },
            {
                id: "smartass",
                name: "Smart Ass"
            }
        ]),
        posts: ({ users }) => { // retrieve all posts for each user
            should.exist(users);
            return Promise.all(users.map(user => Promise.combine({
                user: () => Promise.resolve(user),
                posts: ({ user }) => {
                    should.exist(user);
                    return Promise.resolve(userPosts.filter(item => item.author == user.id));
                }
            })));
        }
    }).then(({ users, posts }) => {
        should.exist(users);
        should.exist(posts);
        users.length.should.equal(2);
        posts.length.should.equal(2);
        should.exist(users[0]);
        should.exist(posts[0]);
        users[0].id.should.equal("dumbass");
        posts[0].user.id.should.equal(users[0].id);
    }));
});
