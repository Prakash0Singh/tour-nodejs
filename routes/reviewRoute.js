const express = require('express');
const { createReview, getAllReview, deleteReview, updateReview, setTourUserIds, getReview } = require('../controllers/reviewController')
const protectRoute = require('../middleware/verify_auth')

const router = express.Router({ mergeParams: true });

router.use(protectRoute.verifyAuth)

router
    .route('/')
    .get(getAllReview)
    .post(protectRoute.restrictTo('user'), setTourUserIds, createReview)

router
    .route('/:id')
    .get(getReview)
    .patch(protectRoute.restrictTo('user', 'admin'), updateReview)
    .delete(protectRoute.restrictTo('user', 'admin'), deleteReview)

module.exports = router;