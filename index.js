const ext = require('./basic-auth');
const userModel = require('./User');
const token = require('./token-handler');

exports.extendSchema = function (schema) {
    schema.methods.checkPassword = ext.checkPassword;
    schema.statics.logIn = ext.logIn;
    schema.statics.signUp = ext.signUp;

    schema.methods.createToken = token.createToken;
    schema.methods.getTokens = token.getTokens;
    schema.statics.findToken = token.findToken;
    schema.statics.findOneToken = token.findOneToken;
    schema.statics.removeToken = token.removeToken;

    return schema;
};

exports.getExtendedUserSchema = function (schema, options) {
    let UserSchema = userModel.getUserSchema(schema, options);
    return exports.extendSchema(UserSchema);
};

exports.tokenMiddleware = token.tokenMiddleware;