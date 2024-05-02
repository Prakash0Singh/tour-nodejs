const express = require('express');

const router = express.Router();
const { verifyAuth, restrictTo } = require('../middleware/verify_auth')

const { aliasTopTours, getAllTours, addTours, getTour, updateTour, deleteTour, getTourStats, getMonthlyPlan } = require('../controllers/tour');

router
    .route('/top-5-cheap')
    .get(aliasTopTours, getAllTours)

router
    .route('/tours-stats')
    .get(getTourStats)

router
    .route('/monthly-plan/:year')
    .get(getMonthlyPlan)

router
    .route('/')
    .get(verifyAuth, getAllTours)
    .post(verifyAuth, addTours)

router
    .route('/:id')
    .get(getTour)
    .patch(verifyAuth, updateTour)
    .delete(verifyAuth, restrictTo('admin', 'lead-guide'), deleteTour)
module.exports = router;