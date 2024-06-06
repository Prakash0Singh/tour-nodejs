const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs')
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
        .toFile(`public/images/usersProfile/${req.file.filename}`);

    next()
})

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates.', 400))
    }
    const filterBody = filterObj(req.body, 'name', 'email');
    if (req.file) {
        const profilePath = path.join(__dirname, `../public/images/usersProfile/${req.user.photo}`)
        await fs.unlinkSync(profilePath);
        filterBody.photo = req.file.filename;
    }

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

exports.getUser = catchAsync(async (req, res, next) => {

    const query = User.findById(req.user.id);

    const user = await query

    if (!user) {
        return next(new AppError('No document found with that ID', 404))
    }

    const baseUrl = `${req.protocol}://${req.get('host')}/public/images/usersProfile/`;
    user.photo = baseUrl + user.photo;
    res.status(200).json(
        {
            status: true,
            data: {
                data: user
            },
            message: 'successfully get document'
        });

})

exports.getAllUsers = factory.getAll(User);