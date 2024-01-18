const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require('./../utils/apiFeatures');

//we use it to create a fuction that would be able to delete any Model
exports.deleteOne = Model => catchAsync( async  (req, res, next)=> {
    const document = await Model.findByIdAndDelete(req.params.id)
    if(!document) {
        return next(new AppError('No document found with that ID', 404))
    }
      res.status(204).json({
          status: "Success",
          data: null
      })
    })


exports.updateOne = Model => catchAsync(async (req, res, next)=> {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true
      })
      if(!document) {
        return next(new AppError('No Document found with that ID', 404))
    }
      res.status(201).json({
          status: "Success",
          data: {
              document
          }
      })

})

exports.createOne = Model => catchAsync(async (req, res, next)=> {

    const newDocument = await Model.create(req.body)
    res.status(201).json({
        status: "Success",
        data: {
            data: newDocument
        }
    })
}) 



exports.getOne = (Model, populateOption) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if(populateOption) {
        query = query.populate(populateOption)
    }
    const document = await query
    
    if(!document) {
        return next(new AppError('No Document found with that ID', 404))
    }
    res.status(200).json({
        status: `Success`,
        data: {
            data: document
        }
    });
    
    }) 

    exports.getAll = Model => catchAsync(async (req, res, next) => {

        //to allow for nexted get reviews on tour(hack)
        let filter = {};
   
        if(req.params.tourId) {
            filter = {tour: req.params.tourId}
        }

        const features = new APIFeatures(Model.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
        //EXECUTE QUERY
        // const document = await features.query.explain()
        const document = await features.query
        res.status(200).json({
            status: `Success`,
            results: document.length,
            data: {
                data:document
            }   
        });
 
   
}) 