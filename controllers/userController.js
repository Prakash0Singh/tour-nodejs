const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const catchAsync = require('../util/catchAsyc');
const AppError = require('../util/appError');
const factory = require('./handlerFactory');

// const filterObj = (obj, ...allowedFields) => {
//     const newObj = {};
//     Object.keys(obj).forEach(el => {
//         if (allowedFields.includes(el)) { newObj[el] = obj[el] }
//     })
//     return newObj
// }

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'images/usersProfile');
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
//         cb(null, `user-${req.user.id}-${uniqueSuffix}-${file.originalname}`);
//     }
// });

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    }
    else {
        cb(new AppError('Not an image! please upload only images.', 400), false);
    }
}

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) { newObj[el] = obj[el] }
    })
    return newObj
}

exports.uploadUserPhoto = multer({ storage: storage, fileFilter: fileFilter }).single('photo')
// Do not update password with this
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    req.file.filename = `user-${req.user.id}-${uniqueSuffix}-photo.jpeg`;

    await sharp(req.file.buffer)
        .resize({
            width: 500,
            height: 500,
            fit: 'fill',
            position: 'centre'
        })
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`images/usersProfile/${req.file.filename}`);

    next()
})

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates.', 400))
    }
    const filterBody = filterObj(req.body, 'name', 'email');
    if (req.file) filterBody.photo = req.file.filename
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, { new: true, runValidators: true });

    res.status(200).json({
        status: true,
        data: {
            user: updatedUser
        }
    })
})

exports.createUser = factory.createOne(User);

exports.deleteMe = factory.deleteOne(User);

exports.getUser = factory.getOne(User);

exports.getAllUsers = factory.getAll(User);