const mongoose = require('mongoose');
const ext = require('./basic-auth');

exports.getUserSchema = function (schema, options) {
    schema = schema || {};
    if(!('email' in schema)){
        schema.email = {
            type: String,
                unique: true,
                trim: true,
                required: true
        }
    }

    if(!('password' in schema)){
        schema.password = {
            type: String,
            required: true,
            trim: true
        }
    }

    return mongoose.Schema(schema, options);
};

exports.extendSchema = function (schema) {
    schema.methods.checkPassword = ext.checkPassword;
    schema.statics.logIn = ext.logIn;
    schema.statics.signUp = ext.signUp;
    return schema;
};

exports.getExtendedUserSchema = function (schema, options) {
    let UserSchema = exports.getUserSchema(schema, options);
    return exports.extendSchema(UserSchema);
};