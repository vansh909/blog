const mongoose = require('mongoose')

const followerSchema  = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
        unique: true,
        required: true
    },
    followerCount:{
        type: Number,
        required: true,
        default: 0
    },
    followingCount:{
        type: Number,
        required: true,
        default: 0
    }
}, {timestamps: true})


const followerRelation = new mongoose.Schema({
    followerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    followedId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    }, 
    status:{
        type: String,
        enum:["pending", "rejected", "accepted"],
        default:"pending"
    }, 
    requestedAt:{
        type: Date,
        default: Date.now // Fix: Remove () to avoid evaluation at schema definition
    },
    respondedAt:{
        type: Date,
        
    }
}, {timestamps: true});

// Remove the unique index
// followerRelation.index({ followerId: 1, followedId: 1 }, { unique: true });

const Follower = mongoose.model("follower", followerSchema);
const FollowerRelation = mongoose.model("followrelations", followerRelation); // Fix: Match collection name

module.exports = {
    Follower, 
    FollowerRelation
}


