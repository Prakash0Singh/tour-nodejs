const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tour');
const AppError = require('../util/appError');
const catchAsyc = require('../util/catchAsyc');
const factory = require('./handlerFactory')

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    }
    else {
        cb(new AppError('Not an image! please upload only images.', 400), false);
    }
}

exports.uploadTourImages = multer({ storage: storage, fileFilter: fileFilter }).fields([{ name: 'imageCover', maxCount: 1 }, { name: 'images', maxCount: 3 }])

exports.resizeTourImages = catchAsyc(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) {
        console.log('Special case', req.files)
        return next();
    }

    // for tour cover image 
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    req.body.imageCover = `${req.params.id}-${uniqueSuffix}-image-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
        .resize({
            width: 2000,
            height: 1333,
            fit: 'fill',
            position: 'centre'
        })
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`images/tours/${req.body.imageCover}`)

    // for tour-images Array
    req.body.images = []

    await Promise.all(req.files.images.map(async (file, i) => {
        const uniquename = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const filename = `${req.params.id}-${uniquename}-tour-${i + 1}.jpeg`;

        await sharp(file.buffer)
            .resize({
                width: 2000,
                height: 1333,
                fit: 'fill',
                position: 'centre'
            })
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`images/tours/${filename}`)

        req.body.images.push(filename)
    }))
    console.log(req.body)
    next()
})

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = 'price,-ratingAverage';
    req.query.fields = 'name,price,ratingAverage,summary,difficulty';
    next();
}

exports.getAllTours = factory.getAll(Tour)

exports.getTour = factory.getOne(Tour, { path: 'reviews' })

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

exports.getTourWithin = catchAsyc(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        return next(new AppError('Please provide latitude and longitude in the format lat,lng', 400));
    }

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
        status: true,
        results: tours.length,
        data: {
            data: tours
        },
        message: 'data fetch successfully'
    })
})