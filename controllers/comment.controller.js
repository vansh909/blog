const Blogs = require('../models/blogs.model');
const Comments = require('../models/comments.model');

//adding comment to the particular blog
exports.AddComments = async(req, res)=>{
    const user = req.user;
    const {blogId} = req.params;
    const {text} = req.body;

    try {

        const blog = await Blogs
        .findOne({_id: blogId})
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
        await commemt.save();
        return res.status(201).json({
            message: "Comment added Successfully!",
            comment: commemt})

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Internal Server Error!"});
    }
}