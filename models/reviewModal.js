const mongoose = require('mongoose');
const validator = require('validator');

const { Schema } = mongoose;

const review = new Schema({
    review: {
        type: String,
        required: [true, 'Please provide name '],
        trim: true,
        validator: validator.isAlpha,
    },

    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    tour:
    {
        type: mongoose.Schema.ObjectId,
        ref: 'tours',
        required: [true, 'review must belong to a tour.']
    },
    user:
    {
        type: mongoose.Schema.ObjectId,
        ref: 'users',
        required: [true, 'review must belong to a user.']
    }
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

review.pre(/^find/, function (next) {
    // this.populate({
    //     path: 'tour',
    //     select: 'title',
    // }).populate({
    //     path: 'user',
    //     select: 'name photo' 
    // })
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next()
})

const Reviews = mongoose.model('reviews', review);

module.exports = Reviews 