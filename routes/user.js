const express = require('express');
const authController = require('../controllers/auth')
const userController = require('../controllers/userController')
const { verifyAuth } = require('../middleware/verify_auth')

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forget-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch('/update-password', verifyAuth, authController.updatePassword);
router.patch('/:id', verifyAuth, userController.updateMe)

router.post('/update-me', verifyAuth, userController.updateMe);
router.delete('/delete-me', verifyAuth, userController.deleteMe);



module.exports = router;