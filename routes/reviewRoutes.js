const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

 //middleware function//middleware function
 const router = express.Router({ mergeParams: true }); //it helps merge two rouotes together so hey can access both params in this case
 //it merged the review with tour so we can get access to the tour id stated in our params for the create review/tour route

 //POST/tour/tour_id/reviews
 //POST/reviews now they are both thesame thanks to mergeParams

//we use this to protect all the routes below
router.use(authController.protect)


router
.route('/')
.get( reviewController.getAllReviews)
.post( authController.restrictTo('user'),
 reviewController.setTourAndUserIds, 
 reviewController.createReview)

router.route('/:id')
.get(reviewController.getReview)
.patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
.delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview)



module.exports = router
 