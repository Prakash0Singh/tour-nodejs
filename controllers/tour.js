/* eslint-disable node/no-unsupported-features/es-syntax */
const Tour = require('../models/tour');
const APIFeatures = require('../util/apifeatures')


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
        res.status(400).json(
            {
                status: false,
                message: error
            }
        )
    }
};

exports.addTours = async (req, res, next) => {

    try {
        await Tour.create(req.body)
        res.status(201).json({
            status: true,
            message: 'Data added successfully.',
        })

    } catch (error) {

        res.status(400).json(
            {
                status: false,
                message: error
            }
        )

    }
}

exports.getTour = async (req, res, next) => {
    const prodId = req.params.id;
    try {
        const tour = await Tour.findById(prodId)
        res.status(200).json(
            {
                status: true,
                data: tour,
                message: 'successfully get data'
            });
    } catch (error) {
        res.status(400).json(
            {
                status: false,
                message: error
            }
        )
    }
};

exports.updateTour = async (req, res, next) => {
    const _id = req.params.id;
    try {
        const tour = await Tour.findByIdAndUpdate(_id, req.body, {
            new: true,
            runValidators: true
        })
        res.status(200).json({
            status: true,
            data: tour,
            message: 'Data updated successfully.',
        })
    }

    catch (error) {
        res.status(400).json(
            {
                status: false,
                message: error
            }
        )
    }
}

exports.deleteTour = async (req, res, next) => {
    const prodId = req.params.id;
    try {
        await Tour.findByIdAndDelete(prodId)
        res.status(204).json({
            status: true,
            message: 'Data deleted successfully.',
        })
    }
    catch (error) {
        res.status(400).json(
            {
                status: false,
                message: error
            }
        )
    }

}
