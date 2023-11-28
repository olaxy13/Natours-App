/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

//Handling uncaught exception that could be from our database error
process.on("uncaughtException", err => {
  console.log('UNCAUGHT EXCEPTION!,  SHUTTING DOWN........');
  console.log(err)
  console.log(err.name, err.message)
    process.exit(1)
})

const app = require('./app');
console.log(app.get('env'))





const DB =  process.env.DATABASE.replace
('<PASSWORD>',process.env.DATABASE_PASSWORD)


mongoose
 .connect(DB, {
// .connect(process.env.DATABASE_LOCAL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then( con => {
  // console.log(con.connections)
  console.log('DB CONNECTION SUCCESFUL')
})




// console.log(process.env)

//SERVERS
const port =  process.env.PORT || 8000 
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});


//Handling unhadled rejection that could be from our database error
process.on("unhandledRejection", err => {
  console.log(err.name, err.message)
  console.log('UNHANDLED REJECTION!,  SHUTING DOWN........');
  server.close(()=> {
    process.exit(1)
  })
})
















//const sendErrorDev = (err, res) => {
//     res.status(err.statusCode).json({
//         status: err.status,
//         error: err,
//         message: err.message,
//         stack: err.stack
// });
// };

// const sendErrorProd = (err, res) => {
//     //Operational Error, trusted errors: send message to client
//     if(err.isOperational) {
//         res.status(err.statusCode).json({
//             status: err.status,
//             message: err.message
//         });
//     }
//             //PRogramming or other unknown error: don't leak details
//         else {
//             //1) Log Error
//             console.error('ERROR', err)
//             //2) SEnd generic message
//             res.status(500).json({
//                 status: 'ERROR',
//                 message: 'Something went very very wrong'
//             })
//         }
  
// };

// module.exports = (err, req, res, next) => {
    
//     err.statusCode = err.statusCode || 500;
//     err.status = err.status || 'error';

//     if(process.env.NODE_ENV === 'developoment') {
//         sendErrorDev(err, res) 
//     } else if(process.env.NODE_ENV === 'production') {
//      sendErrorProd(err, res)
//     }
// };
