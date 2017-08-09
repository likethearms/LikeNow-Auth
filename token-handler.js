const randomstring = require('randomstring');
const userModel = require('./User');
const mongoose = require('mongoose');

let UserSchema = userModel.getUserSchema();

let Token;
let TokenSchema = mongoose.Schema({
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    token: {
        type: String,
        length: 150
    },
    expires: {
        type: Date,
        default: new Date(+new Date() + 604800000)
    },
    name: String,
    os: String,
    browser: String,
    fingerprint: String,
    device: String,
}, {timestamps: true});

Token = mongoose.model('AuthorizationToken', TokenSchema);

exports.createToken = function(options,cb){
    let opt = options;
    let id = this._id ? this._id : this.id;
    if(!('token' in options))opt.token = randomstring.generate(150);
    if(!('user' in options)) opt.user = id;
    new Token(opt).save(cb);
};

exports.findToken = function (query,cb) {
    Token.find(query, cb);
};

const findOneToken = function (query,cb) {
    Token.findOne(query,cb);
};
exports.findOneToken = findOneToken;

exports.removeToken = function (query, cb) {
    Token.remove(query,cb);
};

exports.tokenMiddleware = function (req, res, next) {
    let User = mongoose.model('User');

    if (req.header('authorization')) {
        // If one exists, attempt to get the header data
        let token = req.header('authorization').split('Bearer ')[1];
        // If there's nothing after "Bearer", just redirect to login
        if (!token) return res.status(401).json({message: "No bearer"});
        // find token
        findOneToken({token: token, expires: {$gt: new Date()}}, (err,tokenObj) => {
            // If there's an error verifying the token (e.g. it's invalid or expired)
            if (err || !tokenObj) return res.status(401).json({message: "Invalid or expired"});
            User.findById(tokenObj.user,function (err,user) {
                // Query error
                if (err) return res.status(401).json({message: "Query error"});
                // If the user can't be found, redirect to the login page
                if (!user) return res.status(401).json({message: "Could not find user"});
                // Otherwise save the user object on the request (i.e. "log in") and continue
                req.user = user;
                return next();
            });
        });
    } else {
        // No authorization header
        return res.status(401).json({message: "Authorization header missing!"});
    }
};

exports.getTokens = function(cb){
    let id = this._id ? this._id : this.id;
    Token.find({user: id}, cb);
}