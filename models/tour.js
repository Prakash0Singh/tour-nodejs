const mongoose = require('mongoose');

const { Schema } = mongoose;

const tour = new Schema({
    title: { type: String, required: [true, 'A tour must have title.'], trim: true },
    duration: { type: Number, required: [true, 'A tour must have duration'] },
    maxGroupSize: { type: Number, required: [true, 'A tour must have group size'] },
    difficulty: { type: String, required: [true, 'A tour must have difficulty'], default: 'medium' },
    price: { type: Number, required: [true, 'A tour must have price.'] },
    priceDiscount: { type: Number },
    summary: { type: String, required: [true, 'A tour must have description.'], trim: true },
    description: { type: String, trim: true },
    ratingAverage: { type: Number, default: 4.5 },
    ratingQuantity: { type: Number, default: 0 },
    images: [String],
    imageCover: { type: String, required: true },
    startDates: [Date]
},
    { timestamps: true }
)

const Tours = mongoose.model('tours', tour);

module.exports = Tours 