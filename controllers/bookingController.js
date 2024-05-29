const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tour');
const AppError = require('../util/appError');
const catchAsyc = require('../util/catchAsyc');
const factory = require('./handlerFactory')

exports.getCheckoutSession = catchAsyc(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourID);
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `http://localhost:3000/api/v1/success`,
        cancel_url: `http://localhost:3000/api/v1/cancel`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourID,
        line_items: [
            {
                price_data: {
                    currency: 'usd', // Specify the currency code
                    unit_amount: tour.price * 100, // Convert the price to the smallest currency unit (e.g., cents)
                    product_data: {
                        name: tour.title,
                        description: tour.summary,
                    },
                },
                quantity: 1,
            }
        ]
    })

    res.status(200).json({
        status: true,
        session
    })
})

exports.purchaseProduct = catchAsyc(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);
    const { token } = req.body;
    const payment = await stripe.charges.create({
        amount: tour.price,
        currency: 'inr',
        description: tour.summary,
        source: token
    })
    console.log('payment', payment)
    res.status(200).json({
        status: true,
        message: 'Payment successfull'
    })
})