const express = require('express');
const { createReview, getAllReview, deleteReview, updateReview, setTourUserIds } = require('../controllers/reviewController')
const { verifyAuth, restrictTo } = require('../middleware/verify_auth')

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(verifyAuth, getAllReview)
    .post(verifyAuth, restrictTo('user'), setTourUserIds, createReview)

router
    .route('/:id')
    .delete(verifyAuth, deleteReview)
    .patch(verifyAuth, updateReview)

module.exports = router;