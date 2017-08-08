const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/**
 * Get token
 *
 * @returns {String} - User token
 */
exports.getJWTToken = function(secret, options) {
    return jwt.sign({user_id: this.id}, secret, options);
};

/**
 * Check if password match with hash
 *
 * @param {String} plainPassword - Hashed password
 * @return {Boolean}
 */
exports.checkPassword = function(plainPassword){
    return bcrypt.compareSync(plainPassword, this.password);
};

/**
 * Login user with email|password or username|password
 *
 * @param {Object} obj - User object
 * @param {String} obj.password - password
 * @param {String} [obj.email] - email
 * @param {String} [obj.username] - username
 * @param {Function} [loginCallback] - Callback function
 */
exports.logIn = function (obj, loginCallback) {
    let email,username;
    // Missing email and username
    if(!obj.email && !obj.username) return loginCallback(new Error('Require username or email'));
    // Missing password
    if(!obj.password) return loginCallback(new Error('Missing password'));
    // Check search field
    if(obj.email) {
        email = {email: obj.email};
    } else {
        username = {username: obj.username};
    }
    // Find user
    this.findOne((email || username), (err,user) => {
        // Query error
        if(err) return loginCallback(new Error(err.message));
        // Couldn't find user
        if(!user) return loginCallback(new Error('Could not find any user'));
        // Check password
        if(!user.checkPassword(obj.password)) return loginCallback(new Error('Wrong password'));
        // Call callback
        loginCallback(null, user);
    });
};

/**
 * Sign user in
 *
 * @param {Object} obj
 * @param {String} obj.password User's password
 * @param {String} [obj.username] User's username
 * @param {String} [obj.email] User's email
 * @param {Function} callback
 */
exports.signUp = function(obj, callback) {
    // Missing email and username
    if(!obj.email && !obj.username) return callback(new Error('Missing username and email'));
    // Missing password
    if(!obj.password) return callback(new Error('Missing password'));
    // Password BCrypt
    let salt = bcrypt.genSaltSync(10);
    obj.password = bcrypt.hashSync(obj.password, salt);
    // Create user
    new this(obj).save((err,user) => {
        if(err){
            if(err.name === 'MongoError' && err.code === 11000) return callback(new Error('There was a duplicate key error'));
            return callback(new Error(err.message));
        }
        return callback(null, user);
    });
};