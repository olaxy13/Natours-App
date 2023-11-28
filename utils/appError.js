//Extends from the built in Error
class AppError extends Error {
     constructor(message, statusCode) {
        super(message) //calling Error class we extended from constructor, so we already set msg property to our incoming msg
       
        this.message = message,
        this.isOperational = true; //to know if its an Operatioal Error or programming error bugs
        this.statusCode = statusCode,
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error' ; //if the staus code starts with 4 send fail else send Error
        
    
    Error.captureStackTrace(this, this.constructor) //wen a new object is created and a constructor functio is called den dat function call would not appear in the stack or pollute it 
}
}

module.exports = AppError 