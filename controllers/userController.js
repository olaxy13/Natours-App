const multer = require ("multer")
// const Jimp = require("jimp");
const sharp = require('sharp'); //image processing library for nodejs
const User = require('./../models/userModel');
const AppError = require("../utils/appError");
const catchAsync = require('../utils/catchAsync');
const factory = require("./handlerFactory")

//const upload = multer({ dest: 'public/img/users'}) //the folder we want to save all the images that are being uploaded
//MULTER
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => { 
//         cb(mull, 'public/img/users');
//     },
//     //filename user-userId-timestamp format to avoid having thesame filename: e.g user-bd45636785r-346573862-jpeg
//     filename: (req, file, cb) =>{
//     const extension = file.mimetype.split('/')[1] //here we pick an extension for d file name which is jpeg by spliting the mimetype by '/' and picking the second 
//      cb(null, `user-${req.user.id}-${Date.now()}.${extension}`)
//     } 
// });
const multerStorage = multer.memoryStorage(); //this way the image is stored as a buffer and the buffer is available at req.file below
//this function is to test if the uploaded file is an image if 
const multerFilter = (req, file, cb)=> {
 if( file.mimetype.startsWith('image')) {
    cb(null, true)
 } else {
    cb(new AppError("Not an Image! Please upload only images.", 400), false)
 }
}

const upload = multer({ 
   storage: multerStorage,
   fileFilter: multerFilter  
}) //middleware from multer we 'd use to upload photo
// //multer middleware
exports.uploadUserPhoto = upload.single('photo');

 exports.resizeUserPhoto = catchAsync(async (req, res, next) => { 
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
//sharp is being use to adjust the images
//the image is available to us in the buffer file
    await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg") //to format to Jpeg
    .jpeg({quality: 90}) // to reduce quality
    .toFile(`public/img/users/${req.file.filename}`);//we write to a file on our disc
      next()
});

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
    console.log("FILE", req.file)
    console.log("BODY>>>>", req.body)
    //1) CReate error if user POSTS password data 
    if(req.body.password || req.body.passwordConfirm) {
        return next ( new AppError('This route is not for password updates. please use /updateMyPAssword', 400))
    } 
    //2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    //dis is basically that if we have a photo the photo sgould be name our req.file.filename in the body objectn
    if(req.file) filteredBody.photo = req.file.filename
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