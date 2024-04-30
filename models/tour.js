const mongoose = require('mongoose');
const validator = require('validator');

const { Schema } = mongoose;

const tour = new Schema({
    title: {
        type: String,
        required: [true, 'A tour must have title.'],
        trim: true,
        validator: validator.isAlpha,
        unique: true
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have difficulty'],
        default: 'medium',
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy,medium,difficlut'
        }
    },
    price: {
        type: Number,
        required: [true, 'A tour must have price.']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price;
            },
            message: 'Discount price should be blow than regular price'
        }
    },
    summary: {
        type: String,
        required: [true, 'A tour must have description.'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0 ']
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    images: [String],
    imageCover: {
        type: String,
        required: true
    },
    startDates: [Date]
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)
tour.virtual('durationWeeks').get(function () {
    return this.duration / 7;
})
const Tours = mongoose.model('tours', tour);

module.exports = Tours 