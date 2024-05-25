const path = require('path');
const morgan = require('morgan');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const xss = require('xss-clean')
const mongoSanitize = require('express-mongo-sanitize')
const hpp = require('hpp');
const AppError = require('./util/appError')
const tourRoutes = require('./routes/tour');
const userRouted = require('./routes/user');
const reviewRouted = require('./routes/reviewRoute');
const bookingRoute = require('./routes/bookingRoute');
const globalErrorHandler = require('./middleware/error')
const { limiter } = require('./middleware/rateLimiter')

const app = express();
app.use(cors());


// Security HTTP 
app.use(helmet());
// Global Middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
// Limit request
app.use('/api', limiter);

// Body Parser
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data Sanitization using xss-cleaner
app.use(xss());
app.use(hpp({
    whitelist: ['duration']
}));

// For image uploads
// app.use(multer({ storage: storage, fileFilter: fileFilter }).single('image'));
app.use((error, req, res, next) => {
    res.status(500).json({ status: false, message: error })
})
app.use('/images', express.static(path.join(__dirname, 'images')));

// For Static Files
app.use(express.static(`${__dirname}/public`));

//Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next()
})

// ROUTES
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRouted);
app.use('/api/v1/reviews', reviewRouted);
app.use('/api/v1/booking', bookingRoute);
// app.use('/api/v1/users', verifyAuth, getAllUsers)
app.all('*', (req, res, next) => {
    next(new AppError(`can't find ${req.originalUrl} on this server !`, 404));
})

app.use(globalErrorHandler)

module.exports = app;

