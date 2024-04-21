const express = require('express');

const router = express.Router();

const { aliasTopTours, getAllTours, addTours, getTour, updateTour, deleteTour } = require('../controllers/tour');

router
    .route('/top-5-cheap')
    .get(aliasTopTours, getAllTours)

router
    .route('/')
    .get(getAllTours)
    .post(addTours)

router
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour)
module.exports = router;