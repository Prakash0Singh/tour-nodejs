const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('../util/catchAsyc');
const AppError = require('../util/appError');
const User = require('../models/user')

exports.verifyAuth = catchAsync(async (req, res, next) => {

    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('Unauthorized access', 401))
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    const freshUser = await User.findById(decoded.id);
    if (!freshUser) { return next(new AppError('Token belong to user does not exits', 401)) }

    // if (freshUser.changePasswordAfter(decoded.iat)) {
    //     return next(new AppError('User recently changed password', 401))
    // }
    req.user = freshUser;
    next();
})

exports.restrictTo = (...roles) => (req, res, next) => {
    console.log(req.user.role)
    if (!roles.includes(req.user.role)) {
        return next(new AppError('You do not have permission to perform this action ', 403))
    }
    next()
} 