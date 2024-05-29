const mongoose = require('mongoose');
const { Schema } = mongoose;

const booking = new Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'tours',
        required: [true, 'Booking must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'users',
        required: [true, 'Booking must belong to a user']
    },
    price: {
        type: Number,
        required: [true, 'Booking must have a price']
    },
    paid: {
        type: Boolean,
        default: true,
    }
},
    {
        timestamps: true,
    });

booking.pre(/^find/, function (next) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    })
    next()
})

const Booking = mongoose.model('booking', booking);

module.exports = Booking 