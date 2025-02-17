
const User = require("../models/user.model");
const {Follower} = require('../models/follower.model')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secret_key = "secretkey";
const validator = require("validator");

exports.signup = async (req, res) => {
    const { username, email, password, isPrivate } = req.body;
    try {
        if (!email || !password || !username) {
            return res.status(400).send("All fields are mandatory!");
        }
        if (!validator.isEmail(email))
            return res.status(400).send("Email format is wrong!");
        if (
            typeof password != "string" ||
            typeof username != "string" ||
            typeof isPrivate != "boolean"
        )
            return res.status(400).send("invalid credentials format");
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("User akready exist");
        }
        const usercheck = await User.countDocuments();
        
        let role = "user";
        let isAdmin = false;
        if (usercheck == 0) {
            role = "admin";
            isAdmin = true;
        }
        let salt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role,
            isAdmin,
            isPrivate,
        });
        await user.save();
        const follower = new Follower({
            userId : user.id,
            followerCount:0,
            followingCount:0
        })
        await follower.save();
        return res.status(201).json({
            message: "User created successfully",
            user: user,
            AccountDetails: follower,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).send("enter all the fields");
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User doesn't exists");
    bcrypt.compare(password, user.password, (err, result) => {
        if(err) return console.log("Error occured")
        if (!result) return res.status(400).send("Something went wrong!");
        const token = jwt.sign({ id: user.id, email: user.email }, secret_key, {
            expiresIn: "1h",
        });
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 3600000,
        });
        
        return res.status(200).json({
            message: `${user.isAdmin ? 'admin':'user'} logged in successfully `,
            user: {
                id: user.id,
                username: user.username,
                isPrivate: user.isPrivate,
                isAdmin: user.isAdmin,
                role: user.role
            }
        })

    });
};


