const mongoose  = require('mongoose');

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
        required: true
    }, 
    
    likeCount:{
        type:Number,
        required: true,
        default: 0
    }

}, {timestamps: true})



module.exports = mongoose.model("blog", blogSchema);