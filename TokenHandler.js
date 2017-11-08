const randomstring = require('randomstring');
const mongoose = require('mongoose');
const Token = require('./TokenSchema');

class TokenHandler {

	/**
	 * Create token
	 * @param {Object} options 
	 * @param {Function} cb 
	 */
	static createToken(options, cb) {
		let opt = options;
		let id = this._id ? this._id : this.id;
		if (!('token' in options)) opt.token = randomstring.generate(150);
		if (!('user' in options)) opt.user = id;
		new Token(opt).save(cb);
	}

	/**
	 * FindToken
	 * @param {Object} q query 
	 * @param {Function} cb callback 
	 */
	static findToken(q, cb) {
		Token.find(q, cb);
	}

	/**
	 * Find One Token
	 * @param {Obejct} q query
	 * @param {Function} cb callback
	 */
	static findOneToken(q, cb) {
		Token.findOne(q, cb);
	}

	/**
	 * Remove token
	 * @param {Object} q query
	 * @param {Function} cb callback
	 */
	static removeToken(q, cb) {
		Token.remove(q, cb);
	}

	/**
	 * ValidateToken
	 * @param {object} token TokenObject
	 * @param {Function} cb Callback
	 */
	static validateToken(token, cb) {
		this.findOneToken({ token: token, expires: { $gt: new Date() } }, (err, tokenObj) => {
			if(err) return cb(new Error(err));
			if(!tokenObj) return cb(new Error('Not valid token found!'));
			cb(err, tokenObj);
		});
	}

	/**
	 * Token middleware for express
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} next 
	 */
	static tokenMiddleware(req, res, next) {
		let User = mongoose.model('User');

		if (req.header('authorization')) {
			// If one exists, attempt to get the header data
			let token = req.header('authorization').split('Bearer ')[1];
			// If there's nothing after "Bearer", just redirect to login
			if (!token) return res.status(401).json({ message: 'No bearer' });
			// find token
			Token.findOne({ token: token, expires: { $gt: new Date() } }, (err, tokenObj) => {
				// If there's an error verifying the token (e.g. it's invalid or expired)
				if (err || !tokenObj) return res.status(401).json({ message: 'Invalid or expired' });
				User.findById(tokenObj.user, function (err, user) {
					// Query error
					if (err) return res.status(401).json({ message: 'Query error' });
					// If the user can't be found, redirect to the login page
					if (!user) return res.status(401).json({ message: 'Could not find user' });
					// Otherwise save the user object on the request (i.e. "log in") and continue
					req.user = user;
					return next();
				});
			});
		} else {
			// No authorization header
			return res.status(401).json({ message: 'Authorization header missing!' });
		}
	}

	/**
	 * Get all user's token
	 * @param {*} cb 
	 */
	static getTokens(cb) {
		let id = this._id ? this._id : this.id;
		Token.find({ user: id }, cb);
	}
}

exports.TokenHandler = TokenHandler;