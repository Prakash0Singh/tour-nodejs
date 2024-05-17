const AppError = require('../util/appError');
const catchAsync = require('../util/catchAsyc');
const APIFeatures = require('../util/apifeatures');

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id)

    if (!doc) {
        return next(new AppError('No document found with that id', 404))
    }
    res.status(204).json({
        status: true,
        message: 'Data deleted successfully.',
    })
})

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const _id = req.params.id;
    const doc = await Model.findByIdAndUpdate(_id, req.body, {
        new: true,
        runValidators: true
    })
    if (!doc) {
        return next(new AppError('No document found with that id', 404))
    }
    res.status(200).json({
        status: true,
        data: { data: doc },
        message: 'Data updated successfully.',
    })

})

exports.createOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.create(req.body)
    res.status(201).json({
        status: true,
        data: {
            data: doc
        },
        message: 'document created successfully.',
    })
})

exports.getOne = (Model, populateOpt) => catchAsync(async (req, res, next) => {

    let query = Model.findById(req.params.id);

    if (populateOpt) query = query.populate(populateOpt)

    const doc = await query

    if (!doc) {
        return next(new AppError('No document found with that ID', 404))
    }
    res.status(200).json(
        {
            status: true,
            data: {
                data: doc
            },
            message: 'successfully get document'
        });

})

exports.getAll = Model => catchAsync(async (req, res, next) => {

    // For allow nested get reviews
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }

    // const numTours = await Model.countDocuments();

    const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .fields()
        .pagination()
    const doc = await features.query
    res.status(200).json(
        {
            status: true,
            results: doc.length,
            data: {
                data: doc
            },
            message: 'successfully get all data'
        });

})