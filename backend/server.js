const express = require("express");
const app = express();
const port = 3000;
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
app.use(cookieParser());
app.use(express.json());
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
