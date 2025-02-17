const {redisClient} = require('../utils/redis.client')

exports.activityFeed = async(req, res)=>{
  const user = req.user;
  

  try {
    const activities = await redisClient.lRange(`activity:${user._id}`, 0, -1);

    if(activities.length ==0)
      return res.status(200).json({message:"No Recent Activity found!"});

    const formattedActivities = activities.map((activityJSON)=>{
      const activity = JSON.parse(activityJSON);

      return {
        message: `${activity.username} ${activity.type === "comment" ? "commented: " + activity.comment
          : activity.type === "like" ? "liked your blog."
          : "started following you."}`,

          timestamp: activity.timestamp
      }

    })
    return res.status(200).json({activites: formattedActivities});

  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal Server Error!");
  }
}