const Review = require('../models/reviewModal');
// const AppError = require('../util/appError');
const catchAsync = require('../util/catchAsyc');

exports.createReview = catchAsync(async (req, res, next) => {
    const newReview = await Review.create(req.body)
    res.status(201).json({
        status: true,
        message: 'review created successfully.',
        data: {
            review: newReview
        }
    })
})

exports.getAllReview = catchAsync(async (req, res, next) => {
    const reviews = await Review.find();

    res.status(200).json(
        {
            status: true,
            totalRecords: reviews.length,
            data: reviews,
            message: 'successfully get all data'
        });

});