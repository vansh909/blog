const mongoose  = require('mongoose');
const { trim } = require('validator');

const blogSchema = new mongoose.Schema({

    title:{
       type: String,
       required: true 
    },

    desc :{
        type: String,
        required: true
    },

    authorId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required: true,
        index:true
    }, 

    imageUrl:{
        type: String,
        trim: true,
        default:null
    },
    
    likeCount:{
        type:Number,
        required: true,
        default: 0,
        min:0
    },
    commentCount:{
        type:Number,
        required: true,
        default: 0,
        min:0
    }

}, {timestamps: true})



module.exports = mongoose.model("blog", blogSchema);