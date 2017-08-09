const chai = require('chai');
const expect = chai.expect;
const likenowauth = require('../index');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test', {useMongoClient: true});

let User;
let UserSchema = likenowauth.getExtendedUserSchema();
if (mongoose.models.User) {
    User = mongoose.model('User');
} else {
    User = mongoose.model('User', UserSchema);
}

describe('token handler', () => {
    let user;
    let getUserData = () => {
        return {
            email: 'henrik.salmela@gmail.com',
            password: 'password'
        }
    };

    beforeEach(done => {
        User.remove({}, () => {
            User.removeToken({}, () => {
                User.signUp(getUserData(), (err,u)=> {
                    if(err) console.log(err.message);
                    user = u;
                    done();
                });
            });
        });
    });

    describe('#createToken', () => {
        it('should return token', done => {
            user.createToken({},(err,token) => {
                expect(token.token).to.to.length(150);
                done();
            });
        });

        it('should store token', done => {
            user.createToken({},(err) => {
                User.findOneToken({},(err,t) => {
                    expect(t).to.have.property('token');
                    done();
                });
            });
        });

        it('it should store options', done => {
            user.createToken({
                os: 'linux',
                fingerprint: 'fing',
                browser: 'chrome',
                device: 'android'
            },(err) => {
                User.findOneToken({},(err,t) => {
                    expect(t).to.have.property('os');
                    expect(t).to.have.property('fingerprint');
                    expect(t).to.have.property('browser');
                    expect(t).to.have.property('device');
                    done();
                });
            });
        });
    });

    describe('#getTokens', () => {
        it('should return all users tokens', done => {
            User.removeToken({}, () => {
                user.createToken({}, () => {
                    user.createToken({}, () => {
                        user.getTokens((err,tokens) => {
                            expect(tokens).to.be.length(2);
                            done();
                        });
                    });      
                });
            })
        });
    });
});