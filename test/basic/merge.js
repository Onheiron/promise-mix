"use strict";
require("../../index");
const chai = require("chai")
    , should = chai.should();

const userLocalPosts = [
    {
        author: "dumbass",
        text: "YOLO!!!"
    },
    {
        author: "smartass",
        text: "E = mc^2"
    }
];

const userLocalActivities = [
    {
        author: "dumbass",
        activity: "Watched TV"
    },
    {
        author: "smartass",
        activity: "Wrote poetry"
    }
];

const userRemotePosts = [
    {
        author: "dumbass",
        text: "Studied @ Street University"
    },
    {
        author: "smartass",
        text: "Working on my second PhD"
    }
];

const userRemoteActivities = [
    {
        author: "dumbass",
        activity: "Watched more TV"
    },
    {
        author: "smartass",
        activity: "Painted a portrait"
    }
];

describe("Test merge function", () => {

    it("should create merged data", () => Promise.merge([
        Promise.resolve(userLocalPosts),
        Promise.resolve(userRemotePosts[0])
    ]).then(posts => {
        should.exist(posts);
        posts[0].text.should.equal("YOLO!!!");
        posts.length.should.equal(3);
    }));

    it("should create merged data from static values", () => Promise.merge([userLocalPosts, userRemotePosts
    ]).then(posts => {
        should.exist(posts);
        posts[0].text.should.equal("YOLO!!!");
        posts.length.should.equal(4);
    }));

    it("should auto-throw Errors.", () => Promise.merge([
        userLocalPosts,
        userRemotePosts,
        new Error('No Posts')
    ]).catch(err => {
        should.exist(err);
        err.message.should.equal('No Posts');
    }));

    it("should create merged data with initial value", () => Promise.merge([
        Promise.resolve(userLocalPosts),
        Promise.resolve(userRemotePosts)
    ], {
            text: "E = mc^2"
        }).then(posts => {
            should.exist(posts);
            posts[0].text.should.equal("E = mc^2");
            posts.length.should.equal(5);
        })
    );

    it("should create nested merged data", () => Promise.merge([
        Promise.merge([
            Promise.resolve(userLocalPosts),
            Promise.resolve(userRemotePosts)
        ]),
        Promise.merge([
            Promise.resolve(userLocalActivities),
            Promise.resolve(userRemoteActivities)
        ])
    ]).then(data => {
        should.exist(data);
        data.length.should.equal(8);
        data[0].text.should.equal("YOLO!!!");
    }));
});
