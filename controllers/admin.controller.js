const User = require("../models/user.model");
const validator = require("validator");
const bcrypt = require('bcrypt');
const Blogs= require('../models/blogs.model')


exports.newAdmin = async(req, res) => {    
    if (!req.user.isAdmin)
        return res.status(400).json({ message: "Not have admin rights" });
    const { username, email, password, isPrivate } = req.body;
    if (!username || !email || !password || !isPrivate)
        return res.status(400).json({ error: "All Fields are mandatory" });
    if (
        typeof username != "string" ||
        typeof email != "string" ||
        typeof password != "string" ||
        typeof isPrivate != "boolean"
    )
        return res.status(400).json({ error: "Invalid credentials" });

    if (!validator.isEmail(email))
        return res.status(400).json({ error: "Email format is wrong!" });
    const existingUser = await User.findOne({ email: email });
    if(existingUser) 
        return res.status(400).json({error: "user already exists!"})

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
        username,
        email,
        password:hashedPassword,
        isAdmin: true,
        role: "admin",
        isPrivate
    })
    await user.save();
    return res.status(201).json({
        message: "Admin Created Sucessfully",
        user: user
    })
};


exports.getAllBlogs = async(req,res)=>{
    try {
        if(!req.user.isAdmin)
            return res.status(400).json({message: "Only Admin can see all the blogs!"})

        const blogs = await Blogs.find();
        if(!blogs || blogs.length ==0)
            return res.status(400).json({message: "No Blogs uploaded yet!"})
        return res
        .status(200).json({
            blogs
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Internal Server Occurred!"});
    }
}
