//path is a built in node module used to maipulate path names
const path = require("path")
const express = require('express');
const morgan = require('morgan');
const rateLimit = require("express-rate-limit");
const helmet = require ("helmet"); 
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean")
const hpp = require("hpp");
const cookieParser = require("cookie-parser")

const AppError = require('./utils/appError')
const  globalErrorHandler = require('./controllers/errorController')
  
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

//FeontEnd part
const viewRouter = require('./routes/viewRoutes');

const app = express();
//we set the view engine to pug
app.set("view engine", "pug");
//we use it to create a path to joining the directive name to view
app.set("views", path.join(__dirname, "views"))



//GLOBAL MIDDLEWARE
// Set security HTTP headers

//serving static files //we join the path name
app.use(express.static(path.join(__dirname,'public')));
app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            'worker-src': ['blob:'],
            'child-src': ['blob:', 'https://js.stripe.com/'],
            'img-src': ["'self'", 'data: image/webp'],
            'script-src': [
              "'self'",
              'https://api.mapbox.com',
              'https://cdnjs.cloudflare.com',
              'https://js.stripe.com/v3/',
              "'unsafe-inline'",
            ],
            'connect-src': [
              "'self'",
              'ws://localhost:*',
              'ws://127.0.0.1:*',
              'http://127.0.0.1:*',
              'http://localhost:*',
              'https://*.tiles.mapbox.com',
              'https://api.mapbox.com',
              'https://events.mapbox.com',
            ],
          },
        },
        crossOriginEmbedderPolicy: false,
      })
    ); //used the contentSecurityPolicy: false because of mapBox in the frontEnd

//Development logging
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//Limit request from same api
const limiter = rateLimit({
    max: 50, //allow maximum of 100 request
    windowMs: 60 * 60 * 1000,  //in one hour
    message: "Too many request from this IP please try again in an hour" //if request exceeds 100
})
app.use('/api', limiter) //it only works with route that starts with api


//Body parser,  reading data from the body into req.body
app.use(express.json({ limit: '10000kb '}));  //middleware=> a step btween req and res... The limit is set to 10kb so that user dosent passin too much unneccessary data that is not needed
app.use(express.urlencoded({ extended: true, limit: '10kb'})) //middleware to parse data comig from a form... "form sends data to server via urlencoded""" extended is set to true to pass in complex data
app.use(cookieParser());
//SECURITY MIDDLEWARE

//Data sanitization against NoSQL query injection i.e using commands like {$gt : "" }  to atack our server to get information
app.use(mongoSanitize()) //it loks at the request an filter out the dollar sign so the mongo operator dosen't work to avoid the query attack

//DAta sanitization against cross ss XSS
app.use(xss()); //it cleans any user input from malicious html code

//Prevent Parameter polution
app.use(hpp({
    whitelist: [
        'duration',
        "ratingsAverage",
        "ratingsQuantity",
        "maxGroupSize",
        "difficulty",
        "price" 
    ] //white list are an array of properties we allow to duplicate in our query string.
})) //http parameter pollution = hpp


//Test Middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.cookies)
  
    next()
})
//3) ROUTES

//FrontEnd Part
app.use('/', viewRouter); 

//calling the routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);



//It should be the last 
//To handle all the route that wasn't defined 
app.all('*', (req, res, next)=> {
    // res.status(404).json({
    //     status: 'Fail',
    //     message: `Can't find ${req.originalUrl} on this server`
    // })
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
})
//ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler)


module.exports = app;






// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour );
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id',updateTour);
// app.delete('/api/v1/tours/:id', deleteTour)
