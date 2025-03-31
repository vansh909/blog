const express = require("express");
require('dotenv'). config()
const app = express();
const port =process.env.PORT || 3000;
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}))
const user = require("./routes/user.routes");
const admin = require("./routes/admin.routes");
const blogs = require('./routes/blogs.routes');
const follow = require('./routes/follower.route')
const comments = require('./routes/comment.routes')
const activity = require('./routes/activity.route')
mongoose
    .connect("mongodb://127.0.0.1:27017/BlogPlatform")
    .then(() => {
        console.log("MongoDB is connected");
    })
    .catch((error) => {
        console.log("MongoDB Connection Error: ", error.message);
    });


    const cors = require('cors');

    app.use(cors({
      origin: 'http://localhost:3000', // Change to the frontend URL
      credentials: true, // Allow cookies to be sent
    }));
    
app.use("/", user);
app.use("/admin", admin);
app.use("/blogs", blogs);
app.use("/follow", follow);
app.use("/comments", comments);
app.use("/user", activity);

app.listen(port, (err) => {
    if (err) return console.log(err);
    console.log(`server is listening on ${port}`);
});
