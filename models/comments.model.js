const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "blog",
        required: true,
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
},
});
commentsSchema.index({blogId:1})

const Comments = mongoose.model("comment", commentsSchema);
module.exports = Comments;
