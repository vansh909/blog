const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    commentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"comment",
        required: true,
    },

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
        required: true
    },
    text:{
        type: 'string',
        required: true
    }
}, {timestamps: true});

module.exports =  mongoose.model('replie', replySchema);

