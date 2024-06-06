const jwt = require('jsonwebtoken');
const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const User = require('../models/user');
const catchAsync = require('../util/catchAsyc');
const AppError = require('../util/appError');
const Email = require('../util/email');

const signToken = id => jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
)


const createSendToken = (user, statusCode, res, url) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true
    }
    user.password = undefined;
    user.photo = `${url}${user.photo}`
    res.cookie('jwt', token, cookieOptions).status(statusCode).json({
        status: true,
        token,
        data: {
            user
        },
    })
}
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    }
    else {
        cb(new AppError('Not an image! please upload only images.', 400), false);
    }
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
    req.file.filename = `user-${uniqueSuffix}-photo.jpeg`;

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

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        photo: req.file.filename
    });
    // const newUser = await User.create(req.body);
    const url = `${req.protocol}://${req.get('host')}/public/images/usersProfile/`;
    await new Email(newUser).sendWelcome()
    createSendToken(newUser, 201, res, url);
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
    const url = `${req.protocol}://${req.get('host')}/public/images/usersProfile/`
    createSendToken(user, 200, res, url)
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new AppError('User not found with this email-id', 404))
    }
    const resetToken = await user.createRestToken();
    await user.save({ validateBeforeSave: false });

    try {
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset()

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
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpire: { $gt: Date.now() } });

    if (!user) {
        return next(new AppError('Token is invlaid or has expired', 400))
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined
    user.passwordResetExpire = undefined

    await user.save();
    const url = `${req.protocol}://${req.get('host')}/images/usersProfile`
    createSendToken(user, 200, res, url)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    if (!(user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password  is wrong.', 401))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    const url = `${req.protocol}://${req.get('host')}/images/usersProfile`

    createSendToken(user, 200, res, url);

})