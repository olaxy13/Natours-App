const User = require("./../models/userModel");
const AppError = require("../utils/appError");
const Email = require("../utils/email");
const catchAsync = require('../utils/catchAsync');
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    } )
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)
    const cookieOptions = {
        expires: new Date(
            Date.now() +  process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 *60 * 1000
        ),
       // secure: true, //cookie would only be sent on an encrypted connection basically when using https
        httpOnly: true //cookie cannnot be accessed or modified in anyway by the browser
    }

    if (process.env.NODE_ENV === 'production')  cookieOptions.secure = true

    res.cookie("jwt", token, cookieOptions)
    user.password = undefined

    res.status(statusCode).json({
       staus: "Success",
       token,
       data: {
           user
       }
    })
}


exports.signup = catchAsync(async (req, res, next) => {
 const newUser = await User.create(req.body)

 const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome()

 const payload = { id: newUser._id, name: newUser.name}

 createSendToken(newUser, 201, res)

})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return next(new AppError('Please provide email and password!', 400))
    }
    const user = await User.findOne({ email}).select("+password") 

    if(!user || !(await user.correctPassword(password, user.password))) {
return next(new AppError("Incorrect email or password", 401));
    }
    
    createSendToken(user, 200, res)
}) 

exports.logout = (req, res) => {
    res.cookie("jwt", "logout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })
    res.status(200).json({ status: 'success'})
}


exports.protect = catchAsync( async (req, res, next)  => {
//here we're are gettting the token passed ino the header to protecta route so we check if there's a token there
//and be sure the token strts with "Bearer" then if it does we split it with space then having two arrays
//the first array is our "Bearer" with index 0 and the second is our token with nidex 1 so we'd pick index 1 which is the second array
   let token; 
if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
         token = req.headers.authorization.split(" ")[1];// we re-assing this value to the token
    }
    else if(req.cookies.jwt) { 
     token = req.cookies.jwt
    }

    console.log(token)
    if(!token) {
        return next(new AppError("You are not logged in! Please log in to get Access.", 401))
    }
// 2) Verificaion token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    //3) chech if user still exists using the ID in the payload
    const currentUser = await User.findById(decoded.id);
    if(!currentUser) {
        return next(new AppError("The User belonging to this token no longer exist", 401))
    }

   // 4) Check if user changed password after the token was issued!
   if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("User recently changed password! Please log in again.", 401))
   }

   req.user = currentUser
   res.locals.user = currentUser;
     next()
}) ;

// Only for rendered ages, no errors
exports.isLoggedIn = async (req, res, next)  => {

  if(req.cookies.jwt) {
    
     try {
          // 1) Verify token
          const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
          //2) check if user still exists
            const currentUser = await User.findById(decoded.id);
            if(!currentUser) { 
                return next()
            }
         
            // 3) Check if user changed password after the token was issued!
           if (currentUser.changedPasswordAfter(decoded.iat) ) {
            return next()
           }
           //There is a logged in user
           req.user = currentUser
            res.locals.user = currentUser 
            console.log("g>>>>>>", res.locals.user)
             return next()
     } catch (err) {
        return next()
     }
        }
 
        next();
        // console.log(token)
    } ;

//(...roles) = it creates an array of all he argument that was specified
exports.restrictTo = (...roles)  => {
    return (req, res, next) => {
        //roles ["admin", "lead-guide"]. defau;t role is user
        if(!roles.includes(req.user.role)) {
            return next(
                new AppError("You do not have permission to perform this action", 403))
        }

        next();
    }
};

exports.forgotPassword = catchAsync( async (req, res, next) => {
    //1) GET User based on posted email
     const user =  await User.findOne({ email: req.body.email});
    if(!user) {
        return next(new AppError("There is no user with this email address.", 404))
    }
    //2 Generate the random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false })

    
    //3) Send it to user's email   
try {
    const resetURL =`${req.protocol}://${req.get(
        'host'
        )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
     
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email'
      });
}
   catch(err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false })
 console.log(err)
    return next(new AppError('There was an Error sending the Email, Try again later'),
    500
     )
   }
    });
    
    exports.resetPassword = catchAsync(async (req, res, next) => {
    //1) Get user based on the token
        const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

        const user = await User.findOne({ passwordResetToken: hashedToken,
             passwordResetExpires: {$gt: Date.now()} 
            }); //checking to see if token hasnt expire

    // 2) If token has not expired, and there is user, set the new password
            if(!user) { 
                return next(new AppError('Token is invalid or has expired', 400))
            }
            user.password = req.body.password;
            user.passwordConfirm = req.body.passwordConfirm;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            const savedUser = await user.save()

    //3) Update changedPasswordAt property for the user
    //4) Log the user in, sendJWT
    const token = signToken(savedUser._id);
   return res.status(200).json({
        status: 'success',
        token: token
    })
// createSendToken(user, 200, res)
});

    //  exports.updatePassword = catchAsync(async (req, res, next) => {
    //     //1) Get user from collection
    //     const user = await User.findById(req.user.id).select('+password');
    
    //     //2) check if Posted current papssword is correct
    //  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    //     return next(new AppError("Your current password is wrong", 401));
    //         }
            
    //     //3) if so, update password
    //  user.password  =  req.body.password;
    //  user.passwordConfirm = req.body.passwordConfirm;
    // await user.save();
    //  console.log("successful", savedUser)
    //     //4) Log user in, send JWT
    //     createSendToken(user, 200, res)
    //     // createSendToken(saveUser, 200, res);
    //   });
    exports.updatePassword = catchAsync(async (req, res, next) => {
        // 1) Get user from collection
        const user = await User.findById(req.user.id).select('+password');
      
        // 2) Check if POSTed current password is correct
        if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
          return next(new AppError('Your current password is wrong.', 401));
        }
      
        // 3) If so, update password
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
       await user.save();
        // User.findByIdAndUpdate will NOT work as intended!
      
        // 4) Log user in, send JWT
        createSendToken(user, 200, res);
      });