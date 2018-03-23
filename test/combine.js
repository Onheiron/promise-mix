'use strict';
require('../promise-mix');
const chai = require('chai')
    , should = chai.should();

const userPosts = [
    {
        author: 'dumbass',
        text: 'YOLO!!!'
    },
    {
        author: 'smartass',
        text: 'E = mc^2'
    }
]

describe('Test combine function', () => {

    it('should create combined data', () => {
        return Promise.combine({
            user: () => { // select an user
                return Promise.resolve({
                    id: 'dumbass',
                    name: 'Dumb Ass'
                })
            },
            posts: ({ user }) => { // retrieve its posts
                should.exist(user)
                return Promise.resolve(userPosts.filter((item) => {
                    return item.author == user.id;
                }))
            }
        }).then(({ user, posts }) => {
            should.exist(user);
            should.exist(posts);
            user.name.should.equal('Dumb Ass');
            posts[0].text.should.equal('YOLO!!!');
            posts.length.should.equal(1);
        })
    });

    it('should create combined data with initial value', () => {
        return Promise.combine({
            posts: ({ user }) => { // retrieve its posts
                should.exist(user)
                return Promise.resolve(userPosts.filter((item) => {
                    return item.author == user.id;
                }))
            }
        }, {
                user: {
                    id: 'dumbass',
                    name: 'Dumb Ass'
                }
            }).then(({ user, posts }) => {
                should.exist(user);
                should.exist(posts);
                user.name.should.equal('Dumb Ass');
                posts[0].text.should.equal('YOLO!!!');
                posts.length.should.equal(1);
            })
    });

    it('should create combined data from "promisified" functions', () => {
        return Promise.fCombine({
            user: (val, done) => { // select an user
                done(null, {
                    id: 'dumbass',
                    name: 'Dumb Ass'
                });
            },
            posts: ({ user }, done) => { // retrieve its posts
                should.exist(user)
                done(null, userPosts.filter((item) => {
                    return item.author == user.id;
                }));
            }
        }).then(({ user, posts }) => {
            should.exist(user);
            should.exist(posts);
            user.name.should.equal('Dumb Ass');
            posts[0].text.should.equal('YOLO!!!');
            posts.length.should.equal(1);
        })
    });

    it('should create nested combined data', () => {
        return Promise.combine({
            users: () => { // select some user
                return Promise.resolve([
                    {
                        id: 'dumbass',
                        name: 'Dumb Ass'
                    },
                    {
                        id: 'smartass',
                        name: 'Smart Ass'
                    }
                ])
            },
            posts: ({ users }) => { // retrieve all posts for each user
                should.exist(users);
                return Promise.all(users.map((user) => {
                    return Promise.combine({
                        user: () => { return Promise.resolve(user) },
                        posts: ({ user }) => {
                            should.exist(user)
                            return Promise.resolve(userPosts.filter((item) => {
                                return item.author == user.id;
                            }))
                        }
                    })
                }))
            }
        }).then(({ users, posts }) => {
            should.exist(users);
            should.exist(posts);
            users.length.should.equal(2);
            posts.length.should.equal(2);
            should.exist(users[0]);
            should.exist(posts[0]);
            users[0].id.should.equal('dumbass');
            posts[0].user.id.should.equal(users[0].id);
        })
    });
});
