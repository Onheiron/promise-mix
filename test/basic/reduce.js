"use strict";
require("../../index");
const chai = require("chai")
    , should = chai.should();


const users = [
    {
        id: "dumbass",
        name: "Dumb Ass"
    },
    {
        id: "smartass",
        name: "Smart Ass"
    }
];

const userPosts = [
    {
        author: "dumbass",
        text: "YOLO!!!"
    },
    {
        author: "dumbass",
        text: "YOLO!!!"
    },
    {
        author: "smartass",
        text: "E = mc^2"
    }
];

const retrieveUser = (id, done) => {
    const user = users.find((user) => {
        return user.id == id;
    });
    if (user) done(null, user);
    else done("No user found");
};

const retrieveUserPosts = (user, done) => {
    const posts = userPosts.filter((post) => {
        return post.author == user.id;
    });
    if (posts) done(null, posts);
    else done("No posts found");
};

describe("Test reduce function", () => {

    it("should create reduced data", () => {
        return Promise.reduce([
            () => { // select a user
                return Promise.resolve({
                    id: "dumbass",
                    name: "Dumb Ass"
                });
            },
            (user) => { // fetch user"s posts
                return Promise.resolve(userPosts.filter((post) => {
                    return post.author == user.id;
                }));
            },
            (posts) => { // only take the posts text
                return Promise.resolve(posts.map((post) => {
                    return post.text;
                }));
            }
        ]).then((texts) => {
            should.exist(texts);
            texts[0].should.equal("YOLO!!!");
            texts.length.should.equal(2);
        });
    });

    it("should create reduced data from functions returning static values.", () => {
        return Promise.reduce([
            () => { // select a user
                return {
                    id: "dumbass",
                    name: "Dumb Ass"
                };
            },
            (user) => { // fetch user"s posts
                return Promise.resolve(userPosts.filter((post) => {
                    return post.author == user.id;
                }));
            },
            (posts) => { // only take the posts text
                return Promise.resolve(posts.map((post) => {
                    return post.text;
                }));
            }
        ]).then((texts) => {
            should.exist(texts);
            texts[0].should.equal("YOLO!!!");
            texts.length.should.equal(2);
        });
    });

    it("should create reduced data from static values.", () => {
        return Promise.reduce([
            {
                id: "dumbass",
                name: "Dumb Ass"
            },
            (user) => { // fetch user"s posts
                return Promise.resolve(userPosts.filter((post) => {
                    return post.author == user.id;
                }));
            },
            (posts) => { // only take the posts text
                return Promise.resolve(posts.map((post) => {
                    return post.text;
                }));
            }
        ]).then((texts) => {
            should.exist(texts);
            texts[0].should.equal("YOLO!!!");
            texts.length.should.equal(2);
        });
    });

    it("should create reduced data from \"promisified\" functions and initial value", () => {
        return Promise.fReduce([
            retrieveUser,
            retrieveUserPosts,
            (posts, done) => { // only take the posts text
                done(null, posts.map((post) => {
                    return post.text;
                }));
            }
        ], "dumbass").then((texts) => {
            should.exist(texts);
            texts[0].should.equal("YOLO!!!");
            texts.length.should.equal(2);
        });
    });

    it("should create reduced data from \"promisified\" functions and initial value, but being passed static values instead", () => {
        return Promise.fReduce([
            "dumbass",
            retrieveUser,
            retrieveUserPosts,
            (posts, done) => { // only take the posts text
                done(null, posts.map((post) => {
                    return post.text;
                }));
            }
        ]).then((texts) => {
            should.exist(texts);
            texts[0].should.equal("YOLO!!!");
            texts.length.should.equal(2);
        });
    });

    it("should mix promises like a boss", () => {
        return Promise.fReduce([
            retrieveUser,
            retrieveUserPosts,
            (posts, done) => { // only take the posts text
                Promise.reduce([
                    (posts) => { // take only posts texts
                        return Promise.resolve(posts.map((post) => {
                            return post.text;
                        }));
                    },
                    (texts) => { // remove duplicate texts
                        return Promise.resolve(texts.filter((text, index) => {
                            return texts.indexOf(text) == index;
                        }));
                    }
                ], posts).then((texts) => {
                    done(null, texts);
                }).catch(done);
            }
        ], "dumbass").then((texts) => {
            should.exist(texts);
            texts[0].should.equal("YOLO!!!");
            texts.length.should.equal(1);
        });
    });
});
