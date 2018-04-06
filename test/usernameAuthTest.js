const chai = require('chai');
const expect = chai.expect;
const likenowauth = require('../index');
const mongoose = require('mongoose');
const testSchema = require('./usernameTestSchema');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test');

let UserModel;

let UserSchema = likenowauth.getExtendedUserSchema(testSchema);

if (mongoose.models.UserModel) {
	UserModel = mongoose.model('UserModel');
} else {
	UserModel = mongoose.model('UserModel', UserSchema);
}


describe('Username basic auth', () => {
	let getUserObject = () => {
		return {
			username: 'testUserName',
			password: 'password'
		};
	};

	describe('#signUp', () => {
		beforeEach(done => {
			UserModel.remove({}, () => {
				done();
			});
		});

		it('should save user in database', done => {
			UserModel.signUp(getUserObject(), (err, user) => {
				expect(user).to.not.be.empty;
				done();
			});
		});


		it('should crypt password', done => {
			UserModel.signUp(getUserObject(), (err, user) => {
				expect(user.password).to.not.equal(getUserObject().password);
				done();
			});
		});

		it('should return an error if object missing password', done => {
			let userObj = getUserObject();
			delete userObj.password;
			UserModel.signUp(userObj, (err, user) => {
				expect(err).to.be.instanceOf(Error);
				expect(err).to.have.property('message', 'Missing password!');
				expect(user).to.be.undefined;
				done();
			});
		});

		it('should return error if object missing username AND email', done => {
			let userObj = getUserObject();
			delete userObj.email;
			delete userObj.username;
			UserModel.signUp(userObj, (err, user) => {
				expect(err).to.be.instanceOf(Error);
				expect(err.message).to.equal('Missing username and email');
				expect(user).to.be.undefined;
				done();
			});
		});

		it('should return error if object missing username AND email', done => {
			let userObj = getUserObject();
			delete userObj.email;
			delete userObj.username;
			UserModel.signUp({}, (err, user) => {
				expect(err).to.be.instanceOf(Error);
				expect(err.message).to.equal('Missing username and email');
				expect(user).to.be.undefined;
				done();
			});
		});

		it('should return error if username already exists', done => {
			let userObj = getUserObject();
			UserModel.signUp(userObj, () => {
				UserModel.signUp(userObj, (err, user) => {
					expect(err).to.be.instanceOf(Error);
					expect(err.message).to.equal('Username or Email is already in db');
					expect(user).to.be.undefined;
					done();
				});
			});
		});
	});

	describe('#logIn', () => {
		before(done => {
			UserModel.remove({}, () => {
				UserModel.signUp(getUserObject(), (err, u) => {
					if (err) console.log(err);
					done();
				});
			});
		});

		it('should return user object if success', done => {
			UserModel.logIn(getUserObject(), (err, user) => {
				expect(user).to.have.property('username');
				done();
			});
		});

		it('should return error if missing the password', done => {
			let customUser = getUserObject();
			delete customUser.password;
			UserModel.logIn(customUser, (err, user) => {
				expect(err).to.be.instanceOf(Error);
				expect(err.message).to.be.eql('Missing password');
				done();
			});
		});

		it('should return error if missing the email and username', done => {
			let customUser = getUserObject();
			delete customUser.email;
			delete customUser.username;
			UserModel.logIn(customUser, (err, user) => {
				expect(err).to.be.instanceOf(Error);
				expect(err.message).to.be.eql('Require username or email');
				done();
			});
		});

		it('should return error if user not found', done => {
			let customUser = getUserObject();
			delete customUser.username;
			customUser.email = 'wrong@user.com';
			UserModel.logIn(customUser, (err, user) => {
				expect(err).to.be.instanceOf(Error);
				expect(err.message).to.be.eql('Could not find any user');
				done();
			});
		});

		it('should return error if password not match', done => {
			let customUser = getUserObject();
			customUser.password = 'wrongPassword';
			UserModel.logIn(customUser, (err, user) => {
				expect(err).to.be.instanceOf(Error);
				expect(err.message).to.be.eql('Wrong password');
				done();
			});
		});
	});

	describe('#checkPassword', () => {
		let user;

		before(done => {
			UserModel.remove({}, () => {
				UserModel.signUp(getUserObject(), (err, u) => {
					if (err) console.log(err);
					user = u;
					done();
				});
			});
		});

		it('should return true if passwords match', () => {
			let plainPassword = getUserObject().password;
			expect(user.checkPassword(plainPassword)).to.be.true;
		});

		it('should NOT return true if passwords not', () => {
			let wrongPassword = 'wrongpassword';
			expect(user.checkPassword(wrongPassword)).to.be.false;
		});
	});

	describe('#validateUser', () => {
		beforeEach(done => {
			UserModel.remove({}, () => {
				done();
			});
		});

		it('should run callback without errors if everything is ok', done => {
			UserModel.validateUser(getUserObject(), (err) => {
				expect(err).to.be.null;
				done();
			});
		});

		it('should throw error if missing values', done => {
			UserModel.validateUser({ email: 'test@user.com' }, (err) => {
				expect(err).to.not.be.null;
				done();
			});
		});
	});
});