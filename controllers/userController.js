const User = require('../models/user');
const catchAsync = require('../util/catchAsyc');
// const AppError = require('../util/appError');
const factory = require('./handlerFactory')

// const filterObj = (obj, ...allowedFields) => {
//     const newObj = {};
//     Object.keys(obj).forEach(el => {
//         if (allowedFields.includes(el)) { newObj[el] = obj[el] }
//     })
//     return newObj
// }
// Do not update password with this
exports.updateMe = factory.updateOne(User)

exports.deleteMe = factory.deleteOne(User);

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