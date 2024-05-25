const express = require('express');
const bookingController = require('../controllers/bookingController');
const protectRoute = require('../middleware/verify_auth')

const router = express.Router();

router.get('/checkout-session/:tourID',
    protectRoute.verifyAuth,
    bookingController.getCheckoutSession
)

module.exports = router;