const User = require('./User');
const bcrypt = require('bcrypt');
const TokenHandle = require('./TokenHandler');

module.exports = class ExtendedUserSchema {
	constructor(schema, options) {
		this.UserSchema = User.getUserSchema(schema, options);
	}
	
	getExtendedUserSchema() {
		return ExtendedUserSchema.extendSchema(this.UserSchema);
	}

	static extendSchema(schema) {
		schema.statics.logIn = this.logIn;
		schema.statics.signUp = this.signUp;
		schema.statics.validateUser = this.validateUser;
		schema.methods.checkPassword = this.checkPassword;
		schema.methods.getTokens = TokenHandle.getTokens;
		schema.methods.createToken = TokenHandle.createToken;
		return schema;
	}

	static checkPassword(plainPassword) {
		return bcrypt.compareSync(plainPassword, this.password);
	}

	static logIn(obj, loginCallback) {
		let email, username;
		// Missing email and username
		if (!obj.email && !obj.username) return loginCallback(new Error('Require username or email'));
		// Missing password
		if (!obj.password) return loginCallback(new Error('Missing password'));
		// Check search field
		if (obj.email) {
			email = { email: obj.email };
		} else {
			username = { username: obj.username };
		}
		// Find user
		this.findOne((email || username), (err, user) => {
			// Query error
			if (err) return loginCallback(new Error(err.message));
			// Couldn't find user
			if (!user) return loginCallback(new Error('Could not find any user'));
			// Check password
			if (!user.checkPassword(obj.password)) return loginCallback(new Error('Wrong password'));
			// Call callback
			loginCallback(null, user);
		});
	}

	static signUp(obj, callback) {
		let that = this;
		ExtendedUserSchema.validateUser(obj, function (err) {
			if (err) return callback(new Error(err.message));
			// Password BCrypt
			let salt = bcrypt.genSaltSync(10);
			obj.password = bcrypt.hashSync(obj.password, salt);
			// Create user
			new that(obj).save((err, user) => {
				if (err) {
					if (err.name === 'MongoError' && err.code === 11000) return callback(new Error('There was a duplicate key error'));
					return callback(new Error(err.message));
				}
				return callback(null, user);
			});
		});
	}

	static validateUser(obj, callback) {
		// Missing email and username
		if (!obj.email && !obj.username) return callback(new Error('Missing username and email'));
		// Missing password
		if (!obj.password) return callback(new Error('Missing password'));
		callback(null);
	}
};