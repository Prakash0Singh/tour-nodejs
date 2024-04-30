const AppError = require('../util/appError');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}:${err.value}.`
    return new AppError(message, 400)
}

const handleDuplicateFieldDB = (err) => {
    const value = err.keyValue?.title;
    const message = `Duplicate Field value : ${value} Please use another value !`;
    return new AppError(message, 400)
}

const validationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message)
    // const message = `Duplicate Field value : ${errors.join('.')} Please use another value !`;
    const message = `${errors[0]} `;
    return new AppError(message, 400)
}
const handleJWTError = () => new AppError('Invalid token please login again', 401);

const handleJWTExpired = () => new AppError('Token Expired please login again', 401);

const sendErrorDev = (err, res) => {

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err
    })
}

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    }
    else {
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong !!!'
        })
    }
}

module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || false;
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res)

    }
    else if (process.env.NODE_ENV === 'production') {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        let error = err;
        if (error.name === 'CastError') { error = handleCastErrorDB(error); }
        if (error.code === 11000) { error = handleDuplicateFieldDB(error); }
        if (error.name === 'ValidationError') { error = validationErrorDB(error); }
        if (error.name === 'JsonWebTokenError') { error = handleJWTError(); }
        if (error.name === 'TokenExpiredError') { error = handleJWTExpired(); }

        sendErrorProd(error, res)
    }

}