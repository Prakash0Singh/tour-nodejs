const express = require('express');
const authController = require('../controllers/auth')

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forget-password', authController.forgotPassword);
router.patch('/reset-password/:id', authController.resetPassword);

module.exports = router;