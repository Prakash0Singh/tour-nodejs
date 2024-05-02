const jwt = require('jsonwebtoken');
const User = require('../models/user');
const catchAsync = require('../util/catchAsyc');
const AppError = require('../util/appError');
const SendEmail = require('../util/email');

const signToken = id => jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
)

exports.signup = catchAsync(async (req, res, next) => {
    // const newUser = await User.create({
    //     name: req.body.name,
    //     email: req.body.email,
    //     password: req.body.password,
    //     passwordConfirm: req.body.passwordConfirm
    // });
    const newUser = await User.create(req.body)

    const token = signToken(newUser._id)

    res.status(201).json({
        status: true,
        token,
        data: {
            user: newUser
        },
        message: 'User created successfully',
    })
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('please provide email and password', 400))
    }
    const user = await User.findOne({ email }).select('+password');

    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('incorrect email or password', 401));
    }

    const token = signToken(user._id)
    res.status(200).json({
        status: true,
        token,
        message: 'user successfully login.'
    })

});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new AppError('User not found with this email-id', 404))
    }
    const resetToken = user.createRestToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;

    const message = `Forgot your password? Submit a request with your new password to ${resetURL}.\n If you didn't forget your password ,please ignore this eamil!`

    try {
        await SendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min.)',
            message,

        });
        res.status(200).json({
            status: true,
            message: 'token send to email'
        })

    }
    catch (error) {
        user.passwordResetToken = undefined
        user.passwordResetExpire = undefined
        await user.save({ validateBeforeSave: false });
        return next(new AppError('There was error sending the email. Try again  later', 500))
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {

})