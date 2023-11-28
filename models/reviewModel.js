const mongoose = require('mongoose'); 
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
      type: String,
      required: [true, "Review can not be empty"],
      trim: true,
    },


    rating : {
      type: Number,
      default: 4.5,
      min:[1, 'Rating must be more than 1'],
      max:[5, 'Rating must be below 5']
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: true
      },

       tour: {
          type: mongoose.Schema.ObjectId,
          ref: "Tour",
          required: [true, "Review must belong to a tour."]
         
         } ,
       user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: [true, "Review must belong to a user."]
         }
        },
   
        {
    //A virtual property: a field not storred in database to save space but calculated using some other value
    // but we want it to show up when there is an output
    //an object for the options   
     toJSON: {virtuals: true},// we want the virtuals to be part of the output
     toObject: {virtuals: true}// basically whe  the data get outputed as an object
          }
)
//tthis is to make review unique to only one user
reviewSchema.index({ tour: 1, user: 1}, { unique: true})


//we use static method so as to call aggregate direct on the mode(Review)
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([

    {//here we only select d tour we want to update through the tourId 
      $match: { tour: tourId }
    },
    //here is where we calculate the statistics using a group stage
    //in the grup phase  we first select the first field which is the id
    {
      $group: {
        _id: '$tour', // we are groupin by tour because that's the common dield dae all have in common
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
   console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function() {
  // this points to current review,,, and constructor is basically the model who created the document
  this.constructor.calcAverageRatings(this.tour);
});
//yet to properly understand dis
//findByIdAndUpdate
//findByIdAndDelete
//using regular expression
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne(); // we can not access the model was why we used the finOne here to retrieve the current doucument(tour) from the database ands store it on the current query variable which is the (this.r)
  // by doing dat we can access it in the post middleware which we can then calculate the sats for reviews so as calc. the updated version

  console.log(this.r)
  next()
})

//we use dis to pass information from pre to post
reviewSchema.pre(/^findOneAnd/, async function() {
  await this.r.constructor.calcAverageRatings(this.r.tour) // to run dis we needed quer middleware and we dont have access to it was why we used the this.r in the pre middleware above
})



  //we use the regular expression here to find tour and populate the guides(user) details 
  reviewSchema.pre(/^find/, function(next) {
    // this.populate({
    //   path: 'tour',
    //   select: 'name'
    // }).populate({
    //   path: 'user',
    //   select: 'name photo'
    // });
  
    this.populate({
      path: 'user',
      select: 'name photo'
    });
    next();
  });
  



 
 
 const review = mongoose.model('Review', reviewSchema)
  module.exports = review;
