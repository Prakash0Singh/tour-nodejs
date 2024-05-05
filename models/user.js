const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const user = new Schema({
    name: {
        type: String,
        required: [true, 'Please provide name '],
        trim: true,
        validator: validator.isAlpha,
    },
    images: {
        type: String,
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        trim: true,
        unique: true,
        lowercase: true,
        validator: [validator.isEmail, 'Please provide a valid email'],
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
        select: false
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please provide confirm password'],
        minlength: 8,
        validate: {
            validator: function (e) {
                return e === this.password
            },
            message: 'password and confirm password are not matching'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpire: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

user.pre('save', async function (next) {
    //only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    // deleteing passwordConfirm key 
    this.passwordConfirm = undefined;
    next();
})

user.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next()
})

user.pre(/^find/, async function (next) {
    this.find({ active: { $ne: false } });
    next()
})

user.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

user.methods.changePasswordAfter = async function (jwtTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        return jwtTimestamp < changedTimestamp
    }
    return false;
}

user.methods.createRestToken = async function () {
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpire = Date.now() + 10 * 60 * 100;
    return resetToken;
}

const Users = mongoose.model('users', user);

module.exports = Users 