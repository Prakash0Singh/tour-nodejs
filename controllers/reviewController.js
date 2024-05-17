const Review = require('../models/reviewModal');
// const AppError = require('../util/appError');
const catchAsync = require('../util/catchAsyc');
const factory = require('./handlerFactory')

exports.setTourUserIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next()
}

exports.getAllReview = catchAsync(async (req, res, next) => {
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }

    const reviews = await Review.find(filter);

    res.status(200).json(
        {
            status: true,
            totalRecords: reviews.length,
            data: reviews,
            message: 'successfully get all data'
        });

});

exports.createReview = factory.createOne(Review)

exports.updateReview = factory.updateOne(Review)

exports.deleteReview = factory.deleteOne(Review)