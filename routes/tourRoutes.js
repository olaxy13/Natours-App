const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require("../routes/reviewRoutes")
const router = express.Router(); //middleware function//middleware function


//this was waht we used to create review thru param from  a tour be4 iusing mergeParam middleware in reviewRoutes
// router.route('/:tourId/reviews')
// .post(authController.protect, authController.restrictTo('user'),
// reviewController.createReview)

router.use("/:tourId/reviews", reviewRouter)

// router.param('id', tourController.checkID)
router
.route('/top-5-cheap')
.get(tourController.aliasTopTours, tourController.getAllTours)
 
router
.route('/monthly-plan/:year')
.get(authController.protect, 
    authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.getMonthlyPlan)

router.route("/tours-within/:distance/center/:latlng/unit/:unit")
.get(tourController.getToursWithin)

router.route("/distances/:latlng/unit/:unit")
.get(tourController.getDistance)

router
.route('/tour-stats')
.get(tourController.getTourStats)



router 
.route('/')
.get(tourController.getAllTours)
.post(authController.protect, authController.restrictTo("admin", "lead-guide"), tourController.createTour,);

router
.route('/:id')
.get(tourController.getTour)

.patch(authController.protect, 
    authController.restrictTo("admin", "lead-guide"),
    tourController.UploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour)

.delete(authController.protect, 
    authController.restrictTo("admin", "lead-guide"),
       tourController.deleteTour);



module.exports = router
 