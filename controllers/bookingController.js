const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tour');
const AppError = require('../util/appError');
const catchAsyc = require('../util/catchAsyc');
const factory = require('./handlerFactory')

exports.getCheckoutSession = catchAsyc(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourID);
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}:${req.get('host')}/api/v1/tours`,
        cancel_url: `${req.protocol}:${req.get('host')}/api/v1/tours`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourID,
        line_items: [
            {
                name: tour.title,
                description: tour.summary,
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    })

    res.status(200).json({
        status: true,
        session
    })
})