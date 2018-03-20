const chai = require('chai');
const expect = chai.expect;
const likeNowAuth = require('../index');
const TokenHandler = likeNowAuth.TokenHandler;
const chaiHttp = require('chai-http');
const express = require('express');
const app = express();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test');

let User;

let UserSchema =  likeNowAuth.getExtendedUserSchema();
if (mongoose.models.User) {
	User = mongoose.model('User');
} else {
	User = mongoose.model('User', UserSchema);
}

chai.use(chaiHttp);

app.get('/', function (req, res) {
	res.send('Hello World!');
});

app.get('/secret', TokenHandler.tokenMiddleware, function (req, res) {
	return res.json('Hello World!')
});

app.listen(3131, function () {
	console.log('Example app listening on port 3000!');
});

describe('middleware test', () => {
	let user, token;

	before(done => {
		User.remove({}, () => {
			TokenHandler.removeToken({}, () => {
				User.signUp({ email: 'test@user.fi', password: 'password' }, (err, u) => {
					user = u;
					u.createToken({}, (err, t) => {
						token = t.token;
						done();
					});
				});
			})
		});
	});

	it('should run server', done => {
		chai.request(app).get('/').end((err, res) => {
			expect(res).to.have.status(200);
			done();
		});
	});

	it('should protect route from anonymous users', done => {
		chai.request(app).get('/secret').end((err, res) => {
			expect(res).to.have.status(401);
			done();
		});
	});

	it('should protect route from wrong token', done => {
		chai.request(app).get('/secret').set('Authorization', 'Bearer ' + token + 'a').end((err, res) => {
			expect(res).to.have.status(401);
			done();
		});
	});

	it('should continue request if token is valid', done => {
		chai.request(app).get('/secret').set('Authorization', 'Bearer ' + token).end((err, res) => {
			expect(res).to.have.status(200);
			done();
		});
	});
});
