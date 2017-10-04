const t = require('./TokenHandler');
const e = require('./ExtendedUserSchema');
const ts = require('./TokenSchema');

exports.ExtendedUserSchema = e;
exports.TokenHandler = t;
exports.TokenSchema = ts;
exports.getExtendedUserSchema = (schema,options) => {
	return new e(schema,options).getExtendedUserSchema();
};