//1 get all review
const { Query } = require('mongoose');
const Tour = require('./../models/tourModel');
const Review = require('./../models/reviewModel');
const APIFeatures = require('./../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//     let filter = {};
//     if(req.params.tourId) {
//         filter = {tour: req.params.tourId}
//     }
//     const review = await Review.find(filter)
//     res.status(200).json({
//         status: 'success',
//         results: review.length,
//         data: {
//             review
//         }
//     });
// });

//catch async is a function we wrote to catch reject promises in our async codes to avoid using try catch


//we created this middle ware so you can oass in detaitls through the params and use the login userid to create review
//Allow nested routes that is if its not passed in as a body it should get it throgh the routes(params)
exports.setTourAndUserIds =  (req, res, next)=> {
    if(!req.body.tour){
    req.body.tour = req.params.tourId
}
if(!req.body.user) {
    req.body.user = req.user.id
}
next()
}

exports.getAllReviews = factory.getAll(Review)
exports.getReview = factory.getOne(Review)
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

//exports.createReview = catchAsync(async (req, res, next)=> {
    //             const newReview = await Review.create(req.body)
               
    //             res.status(201).json({
    //                 status: "Success",
    //                 data: {
    //                     review: newReview
    //                 }
    //             })
     
    // }) 
// exports.deleteTour = catchAsync( async  (req, res, next)=> {
//     const tour = await Tour.findByIdAndDelete(req.params.id)
//     if(!tour) {
//         return next(new AppError('No Tour found with that ID', 404))
//     }
//       res.status(204).json({
//           status: "Success",
//           data: null
//       })

// })
// //AGGREGATING PIPELINE AND GROUPING
// exports.getTourStats = catchAsync( async (req, res, next) => {
//     const stats = await Tour.aggregate([
//         {
//             $match: { ratingsAverage: { $gte: 4.5}} //mongoose operator to calc. average rating
//         },
//         {
//             $group: {
//                 _id: { $toUpper: '$difficulty'},
//                 numTours:{ $sum: 1}, //number pf tours
//                 numRatings: { $sum: '$ratingsQuantity'},
//                 avgRating: {$avg: '$ratingsAverage'},  //to calc the average nd the fied we're calc, from
//                 avgPrice: { $avg: '$price'},
//                 minPrice: { $min: '$price'},
//                 maxPrice: { $max: '$price'},
//             }
//         },
//         {
//             $sort: { $avgPrice: 1 }
//         },
//         // {
//         //     $match: { _id: { $ne: 'EASY'}}
//         // }
//     ]) 
//     res.status(200).json({
//         status: "Success",
//         data: {
//            stats
//         }
//     })
// })

// exports.getMonthlyPlan = catchAsync( async (req, res, next) => {
//     const year = req.params.year * 1;

//     const plan = await Tour.aggregate([
// /* it basically deconstruct as array fields from the input doc. and den ouput one doc for each
// element of the array(having one tour for each of tthe states in the array*/
//         {
//             $unwind: '$startDates' //the field of the array we wan to unwind
//         },
//          {
//             //  //used to select doc. to do a query
//             $match: {
                
//         startDates: { 
//             $gte: new Date(`${year}-01-01`),
//             $lte: new Date(`${year}-12-31`)
//         }}
//         },
//         {
//             $group: {
//                 _id: {$month: '$startDates'}, //grouping by the month using the($month) aggregated pipeline from mongoose
//                 numTourStats: { $sum: 1}, // to know how many tours
//                 tours:{ $push: '$name' }, //to know which tours by creating an array using push cause we might have multiple tours
//             }
//         },
//         {//we use dis to add fields of the id so we can remove it from the group using the $project operator below 
//             $addFields: { month: '$_id' }
//         },
//         {//(to get rid if the id value in the earlier group)
//             $project: {
//                 _id: 0 //we use zero to remove fields one to show fields
//             } 
//         },
//         {// to sort by the number of tours stats in regards to the most busy month in descending other the most busy month first
//             $sort:  { numTourStats: -1}
//         },
//         {//setting it to 12 so it can show all the 12 busiest month
//             $limit: 12
//         }
//     ]);

//     res.status(200).json({
//         status: "Success",
//         data: {
//            plan
//         }
//     })
// }
// )


//create new review