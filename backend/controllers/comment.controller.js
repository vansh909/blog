const Blogs = require('../models/blogs.model');
const Comments = require('../models/comments.model');
const Replies = require('../models/reply.model')
const {redisClient} = require('../utils/redis.client')

//adding comment to the particular blog
exports.AddComments = async(req, res)=>{
    const user = req.user;
    const {blogId} = req.params;
    const {text} = req.body;

    try {

        const blog = await Blogs
        .findOne({_id: blogId}).lean()
       
        
        if(!blog)
        {
            return res.status(400).json({message: "No Blog Found!"});
        }

        if(typeof text != 'string')
            return res.status(400).json({message: "Text should be in strings"})

        let commemt = new Comments({
            blogId: blog._id,
            authorId: user._id,
            comment: text
        })
        await redilient.lPush(`activity:${blog.authorId}`, JSON.stringify({
            type: 'comment',
            comment: text,
            by:user._id,
            username:user.username,
            blogId: blogId,
            timestamp: new Date().toISOString()
        }))
        // console.log("working");
        
        await redisClient.expire(`activity${blog.authorId}`, 24*60*60);
        await commemt.save();
        return res.status(201).json({
            message: "Comment added Successfully!",
            comment: commemt})

        
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Internal Server Error!"});
    }
}

exports.replytoComments = async(req, res)=>{
    const user = req.user;
    const {text} = req.body;
    const {commentId} = req.params;
    try {
        if(typeof text !='string')
            return res.status(400).json({message: "Text should be in string!"})
        

        const comment = await Comments.findOne({_id: commentId}).lean();
        console.log(commentId);
        
        if(!comment)
            return res.status(400).json({message:"No comments found!"})
       let newReply = new Replies({
        commentId:commentId,
        userId: user._id,
        text: text
       })

       await newReply.save();
       return res.status(201).json({message:"Replied Successfully",
        reply: newReply
       })
       
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Internal Server Error!"});
    }
}
