const mongoose = require('mongoose')

const followerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    followerCount: {
        type: Number,
        required: true,
        default: 0
    },
    followingCount: {
        type: Number,
        required: true,
        default: 0
    }
}, {timestamps: true})

const followerRelation = new mongoose.Schema({
    followerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    followedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    }, 
    status: {
        type: String,
        enum: ["pending", "rejected", "accepted"],
        default: "pending"
    }, 
    requestedAt: {
        type: Date,
        default: Date.now
    },
    respondedAt: {
        type: Date
    }
}, {timestamps: true});

const Follower = mongoose.model("follower", followerSchema);
const FollowerRelation = mongoose.model("followrelation", followerRelation);

module.exports = {
    Follower, 
    FollowerRelation
}


