const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('../util/catchAsyc');
const AppError = require('../util/appError');
const User = require('../models/user')

module.exports = catchAsync(async (req, res, next) => {

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
    freshUser.changePasswordAfter(decoded.iat);
    next();
})