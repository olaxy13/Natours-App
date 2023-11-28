const { Query } = require('mongoose');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require("./handlerFactory")
//we are using this middleware to pre fill a route for the user
//if they want to get the top 5 cheap route even if they don input it in the query
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = 'price, -ratingsAverage,';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next()
}

// exports.getAllTours =catchAsync(async (req, res, next) => {
//         const features = new APIFeatures(Tour.find(), req.query)
//         .filter()
//         .sort()
//         .limitFields()
//         .paginate();
//         //EXECUTE QUERY
//         const tours = await features.query
//         res.status(200).json({
//             status: `Success`,
//             results: tours.length,
//             data: {
//                 tours
//             }   
//         });
 
   
// }) 

// exports.getTour =catchAsync(async (req, res, next) => {
//     // const tour = await Tour.findById(req.params.id).populate('reviews')
//     const tour = await Tour.findById(req.params.id).populate("reviews");
//      // });
    
//     if(!tour) {
//         return next(new AppError('No Tour found with that ID', 404))
//     }
//     res.status(200).json({
//         status: `Success`,
//         data: {
//             tour
//         }
//     });
    
//     }) 
// //catch async is a function we wrote to catch reject promises in our async codes to avoid using try catch
// exports.createTour = catchAsync(async (req, res, next)=> {

//         const newTour = await Tour.create(req.body)
//         res.status(201).json({
//             status: "Success",
//             data: {
//                 tour: newTour
//             }
//         })
// }) 
 
// exports.updateTour = catchAsync(async (req, res, next)=> {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//           new: true,
//           runValidators: true
//       })
//       if(!tour) {
//         return next(new AppError('No Tour found with that ID', 404))
//     }
//       res.status(201).json({
//           status: "Success",
//           data: {
//               tour
//           }
//       })

// }  ) 
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

//MAKING USE OF THE FACTORY DELETE WECREATED IN HANDLER FACTORY THAT CAN DELETE ANY MODEL
exports.getAllTours = factory.getAll(Tour)
exports.getTour = factory.getOne(Tour, {path: "reviews"})
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);


//AGGREGATING PIPELINE AND GROUPING
exports.getTourStats = catchAsync( async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5}} //mongoose operator to calc. average rating
        },
        {
            //here we group by thier difficulty
            $group: {
                _id: { $toUpper: '$difficulty'},
                numTours:{ $sum: 1}, //number pf tours
                numRatings: { $sum: '$ratingsQuantity'},
                avgRating: {$avg: '$ratingsAverage'},  //to calc the average nd the fied we're calc, from
                avgPrice: { $avg: '$price'},
                minPrice: { $min: '$price'},
                maxPrice: { $max: '$price'},
            }
        },
        {
            $sort: { $avgPrice: 1 }
        },
        // {
        //     $match: { _id: { $ne: 'EASY'}}
        // }
    ]) 
    res.status(200).json({
        status: "Success",
        data: {
           stats
        }
    })
})

exports.getMonthlyPlan = catchAsync( async (req, res, next) => {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
/* it basically deconstruct as array fields from the input doc. and den ouput one doc for each
element of the array(having one tour for each of tthe states in the array*/
        {
            $unwind: '$startDates' //the field of the array we wan to unwind
        },
         {
            //  //used to select doc. to do a query
            $match: {
                
        startDates: { 
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
        }}
        },
        {
            $group: {
                _id: {$month: '$startDates'}, //grouping by the month using the($month) aggregated pipeline from mongoose
                numTourStats: { $sum: 1}, // to know how many tours
                tours:{ $push: '$name' }, //to know which tours by creating an array using push cause we might have multiple tours
            }
        },
        {//we use dis to add fields of the id so we can remove it from the group using the $project operator below 
            $addFields: { month: '$_id' }
        },
        {//(to get rid if the id value in the earlier group)
            $project: {
                _id: 0 //we use zero to remove fields one to show fields
            } 
        },
        {// to sort by the number of tours stats in regards to the most busy month in descending other the most busy month first
            $sort:  { numTourStats: -1}
        },
        {//setting it to 12 so it can show all the 12 busiest month
            $limit: 12
        }
    ]);

    res.status(200).json({
        status: "Success",
        data: {
           plan
        }
    })
}
)

//"/tours-within/:distance/center/:latlng/unit/:unit"
//"/tours-within/distance/233/center/-49. 56/unit/miles
exports.getToursWithin = catchAsync(async (req,res, next) => {
const { distance, latlng, unit } = req.params;
const [lat, lng] = latlng.split(",");
//using ternary operator if unit = miles you conver by diving distance with 3963.2(earth raius miles)
//if not then we asssume its in kilometer and  distance is divided by 6378.1(earth radius kilomete)
const radius = unit === "mi" ? distance / 3963.2 : distance / 66378.1

if(!lat || !lng) {
    next(new AppError("Please provide latitude and longitude in the format lat, lng.", 400))
}

const tours = await Tour.find({ startLocation: {$geoWithin: { $centerSphere: [[lng, lat],  radius]}}})

console.log(distance, lat, lng, unit);

res.status(200).json({
    status: "SUCCESS",
    results: tours.length,
    data: {
        data: tours
    }
})
}
)


//"/tours-within/:distance/center/:latlng/unit/:unit"
//"/tours-within/distance/233/center/-49. 56/unit/miles
// "/distances/:latlng/unit/:unit"
exports.getDistance = catchAsync(async (req,res, next) => {
    const {  latlng, unit } = req.params;
    const [lat, lng] = latlng.split(",");
// we are only converting our unit distance here to either in kilometeres(0.001) or miles(0.000621371)
    const multiplier = unit === "mi" ? 0.000621371 : 0.001
    
    if(!lat || !lng) {
        next(new AppError("Please provide latitude and longitude in the format lat, lng.", 400))
    }
    
    const distances = await Tour.aggregate([
        {
            //geoNear always has to be the first stage 
            //it requires one of our field contains geospatial index
            $geoNear: {
                //near is the point from which to calc the distances
                near: {
                    type: "Point", //geoJson
                    coordinates: [lng * 1, lat * 1] //we multiply by 1 to convert to whole numbers
                },
                //field created for all calc. distances would be stored
                distanceField: "distance",
                distanceMultiplier: 0.001 //we only use this to cover distance to KM by multiplyin by 0.001 same as deviding by 1000
            }

        }, 
        {
            //Name of the field we want to keep
            $project: {
                distance: 1,
                name: 1
            }
        }
    ])
    
    res.status(200).json({
        status: "SUCCESS",
        data: {
            data: distances
        }
    })
    }
    )





















































// console.log(req.query)
//BUILD QUERY
//     // 1) FILTERING
//     const queryObj = {...req.query}; //using destructuring we'd create a new object out of it.. the 3 dots will take the fields out of the object and we create a new object
//     const excludedFields =['page', 'sort', 'limit', 'fields'];
//     excludedFields.forEach(el => delete queryObj[el])
//     // console.log(req.query, queryObj, );
//     // console.log(`check this ${excludeFields}`)

//     //ADVANCED FILTERING
//     let queryStr = JSON.stringify(queryObj)
//     //using regular expression to match any of the 4 words to query (lt=less than lte = less than or equal to) and adding the ($) opeerator to it
//    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
//     console.log("here",JSON.parse(queryStr))


//     let query = Tour.find(JSON.parse(queryStr));