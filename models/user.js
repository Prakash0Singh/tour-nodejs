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
    passwordChangedAt: Date
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

user.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

user.method.changePasswordAfter = async function (JWT_Timestamp) {
    if (this.passwordChangedAt) {
        console.log(this.passwordChangedAt, JWT_Timestamp)
    }
    return false;
}

const Users = mongoose.model('users', user);

module.exports = Users 