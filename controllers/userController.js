const User = require('../models/user');
const catchAsync = require('../util/catchAsyc');
const AppError = require('../util/appError');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) { newObj[el] = obj[el] }
    })
    return newObj
}

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates.', 400))
    }
    const filterBody = filterObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, { new: true, runValidators: true });

    res.status(200).json({
        status: true,
        data: {
            user: updatedUser
        }
    })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })

    res.status(204).json({
        status: true,
        message: 'user deleted successfully !!'
    })
})

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const user = await User.find()

    res.status(200).json({
        status: true,
        results: user.length,
        data: {
            user
        },
        message: "successfully fetch all users"
    })
})