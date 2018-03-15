const chai = require('chai');
const expect = chai.expect;
const likenowauth = require('../index');
const lnaUser = likenowauth.UserSchema;
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test');

let User;

let UserSchema = likenowauth.getExtendedUserSchema();
if (mongoose.models.User) {
	User = mongoose.model('User');
} else {
	User = mongoose.model('User', UserSchema);
}


describe('basic-auth', () => {
	let getUserObject = () => {
		return {
			email: 'test@user.fi',
			password: 'password'
		};
	};

	describe('#signUp', () => {
		beforeEach(done => {
			User.remove({}, () => {
				done();
			});
		});

		it('should save user in database', done => {
			User.signUp(getUserObject(), (err, user) => {
				expect(user).to.not.be.empty;
				done();
			});
		});

		it('should crypt password', done => {
			User.signUp(getUserObject(), (err, user) => {
				expect(user.password).to.not.equal(getUserObject().password);
				done();
			});
		});

		it('should return an error if object missing password', done => {
			let userObj = getUserObject();
			delete userObj.password;
			User.signUp(userObj, (err, user) => {
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
			User.signUp(userObj, (err, user) => {
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
			User.signUp({}, (err, user) => {
				expect(err).to.be.instanceOf(Error);
				expect(err.message).to.equal('Missing username and email');
				expect(user).to.be.undefined;
				done();
			});
		});

		it('should return error if email already exists', done => {
			let userObj = getUserObject();
			delete userObj.username;
			User.signUp(userObj, (err, user) => {
				User.signUp(userObj, (err, user) => {
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
			User.remove({}, () => {
				User.signUp(getUserObject(), (err, u) => {
					if (err) console.log(err);
					done();
				});
			});
		});

		it('should return user object if success', done => {
			User.logIn(getUserObject(), (err, user) => {
				expect(user).to.have.property('email');
				done();
			});
		});

		it('should return error if missing the password', done => {
			let customUser = getUserObject();
			delete customUser.password;
			User.logIn(customUser, (err, user) => {
				expect(err).to.be.instanceOf(Error);
				expect(err.message).to.be.eql('Missing password');
				done();
			});
		});

		it('should return error if missing the email and username', done => {
			let customUser = getUserObject();
			delete customUser.email;
			delete customUser.username;
			User.logIn(customUser, (err, user) => {
				expect(err).to.be.instanceOf(Error);
				expect(err.message).to.be.eql('Require username or email');
				done();
			});
		});

		it('should return error if user not found', done => {
			let customUser = getUserObject();
			delete customUser.username;
			customUser.email = 'wrong@user.com';
			User.logIn(customUser, (err, user) => {
				expect(err).to.be.instanceOf(Error);
				expect(err.message).to.be.eql('Could not find any user');
				done();
			});
		});

		it('should return error if password not match', done => {
			let customUser = getUserObject();
			delete customUser.username;
			customUser.password = 'wrongPassword';
			User.logIn(customUser, (err, user) => {
				expect(err).to.be.instanceOf(Error);
				expect(err.message).to.be.eql('Wrong password');
				done();
			});
		});
	});

	describe('#checkPassword', () => {
		let user;

		before(done => {
			User.remove({}, () => {
				User.signUp(getUserObject(), (err, u) => {
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
			User.remove({}, () => {
				done();
			});
		});

		it('should run callback without errors if everything is ok', done => {
			User.validateUser(getUserObject(), (err) => {
				expect(err).to.be.null;
				done();
			});
		});

		it('should throw error if missing values', done => {
			User.validateUser({ email: 'test@user.com' }, (err) => {
				expect(err).to.not.be.null;
				done();
			});
		});
	});
});