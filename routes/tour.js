const express = require('express');

const router = express.Router();
const { verifyAuth, restrictTo } = require('../middleware/verify_auth')
const reviewRouter = require('./reviewRoute')
const { aliasTopTours, getAllTours, addTours, getTour, updateTour, deleteTour, getTourStats, getMonthlyPlan, getTourWithin, uploadTourImages, resizeTourImages } = require('../controllers/tour');

router
    .route('/top-5-cheap')
    .get(aliasTopTours, getAllTours)

router
    .route('/tours-stats')
    .get(getTourStats)

router
    .route('/monthly-plan/:year')
    .get(verifyAuth, restrictTo('admin', 'lead-guide', 'user'), getMonthlyPlan)

router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(getTourWithin)

router
    .route('/')
    .get(getAllTours)
    .post(verifyAuth, restrictTo('admin', 'lead-guide'), addTours)

router
    .route('/:id')
    .get(getTour)
    .patch(verifyAuth, restrictTo('admin', 'lead-guide'), uploadTourImages, resizeTourImages, updateTour)
    .delete(verifyAuth, restrictTo('admin', 'lead-guide'), deleteTour)

//review routes
router.use('/:tourId/reviews', reviewRouter);
// router
//     .route('/:tourId/reviews')
//     .post(
//         verifyAuth,
//         restrictTo('user'),
//         reviewController.createReview
//     )

module.exports = router;