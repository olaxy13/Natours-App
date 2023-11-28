const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Please tell us your name'],
      //unique: true,
      //trim: true,
     // maxlength:[40, 'A user name must have less than or equal to 40 characters'],
      //minlength:[10, 'A user name must have more than or equal to 10 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        //unique: true,
        lowercase: true,//it converts our email string to lower case
        validate: [validator.isEmail, 'Please provide a valid email']
      },
      photo: {
        type: String
      }, 
      role: {  
        type: String,
        enum:["user", "guide", "lead-guide", "admin"], //enum validator only allows certain type of roles to be specified
        default: "user"
      },
      password: {
        type: String,
        required: [true, 'Please provide a password'],
         minlength:[8, 'A password must have more than or equal to 8 characters'],
         select: false
      },
      passwordConfirm: {
        type: String, 
        required: [true, 'Please confirm password'],
        validate: {
            //this only works on create() & save()
            validator: function(el) {
                return el === this.password;
            },
            message: "Passwords are not thesame"
        }
      },
      passwordChangedAt: Date,
      passwordResetToken: String,
      passwordResetExpires: Date,
      active: {
        type: Boolean,
        default: true,
        select: false
      },
      createdAt: {
        type: Date,
        default: Date.now(),
        select: false
      }
        },
  );

 //run some logic to hash the password before saving to our database
  userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();
//only run this if password was actually modified then hash the password
    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;

    next();
  })

  userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now()- 1000 //deducting 11 sec from the actual time due to likely delay in sending the token
  })
  //here we made of the regex(regular expression) to apply the logic anywhere find is called
  //and what it does is that it checks to see if the user is active before bringing out the search
    userSchema.pre(/^find/, function(next){
      //this points to the current query
      this.find({ active: true })
      //this.find({ active: {$ne: false }}) //this represent all documents not equal to false 
      next()
    } )

  //BCRYPT COMPARE PASSWORD
  userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
  };

  //Once password is changed making token invalid
  userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        const changeTimestamap = parseInt(this.passwordChangedAt.getTime() / 1000, 10); //formatting the timestamp well dicided by 1000 and base 10
        console.log(this.passwordChangedAt, JWTTimestamp)
        return JWTTimestamp < changeTimestamap //if the time the JWT token was issued is less than the changeTimestamp then we changed the password after the JWT was issued so this logic is correct else return falseij
    }
    return false
  }



  userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString("hex"); 

    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex") //hasshing reset password

    console.log({resetToken}, this.passwordResetToken)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000 //conwertin the time in milli sec to 10 minutes

    return resetToken
  }


 


 
 
 const  User = mongoose.model('User', userSchema)
  module.exports = User;
