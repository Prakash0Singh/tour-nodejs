const AppError = require('../util/appError');
const catchAsync = require('../util/catchAsyc');

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