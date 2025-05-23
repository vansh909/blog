const Blogs = require("../models/blogs.model");
const Likes = require("../models/likes.model");
const { FollowerRelation } = require("../models/follower.model");
const { redisClient } = require("../utils/redis.client");
// const storage = require("../middlewares/multer");
const cloudinary = require("../utils/cloudinary");

exports.createBlogs = async (req, res) => {
  const { title, desc } = req.body;
  // console.log(req.body);

  if (!title || !desc)
    return res.status(400).json({ error: "All Fields are mandatory!" });
  if (typeof title != "string" || typeof desc != "string")
    return res.status(400).json({ error: "Invalid Data!" });

  const user = req.user;
  let url = null;

  if (req.file) {
    const uploadResult = await cloudinary.uploader
      .upload(req.file.path, {})
      .catch((error) => {
        console.log(error);
      });

    url = uploadResult.secure_url;
  }

  const blog = new Blogs({
    title,
    desc,
    authorId: user._id,
    imageUrl: url,
    likeCount: 0, 
    commentCount:0
  });
  await blog.save();
  return res.status(201).json({
    message: "new blog created Successfully!",
    blog: blog,
  });
};

exports.updateBlogs = async (req, res) => {
  const { title, desc } = req.body;
  const { id } = req.params;
  const user = req.user;
  try {
    let blog = await Blogs.findById(id).lean();
    if (user.isAdmin && blog.authorId != user._id)
      return res
        .status(400)
        .json({ message: "Admins cannot update someone's blogs!" });
    if (!blog) return res.status(400).json({ error: "No Such blog found!" });
    if (blog.authorId != user._id)
      return res
        .status(400)
        .json({ error: "Not authorized to perform change!" });
    if (!title || !desc)
      return res.status(400).json({ message: "All fields are mandatory!" });
    let updatedBlog = await Blogs.findByIdAndUpdate(
      id,
      { title, desc },
      { new: true, runValidators: true } //Mongoose will ensure that the updated document's fields are valid according to the schema's validation rules
    );

    return res.status(201).json({
      message: "Blog Updated Successfully!",
      blog: updatedBlog,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

exports.deleteBlogs = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const blog = await Blogs.findById(id).lean();
    if (!blog) return res.status(400).json({ message: "No such blog found!" });

    if (blog.authorId != user._id)
      return res
        .status(401)
        .json({ message: "Not authorized to perform change!" });

    await Blogs.findByIdAndDelete(id);
    return res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};
//seing all the blogs private(of My Following) and public
exports.getAllBlogs = async (req, res) => {
  const user = req.user;
  try {
    const publicBlogs = await Blogs.find().populate(
      "authorId",
      "username isPrivate"
    );

    let filteredBlogs = [];
    for (let blog of publicBlogs) {
      if (blog.authorId.isPrivate) {
        const follower = await FollowerRelation.findOne({
          followerId: user._id,
          followedId: blog.authorId,
          status: "accepted",
        });
        if (follower) {
          filteredBlogs.push(blog);
        }
      } else {
        filteredBlogs.push(blog);
      }
    }

    return res.status(200).json(filteredBlogs);
  } catch (error) {}
};

//liking the blogs
exports.blogLikes = async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  try {
    const likes = await Likes.find({ blogID: id, userID: user._id });
    // const authorId = likes[0]?.blogID?.authorId;
    const blog = await Blogs.findOne({ _id: id });
    const authorId = blog.authorId;

    console.log(authorId);
    if (likes.length > 0) {
      await Likes.deleteOne({ blogID: id, userID: user._id });
      if(blog.likeCount == 0) return res.status(200).json({ message: "Blog Unliked Successfully!" });
      await blog.updateOne({ $inc: { likeCount: -1 } });
      return res.status(200).json({ message: "Blog Unliked Successfully!" });
    }
    const newLike = new Likes({
      blogID: id,
      userID: user._id,
    });
    if (newLike.userID == authorId) {
      await newLike.save();
      return res
        .status(200)
        .json({ message: "Blog Liked Successfully!", newLike });
    }

    await redisClient.lPush(
      `activity:${authorId}`,
      JSON.stringify({
        type: "like",
        by: user._id,
        username: user.username,
        timestamps: new Date().toISOString(),
      })
    );
    await blog.updateOne({ $inc: { likeCount: 1 } });
    await redisClient.expire(`activity:${authorId}`, 24 * 60 * 60);
    await newLike.save();
    return res
      .status(200)
      .json({ message: "Blog Liked Successfully!", newLike });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Issue" });
  }
};

// exports.seeFollowingBlogs = async (req, res) => {
//   const user = req.user;
//   try {
//     const followers = await FollowerRelation.find({
//       followerId: user._id,
//       status: "accepted",
//     });
//     let filteredBlogs = [];
//     for (let follower of followers) {
//       const blogs = await Blogs.findOne({
//         authorId: follower.followedId,
//       }).populate("authorId", "username email");
//       if (blogs) {
//         filteredBlogs.push(blogs);
//       }
//     }
//     if (filteredBlogs.length == 0)
//       return res.status(200).json({ message: "No Blogs available !" });
//     return res
//       .status(200)
//       .json({ message: "Blogs Found", blog: filteredBlogs });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: "Internal Server Error!" });
//   }
// };

exports.seeMyBlogs = async (req, res) => {
  const user = req.user;
  try {
    const blogs = await Blogs.find({ authorId: user._id }).populate(
      "authorId",
      "username email"
    );
    if (blogs.length == 0)
      return res.status(200).json({ message: "No Blogs Found!" });
    return res.status(200).json({ message: "Blogs Found", blogs });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};


