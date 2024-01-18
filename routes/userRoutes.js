/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const multer = require("multer");
const userController = require('./../controllers/userController');


const authController = require('./../controllers/authController');

 //middleware function//middleware function
const router = express.Router();


router.post("/signup", authController.signup);
router.post("/login", authController.login); 
router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

//we use this middleware to protect all the route below and it works coz middleware wroks in sequence(one after he othen m)
router.use(authController.protect)

router.patch("/updateMyPassword", authController.updatePassword);


router.get("/me", userController.getMe, userController.getUser)
router.patch("/updateMe", 
userController. uploadUserPhoto, 
userController.resizeUserPhoto,
userController.updateMe);  //'photo' is the name of the field we want to upload a single picture to

//DELETE
router.delete("/deleteMe", 
userController.deleteMe);

//all the routes below have now been restricted to admin only
router.use(authController.restrictTo('admin'))

//users
router
.route('/')
.get(userController.getAllUsers)
.post(userController.createUser);

router.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser);

module.exports = router
