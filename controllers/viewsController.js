const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const factory = require ("../controllers/handlerFactory");
const AppError = require("../utils/appError");

exports.getOverview = catchAsync(async(req, res) => {
 //1) Get tour data from collection
  const tours = await Tour.find();
 //2) Build Template

 //3) Read that template using tour data from step1

    res.status(200).render('overview', {
    title: 'All Tours',
    tours
});
});

exports.getTour =catchAsync( async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug}).populate({
        path: 'reviews', 
        field: 'review rating user' //this are the fields we want to populate in our review path
    })
    if(!tour) {
        return next(new AppError("There is no tour with that name.", 404))
    }
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    })
});

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account'
    })
}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your Account'
    })
}

exports.updateUserData = catchAsync( async (req, res, next) => {
    console.log("UPDATE", req.body)
    const updatedUser = await User.findByIdAndUpdate(req.user.id,
        {
        name: req.body.name,
        email: req.body.email,
    },
    {
        new: true, //geting the new update dcoument of the user
        runValidators: true
    },

    );     res.status(200).render('account', {
        title: 'Your Account',
        user: updatedUser
    })
})
// exports.getSignUpForm = (req, res) => {
//     res.status(200).render('login', {
//         title: 'Log into your account'
//     })
// }