const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    blogID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"blog",
        required: true
    },
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required: true
    }

}, {timestamps: true});

module.exports = mongoose.model("like", likeSchema);