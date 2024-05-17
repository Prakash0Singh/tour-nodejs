/* eslint-disable node/no-unsupported-features/es-syntax */
const Tour = require('../models/tour');
const APIFeatures = require('../util/apifeatures')
const AppError = require('../util/appError')
const catchAsync = require('../util/catchAsyc')
const factory = require('./handlerFactory')

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = 'price,-ratingAverage';
    req.query.fields = 'name,price,ratingAverage,summary,difficulty';
    next();
}

exports.getAllTours = async (req, res, next) => {
    try {

        const numTours = await Tour.countDocuments();

        const features = new APIFeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .fields()
            .pagination()
        const tourslist = await features.query
        res.status(200).json(
            {
                status: true,
                totalRecords: numTours,
                results: tourslist.length,
                data: tourslist,
                message: 'successfully get all data'
            });
    } catch (error) {
        const err = new Error(error);
        err.status = false;
        err.statusCode = 400;
        next(err);
    }
};

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id).populate('reviews');
    if (!tour) {
        return next(new AppError('No tour found with that ID', 404))
    }
    res.status(200).json(
        {
            status: true,
            data: tour,
            message: 'successfully get data'
        });

})

exports.addTours = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)

// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const prodId = req.params.id;
//     await Tour.findByIdAndDelete(prodId)
//     res.status(204).json({
//         status: true,
//         message: 'Data deleted successfully.',
//     })
// })

exports.deleteTour = factory.deleteOne(Tour)

exports.getTourStats = async (req, res, next) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    _id: '$difficulty',
                    numTours: { $sum: 1 },
                    numRatings: { $sum: '$ratingAverage' },
                    avgRating: { $avg: '$ratingAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                }
            },
            {
                $sort: { avgPrice: 1 }
            }
        ])

        res.status(200).json(
            {
                status: true,
                data: stats,
                message: 'successfully get stats of data'
            });
    } catch (error) {
        const err = new Error(error);
        err.status = false;
        err.statusCode = 400;
        next(err);
    }
}

exports.getMonthlyPlan = async (req, res, next) => {
    try {
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTourStarts: { $sum: 1 },
                    tours: { $push: '$title' }
                }

            },
            {
                $addFields: { month: '$_id' }
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: { numTourStarts: -1 }
            },
            {
                $limit: 12
            }
        ])

        res.status(200).json(
            {
                status: true,
                data: plan,
                message: 'successfully get monthly plan'
            });

    } catch (error) {
        const err = new Error(error);
        err.status = false;
        err.statusCode = 400;
        next(err);
    }
}