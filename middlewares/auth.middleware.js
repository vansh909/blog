const jwt = require('jsonwebtoken');
const secret_key = "secretkey";
const Users = require('../models/user.model')


exports.verifyUser = async(req, res, next)=>{
    const token = req.cookies['token'];
    if(!token) return res.status(400).send("No token provided");
    let decoded = jwt.verify(token, secret_key);
    if(!decoded) return res.status(400).json({message: "Invalid token"});
    const user = await Users.findOne({email: decoded.email});
    req.user = user;
    next();
}
