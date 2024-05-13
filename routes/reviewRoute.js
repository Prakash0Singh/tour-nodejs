const express = require('express');
const { createReview, getAllReview } = require('../controllers/reviewController')
const { verifyAuth } = require('../middleware/verify_auth')

const router = express.Router();

router
    .route('/')
    .get(verifyAuth, getAllReview)
    .post(verifyAuth, createReview)



module.exports = router;