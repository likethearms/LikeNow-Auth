const { ExtendedUserSchema } = require('./ExtendedUserSchema');
const { TokenHandler } = require('./TokenHandler');
const ts = require('./TokenSchema');

exports.ExtendedUserSchema = ExtendedUserSchema;
exports.TokenHandler = TokenHandler;
exports.TokenSchema = ts;
exports.getExtendedUserSchema = (schema, options) => {
	return new ExtendedUserSchema(schema, options).getExtendedUserSchema();
};