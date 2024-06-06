const express = require('express');
const authController = require('../controllers/auth')
const userController = require('../controllers/userController')
const protectRoute = require('../middleware/verify_auth')

const router = express.Router();

router.post('/signup', authController.uploadUserPhoto, authController.resizeUserPhoto, authController.signup);
router.post('/login', authController.login);
router.post('/forget-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch('/update-password', protectRoute.verifyAuth, authController.updatePassword);

// protect all route from here
router.use(protectRoute.verifyAuth)
router.get('/me', userController.getMe, userController.getUser)
router.post('/update-me', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);
router.delete('/delete-me', userController.getMe, userController.deleteMe);

// only admin user can access this routes
router.use(protectRoute.restrictTo('admin'))

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)


router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateMe)
    .delete(userController.deleteMe)


module.exports = router;