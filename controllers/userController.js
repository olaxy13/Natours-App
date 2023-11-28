const User = require('./../models/userModel');
const AppError = require("../utils/appError");
const catchAsync = require('../utils/catchAsync');
const factory = require("./handlerFactory")
//Basic JS to filter the objects fields that is to be updatedby the user to allow only allowed filds to be updated 
const filterObj = (obj, ...allowedFields) => {
    let newObj = {}
Object.keys(obj).forEach(el => {
   
    if(allowedFields.includes(el)) newObj[el] = obj[el]
})
return newObj
}
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id
    next()
}




exports.updateMe =catchAsync(async (req, res, next) => {
    //1) CReate error if user POSTS password data 
    if(req.body.password || req.body.passwordConfirm) {
        return next ( new AppError('This route is not for password updates. please use /updateMyPAssword', 400))
    } 
    //2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email')
    //3) Update User document
    const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        status: 'Success',
        data: {
            user
        }
    });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
    const deleteUser = await User.findByIdAndUpdate(req.user.id, {active: false})
    if(!deleteUser) {
        return next(new AppError('Unable to delete User', 401))
    }
    res.status(204).json({
        status: "Success",
        data:null
        
    })
})



exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined! you can use signup instead'
    });
};

//Do not update password using this
exports.getUser = factory.getOne(User)
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)
exports.getAllUsers = factory.getAll(User)
// exports.deleteUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     });
// };


// exports.updateUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     });
// };