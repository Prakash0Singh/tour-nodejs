const { body } = require('express-validator');
const User = require('../models/user');

exports.signupValidator = [
    body('name').trim().isString(),
    body('email').isEmail().withMessage('Please enter valid e-mail id').normalizeEmail().custom((value, { req }) => {
        return User.findOne({ email: value })
            .then(userDoc => {
                if (userDoc) { return Promise.reject('E-mail exists already, please pick different one.') }
            })
    }),
    body('password', 'The minimum password length is 6 characters').isLength({ min: 6 }).trim(),
    body('confirm_password').trim().custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Create and Confirm Password does not match!')
        }
        return true
    })
]

exports.loginValidator = [
    body('email').isEmail().withMessage('please enter Valid e-mail id').normalizeEmail(),
    body('password', 'The minimum password length is 6 characters').isLength({ min: 6 }).trim(),
]