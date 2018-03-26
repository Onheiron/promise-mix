'use strict';

const PromiseMux = require('../../index').promiseMux;
const chai = require('chai')
    , should = chai.should();

const users = [
    {
        id: 'dumbass',
        name: 'Dumb Ass',
        interests: ['cash', 'TV', 'girls']
    },
    {
        id: 'avgass',
        name: 'Avg Ass',
        interests: ['reading', 'movies', 'girls']
    },
    {
        id: 'smartass',
        name: 'Smart Ass',
        interests: ['reading', 'chess', 'anthropy']
    }
]

const userLocalPosts = [
    {
        author: 'dumbass',
        text: 'YOLO!!!'
    },
    {
        author: 'avgass',
        text: 'Hello world!'
    },
    {
        author: 'smartass',
        text: 'E = mc^2'
    }
]

const userLocalActivities = [
    {
        author: 'dumbass',
        activity: 'Watched TV'
    },
    {
        author: 'avgass',
        text: 'Went to work'
    },
    {
        author: 'smartass',
        activity: 'Wrote poetry'
    }
]

const userRemotePosts = [
    {
        author: 'dumbass',
        text: 'Studied @ Street University'
    },
    {
        author: 'avgass',
        text: 'Looking for a job'
    },
    {
        author: 'smartass',
        text: 'Working on my second PhD'
    }
]

const userRemoteActivities = [
    {
        author: 'dumbass',
        activity: 'Watched more TV'
    },
    {
        author: 'avgass',
        text: 'Hung out with friends'
    },
    {
        author: 'smartass',
        activity: 'Painted a portrait'
    }
]

describe('Test promise explosion', () => {

    it('should handle parallel Promise combinations', () => {
        return PromiseMux.fReduce([
            (init, done) => done(null, init + 1),
            (step1, done) => done(null, step1 * 2),
            (step2, done) => done(null, step2 / 3)
        ], [2, 5, 8]).then((result) => {
            return Promise.resolve(`Result is ${result}`);
        }).deMux((reports) => {
            should.exist(reports);
            reports.length.should.equal(3);
            reports[1].should.equal('Result is 4')
        })
    });

    it('should handle parallel Promise combinations with named streams', () => {
        return PromiseMux.fReduce([
            (init, done) => done(null, init + 1),
            (step1, done) => done(null, step1 * 2),
            (step2, done) => done(null, step2 / 3)
        ], {
                easy: 2,
                normal: 5,
                hard: 8
            }).then((result) => {
                return Promise.resolve(`Result is ${result}`);
            }).deMux((reports) => {
                should.exist(reports);
                should.exist(reports.easy);
                should.exist(reports.normal);
                should.exist(reports.hard);
                reports.normal.should.equal('Result is 4')
            })
    });

    it('should switch from Promise to PromiseMux and back to promise.', () => {
        return Promise.mux(['girls', 'reading'])
            ._combine({ // for each topic, select the users interested in it
                users: ({ _init }) => {
                    should.exist(_init);
                    return Promise.resolve(users.filter((user) => {
                        return user.interests.indexOf(_init) >= 0;
                    }))
                },
                posts: ({ _init, users }) => { // select posts of those users
                    return Promise.mux(users)
                        ._reduce([ // for each interested user, build an array of local and remote posts
                            (user) => {
                                should.exist(user);
                                return Promise.resolve({
                                    user, localPosts: userLocalPosts.filter((post) => {
                                        return post.author == user.id;
                                    })
                                })
                            },
                            ({ user, localPosts }) => {
                                return Promise.resolve(localPosts.concat(userRemotePosts.filter((post) => {
                                    return post.author == user.id;
                                })));
                            }
                        ]).deMux((posts) => { // merge the results, then flatten the array of all posts.
                            return Promise.resolve([].concat.apply([], posts));
                        })
                }
            }).deMux((results) => {
                should.exist(results);
                results.length.should.equal(2);
                should.exist(results[0].posts);
                results[0].posts.length.should.equal(4);
                // now let's merge all posts in a single array
                let allPosts = results[0].posts;
                allPosts = allPosts.concat(results[1].posts);
                return Promise.resolve(allPosts);
            })._mux((mux) => { // handle muxed data
                return mux._reduce([ // for each post
                    (post) => { // retrieve post author
                        return Promise.resolve({
                            user: users.find((user) => {
                                return post.author == user.id;
                            }),
                            post
                        });
                    },
                    ({ user, post }) => { // format post feed
                        return Promise.resolve(`${user.name} said: "${post.text}"`);
                    }
                ]).deMux((feeds) => { // demux and downstream demuxed data
                    return Promise.resolve(feeds);
                })
            })
            .then((feeds) => { // here we have demuxed data.
                feeds.indexOf('Dumb Ass said: "YOLO!!!"').should.equal(0);
                feeds.indexOf('Avg Ass said: "Looking for a job"').should.equal(3);
                feeds.indexOf('Smart Ass said: "Working on my second PhD"').should.equal(7);
            })
    });
});
