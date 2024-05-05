const path = require('path');
const morgan = require('morgan');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const AppError = require('./util/appError')
const tourRoutes = require('./routes/tour');
const userRouted = require('./routes/user');
const globalErrorHandler = require('./middleware/error')
const { getAllUsers } = require('./controllers/userController')
const { verifyAuth } = require('./middleware/verify_auth')
const { limiter } = require('./middleware/rateLimiter')

const app = express();
app.use(cors());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
}

// Global Middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/api', limiter);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ storage: storage, fileFilter: fileFilter }).single('image'));
app.use((error, req, res, next) => {
    res.status(500).json({ status: false, message: error })
})

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRouted);
app.use('/api/v1/users', verifyAuth, getAllUsers)
app.all('*', (req, res, next) => {
    next(new AppError(`can't find ${req.originalUrl} on this server !`, 404));
})

app.use(globalErrorHandler)

module.exports = app;

