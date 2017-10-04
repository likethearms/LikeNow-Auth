const mongoose = require('mongoose');

exports.getUserSchema = function (schema, options) {
	schema = schema || {};
	if (!('email' in schema)) {
		schema.email = {
			type: String,
			unique: true,
			trim: true,
			required: true
		};
	}

	if (!('password' in schema)) {
		schema.password = {
			type: String,
			required: true,
			trim: true
		};
	}

	return mongoose.Schema(schema, options);
};