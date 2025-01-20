const { Timestamp } = require('bson');
const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    username: {
        type: String, 
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required:true
    },
    role:{
        type: String, 
       enum: ["user", "admin"],
        default: "user"
    }, 
    isAdmin:{
        type: Boolean,
        default: false
    },
    isPrivate:{
        type:Boolean,
        default:false
    }

},{timestamps: true})

// userSchema.pre("save", async(next)=>{
//     if(this.isModified("password")) return next();
//     const salt = bcrypt.genSalt(10);
//     this.password = bcrypt.hash(this.password, salt);
//     next();
// });

module.exports = mongoose.model("user", userSchema);