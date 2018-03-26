'use strict';
require('../../index');
const chai = require('chai')
    , should = chai.should();

describe('Test aggregate function', () => {

    it('should create aggregate data', () => {
        return Promise.aggregate({
            artist: Promise.resolve('Johnny Cash'),
            songs: Promise.resolve(['Walk The Line', 'Ring of Fire', 'Folsom Prison Blues'])
        }).then(({ artist, songs }) => {
            should.exist(artist);
            should.exist(songs);
            artist.should.equal('Johnny Cash');
            songs[0].should.equal('Walk The Line');
            songs.length.should.equal(3);
        })
    });

    it('should create aggregate data with initial value', () => {
        return Promise.aggregate({
            artist: Promise.resolve('Johnny Cash'),
            songs: Promise.resolve(['Walk The Line', 'Ring of Fire', 'Folsom Prison Blues'])
        }, {
                me: 'Your user name'
            }).then(({ me, artist, songs }) => {
                should.exist(me);
                should.exist(artist);
                should.exist(songs);
                me.should.equal('Your user name')
                artist.should.equal('Johnny Cash');
                songs[0].should.equal('Walk The Line');
                songs.length.should.equal(3);
            })
    });

    it('should create aggregate data with non-object initial value', () => {
        return Promise.aggregate({
            artist: Promise.resolve('Johnny Cash'),
            songs: Promise.resolve(['Walk The Line', 'Ring of Fire', 'Folsom Prison Blues'])
        }, 'Your user name').then(({ _init, artist, songs }) => {
            should.exist(_init);
            should.exist(artist);
            should.exist(songs);
            _init.should.equal('Your user name')
            artist.should.equal('Johnny Cash');
            songs[0].should.equal('Walk The Line');
            songs.length.should.equal(3);
        })
    });

    it('should create nested aggregate data', () => {
        return Promise.aggregate({
            artist: Promise.resolve('Johnny Cash'),
            albums: Promise.all([
                Promise.aggregate({
                    title: Promise.resolve('Man in Black'),
                    songs: Promise.resolve(['Look for Me', 'If Not for Love'])
                }),
                Promise.aggregate({
                    title: Promise.resolve('A Thing Called Love'),
                    songs: Promise.resolve(['I Promise You', 'Papa Was a Good Man'])
                })
            ])
        }).then(({ artist, albums }) => {
            should.exist(artist);
            should.exist(albums);
            should.exist(albums[1].title);
            artist.should.equal('Johnny Cash');
            albums[1].title.should.equal('A Thing Called Love');
            albums[1].songs.length.should.equal(2);
        })
    });
});
