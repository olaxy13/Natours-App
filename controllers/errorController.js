const AppError = require("../utils/appError");
const { CastError } = require('mongoose')

//HANDLING MONGOOOSE ERROR PRESENTABLE IN A PROODUCTION PHASE
const handleCastErrorDB = err => {
     const message =`Invalid ${err.path}: ${err.value}.`
     return new AppError(message, 400)
}

const handleDuplicateFieldDB = err => {
    //convert the keyValue object into an array, flatten it and deconstruct
//we do this because the key is not always going to be the same
     const [errorField, errorValue] = Object.entries(err.keyValue).flat();
     //object.entries({object}) returns an array of the key/value pairs
     //this means that it returns [[key,value]]
     //.flat() flattens this from an array of arrays to just an array: [key,value] we can deonstruct this to our variable
     const message = `Duplicate '${errorField}' value enteered as '${errorValue}', Please use another value!`
     return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message) //to loop over them uing the map and for each iteration we simply return the error message
    //to get the message we say the value of the object for the each errors.message
    const message = `Invald input data, ${errors.join('. ')}`;
    return new AppError(message, 400)
}

const handleJWTError = err => new AppError("Invalid token, Please log in again...!", 401);

const handleJWTExpiredError = err => new AppError("Token Expired, Please log in Again...", 401)



const sendErrorDev = (err, req, res) => {
    //A) API
    if(req.originalUrl.startsWith('/api')) {
        console.log(">>>>>>>>>>",err)
       return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
    }); 
    } 
        //B)  RENDERED WEBSITE
        console.log(">>>>>>>>>>",err)
       return res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message
        })
    };

  const sendErrorProd = (err, req, res) => {
    //1) API
    if(req.originalUrl.startsWith("/api")) {
        //A) Operational Error, trusted errors: send message to client

    //   console.log("here>>>>", err.isOperational)
      if(err.isOperational) {
       return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
         //B) PRogramming or other unknown error: don't leak details

            //1) Log Error
            console.error('ERROR', err)
            //2) SEnd generic message
           return res.status(500).json({
                status: 'ERROR',
                message: 'Something went very very wrong'
            })
        
    } 
        // 2) RENDERED WEBSITE

        //Operational Error, trusted errors: send message to client
    //   console.log("here>>>>", err.isOperational)
      if(err.isOperational) {
     //RENDERED WEBSITE
     return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message
    })
    }
        //Programming or other unknown error: don't leak details
            //1) Log Error
            console.error('ERROR', err)
            //2) SEnd generic message
           return res.status(err.statusCode).render('error', {
                title: 'Something went wrong',
                msg: 'Please try again later!'
            })
  };
  
module.exports = (err, req, res, next) => {
    let error = err
      err.statusCode = err.statusCode || 500;
      err.status = err.status || 'error';

      if(process.env.NODE_ENV === 'development') {
          sendErrorDev(err, req, res) 
         
      } else if (process.env.NODE_ENV === 'production') {
       
      
        if(err instanceof CastError) error = handleCastErrorDB(error);
       if(error.code === 11000) error  = handleDuplicateFieldDB(error)
       if(error.name === 'ValidationError') error  = handleValidationErrorDB(error)
        if(error.name === "JsonWebTokenError") error = handleJWTError(error)
        if(error.name === "TokenExpiredError") error = handleJWTExpiredError(error)


       sendErrorProd(error, req, res)
     
      }
  };
  