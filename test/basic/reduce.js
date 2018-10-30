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
    const user = users.find(user => user.id == id);
    if (user) done(null, user);
    else done("No user found");
};

const retrieveUserPosts = (user, done) => {
    const posts = userPosts.filter(post => post.author == user.id);
    if (posts) done(null, posts);
    else done("No posts found");
};

describe("Test reduce function", () => {

    it("should create reduced data", () => Promise.reduce([
        () => Promise.resolve({
            id: "dumbass",
            name: "Dumb Ass"
        }),
        user => Promise.resolve(userPosts.filter(post => post.author == user.id)),
        posts => Promise.resolve(posts.map(post => post.text))
    ]).then(texts => {
        should.exist(texts);
        texts[0].should.equal("YOLO!!!");
        texts.length.should.equal(2);
    }));

    it("should auto-throw Errors.", () => Promise.reduce([
        () => Promise.resolve({
            id: "dumbass",
            name: "Dumb Ass"
        }),
        user => Promise.resolve(userPosts.filter(post => post.author == user.id)),
        new Error('No Posts')
    ]).catch(err => {
        should.exist(err);
        err.message.should.equal('No Posts');
    }));

    it("should create reduced data from functions returning static values.", () => Promise.reduce([
        () => { // select a user
            return {
                id: "dumbass",
                name: "Dumb Ass"
            };
        },
        user => Promise.resolve(userPosts.filter(post => post.author == user.id)),
        posts => Promise.resolve(posts.map(post => post.text))
    ]).then(texts => {
        should.exist(texts);
        texts[0].should.equal("YOLO!!!");
        texts.length.should.equal(2);
    }));

    it("should create reduced data from static values.", () => Promise.reduce([
        {
            id: "dumbass",
            name: "Dumb Ass"
        },
        user => Promise.resolve(userPosts.filter(post => post.author == user.id)),
        posts => Promise.resolve(posts.map(post => post.text))
    ]).then(texts => {
        should.exist(texts);
        texts[0].should.equal("YOLO!!!");
        texts.length.should.equal(2);
    }));

    it("should create reduced data from \"promisified\" functions and initial value", () => Promise.fReduce([
        retrieveUser,
        retrieveUserPosts,
        (posts, done) => done(null, posts.map(post => post.text))
    ], "dumbass").then(texts => {
        should.exist(texts);
        texts[0].should.equal("YOLO!!!");
        texts.length.should.equal(2);
    }));

    it("should auto-throw Errors.", () => Promise.fReduce([
        retrieveUser,
        retrieveUserPosts,
        new Error('No Posts')
    ], "dumbass").catch(err => {
        should.exist(err);
        err.message.should.equal('No Posts');
    }));

    it("should create reduced data from \"promisified\" functions and initial value, but being passed static values instead", () => Promise.fReduce([
        "dumbass",
        retrieveUser,
        retrieveUserPosts,
        (posts, done) => { // only take the posts text
            done(null, posts.map(post => post.text));
        }
    ]).then(texts => {
        should.exist(texts);
        texts[0].should.equal("YOLO!!!");
        texts.length.should.equal(2);
    }));

    it("should mix promises like a boss", () => Promise.fReduce([
        retrieveUser,
        retrieveUserPosts,
        (posts, done) => Promise.reduce([
            posts => Promise.resolve(posts.map(post => post.text)),
            texts => Promise.resolve(texts.filter((text, index) => texts.indexOf(text) == index))
        ], posts).then(texts => done(null, texts))
            .catch(done)
    ], "dumbass").then(texts => {
        should.exist(texts);
        texts[0].should.equal("YOLO!!!");
        texts.length.should.equal(1);
    }));
});
