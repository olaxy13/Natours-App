const mongoose = require('mongoose');
const slugify = require('slugify');
//const User = require("./userModel")

const tourSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'a tour must have a price'],
      unique: true,
      trim: true,
      maxlength:[40, 'A tour name must have less than or equal to 40 characters'],
      minlength:[10, 'A tour name must have more than or equal to 10 characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
      },
      maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a Group size']
      },
      difficulty: {
        type: String,
        required: [true, 'A tour must have a Difficulty'],
        //enum indicating there is only one options we want
        eum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
      },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min:[1, 'Rating must be more than 1'],
      max:[5, 'Rating must be below 5'],
      //setter function to round off avg ratings
      set: value => Math.round(value * 10 ) / 10  //4.666666, 46.6666 x 10, 47/10, 4.7
    },
    ratingsQuantity: {
        type: Number,
        default: 0
      },
    price: {
      type: Number,
      required: [true, 'a tour must have a price']
    },  
      priceDiscount: {
        type: Number,
      },
      summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary']
      },
      description: {
        type: String,
        trim: true
      },
      imageCover: {
        type: String,
        required: [true, 'A tour must have a cover Image']
      },
      images: {
        type: [String]
      },
      createdAt: {
        type: Date,
        default: Date.now(),
        select: false
      },
      startDates: [Date],
      secretTour: {
        type: Boolean,
        default: false
      },
      //Geospatial document the long. and lat. deets on a map
      startLocation:{
        //GeoJSON
        type:{
          type: String,
          default: "Point",
          enum: ['Point']
        },
        coordinates: [Number], //we expect an array of numbers for the coordinates long. first nd lat second
        address: String,
        description: String
      },
      //Location EMBDEDED Document
      //array oject
      locations: [
         {
         type:{
          type: String,
          default: "Point",
          enum: ['Point']
        },
        coordinates: [Number], //we expect an array of numbers for the coordinates long. first nd lat second
        address: String,
        description: String,
        day: Number
      },
       ],
       guides: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "User"
         }
       ] ,
}, 
{
    //A virtual property: a field not storred in database to save space but calculated using some other value
    // but we want it to show up when there is an output
  //an object for the options 
  toJSON: { virtuals: true},// we want the virtuals to be part of the output
  toObject: { virtuals: true}// basically whe  the data get outputed as an object
  })
//compound index
  tourSchema.index({ price: 1, ratingsAverage: 1}) //this is an ascending order ({ proce: -1}) this is descending order
 tourSchema.index({ slug: 1})
//we need this index for geospatial data which has to be 2Dimensional sphere also called 2dsphere
// tourSchema.index({ startLocation: '2dsphere'})

   //virtual properties fields we have in our model but not in db to save space
      tourSchema.virtual('durationWeeks').get(function() {
        return this.duration / 7;
      })
      
//virtual properties for reviews because there wuld be tons of reviews and we dont want them
//to cojest our database is wh we made the reviews a virtual field too 
          tourSchema.virtual('reviews', {
            ref: 'Review', // here we made reference ti the review model
            foreignField: 'tour', //FOreigfield meaning what we named the tour obeject that has the id details in our review model which is tour that was used to make reference,
            localField: "_id" //and here in its root model the toour is recognised by its "_id" of the model normal normal
           })
          
      //DOCUMENT runs before the .saved() & .create() to db
 tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower: true })
    next(); // the this keyword rep the currently processed doc.
 })

 //EMBEDDING USER INTO TOURS
//  tourSchema.pre("save", async function(next) {
//   const guidePromises = this.guides.map(async id=> await User.findById(id)); //they all return bunch of promises hence the need for Promse.a;;
//   this.guides = await Promise.all(guidePromises) //we use Promise.all coz there arre many promises in our variable of guidePromises
//   next();
//  })


//  //post middleware functions are executed after all the pre middleware functions have completed
//  tourSchema.post('save', function(doc, next){
//     console.log(doc);
//     next()
//  })//it has access to the document that was just saved into the database
  

//QUERY MiDdlEWARe vip lane secret tour lane.. using regular rxpression so it can work for both find and findone whenever find is called
tourSchema.pre(/^find/, function(next) {
// tourSchema.pre('find', function(next) {
    this.find({ secretTour: {$ne: true}}) // the this word here is a query method
     
    this.start = Date.now()
    next()
});
//we use the regular expression here to find tour and populate the guides(user) details 
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: "guides",
    select: '-__v', 
  });
    next()
  });

tourSchema.post(/^find/, function(docs, next){
    console.log(`Query took ${Date.now() - this.start} milliseconds!`)
    next()
})

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({ $match: {secretTour: {$ne: true}}}) //to add to the top of the array
    next();

})


 
 
 const Tour = mongoose.model('Tour', tourSchema)
  module.exports = Tour;
