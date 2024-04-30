const jwt = require('jsonwebtoken');
const User = require('../models/user');
const catchAsync = require('../util/catchAsyc');
const AppError = require('../util/appError');

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