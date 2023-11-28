// we make use of this function to catch errors in our async codes writteen in the controllers
//the next send it to the next middleware that pases the error to the global error handler 
module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next)//this is where the major codes happen that pases the error to the next function in our error global handler
    }
}