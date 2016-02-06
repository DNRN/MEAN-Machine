var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
    name: String,
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true, select: false },
});

// Hash the password before the user is saved
UserSchema.pre('save', function(next) {
    var user = this;

    // Only hash the password if password has been changed
    if (!user.isModified('password')) return next();

    // Generate hash
    bcrypt.hash(user.password, null, null, (err, hash) => {
        if (err) return next(err);
        user.password = hash;
        next();
    });
});

// Method to compare a given password with the model
UserSchema.methods.comparePassword = function(password) {
    var user = this;

    return bcrypt.compareSync(password, user.password);
};

// return the model
module.exports = mongoose.model('User', UserSchema);