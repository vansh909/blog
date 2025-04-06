const mongoose= require('mongoose')
const {Follower, FollowerRelation} = require('../models/follower.model');
const User = require('../models/user.model');
const {redisClient} = require('../utils/redis.client')

exports.sendRequest = async(req, res) => {
    const followedId = req.params.followedId;
    const user = req.user;

    try {
        // Validate ID format
        if(!mongoose.Types.ObjectId.isValid(followedId)) {
            return res.status(400).json({message: "Invalid user ID format!"});
        }

        // Check if trying to follow self
        if(user.id === followedId) {
            return res.status(400).json({message: "Cannot follow yourself!"});
        }

        // Find both accounts
        const myAcc = await Follower.findOne({userId: user.id});
        if(!myAcc) {
            return res.status(404).json({message: "Your account details not found!"});
        }

        const account = await Follower.findOne({userId: followedId});
        if(!account) {
            return res.status(404).json({message: "User to follow not found!"});
        }

        // Check if already following
        const existingRequest = await FollowerRelation.findOne({
            followerId: user.id,
            followedId: followedId
        });

        if (existingRequest) {
            return res.status(400).json({ 
                message: existingRequest.status === 'pending' 
                    ? "Follow request already sent!" 
                    : "Already following this user!" 
            });
        }

        // Get user details
        const AccountDetails = await User.findById(followedId);
        if(!AccountDetails) {
            return res.status(404).json({message: "User not found!"});
        }

        // Create new relation based on account privacy
        if(AccountDetails.isPrivate) {
            const newRelation = new FollowerRelation({
                followedId: account.userId,
                followerId: user.id,
                status: "pending"
            });
            await newRelation.save();
            
            return res.status(200).json({
                message: `Request sent to ${AccountDetails.username}`,
                newRelation
            });
        } else {
            const newRelation = new FollowerRelation({
                followedId: account.userId,
                followerId: user.id,
                status: "accepted"
            });

            // Update follower counts
            account.followerCount++;
            myAcc.followingCount++;

            
            let activity = await redisClient.lPush(`activity:${AccountDetails._id}`,
               JSON.stringify({
                   type: 'follow',
                   by: user.id,
                   username: user.username,
                   timestamps: new Date().toISOString(),
               })
           );
           console.log("Activity pushed to Redis:", activity);
            // Save all changes in a transaction
            
                account.save(),
                myAcc.save(),
                newRelation.save()
            

            await redisClient.expire(`activity:${AccountDetails._id}`, 24 * 60 * 60);

            return res.status(200).json({
                message: `Followed ${AccountDetails.username}`,
                newRelation
            });
        }
    } catch (error) {
        console.error("Follow request error:", error);
        return res.status(500).json({
            message: "Internal Server Error!",
            error: error.message
        });
    }
};

//see all of the pending requests
exports.seeRequest = async(req,res)=>{
    const {id} = req.user;
    try {
        const pendingRequest = await FollowerRelation.find({followedId: id , status:"pending"});
        if(!req.user.isPrivate)
            return res.status(400).json({message: "No Requests of Public Account"});
        if(!pendingRequest)
            return res.status(400).json({message: "No requests pending!"});

        const userDetails = await Promise.all(
            pendingRequest.map(async (request)=>{
                const user = await User.findById(request.followerId).select(
                    "username email"
                );
                
                return { ...user.toObject(), requestID: request._id};
            })
        )
        return res.status(200).json({
            message: "Pending requests",
            requests: userDetails
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Internal Server Error!"})
    }
}

//accepting the Follow Request..
exports.acceptOrReject = async(req, res)=>{
    const {response} = req.body;
    const user = req.user;
    const followId = req.params.followId
    try {


        if (!mongoose.Types.ObjectId.isValid(followId))
            return res.status(400).json({ message: "Invalid ID format!" });

        if (!response)
            return res.status(400).json({ message: "Response field cannot be empty!" });

        
        if (typeof response != 'string')
            return res.status(400).json({ message: "Response should be a string!" });

        const alreadyResponded = await FollowerRelation.findOne({
            followedId: user._id,
            followerId: followId,
            status: 'accepted',
        });
        if (alreadyResponded)
            return res.status(400).json({ message: "Already responded!" });

        if (response === "accepted") 
            {
            const pendingRequest = await FollowerRelation.findOne({
                followerId: followId,
                followedId: user._id,
                status: "pending",
            }).populate('followerId', 'username');


            if (pendingRequest) {
                pendingRequest.status = "accepted";
                const followerDetails = pendingRequest.followerId.username;
                console.log(followerDetails);
                
                await pendingRequest.save();
                let activity = await redisClient.lPush(`activity:${user._id}`, 
                    JSON.stringify({
                    type:'follow',
                    by: pendingRequest.followerId,
                    username: followerDetails,
                    timestamps: new Date().toISOString(),
                }))
                console.log("Activity pushed to Redis:", activity);
                const followerCount= await Follower.findOne({userId: user._id});
                followerCount.followerCount++;
                followerCount.save();

                const FollowingCount = await Follower.findOne({userId: followId});
                FollowingCount.followingCount++;
                FollowingCount.save();
                await redisClient.expire(`activity:${user._id}`, 24 * 60 * 60);
                

                
                return res.status(200).json({ message: "Request accepted and counts updated!" });
            } else {
                return res.status(404).json({ message: "Pending request not found!" });
            }
            }
        else if(response =="rejected")
            {
            const pendingRequest = await FollowerRelation.findOne({
                followerId: followId,
                followedId: user._id,
                status: "pending",
            });
            if(pendingRequest){
                pendingRequest.status = "rejected";
                await pendingRequest.save();
                return res.status(200).json({message: "Request rejected successfully!"})
            }
            else{
                return res.status(404).json({ message: "Pending request not found!" });
            }
        }
        
        

    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Internal server error"})
    }
}

exports.seeMyFollowers = async(req, res)=>{
    const user = req.user;
    try {
        console.log(user._id);
        
        const followers = await FollowerRelation.find({
            followedId: user._id,
            status: "accepted"
        }).populate("followerId", "username email").lean()//avoid unnecessary details and also converts it to jso; 
        const followerDetails = followers.map(follower=>{
            return {
                username: follower.followerId.username,
                email: follower.followerId.email
            };
        })

        const followersCount = await Follower.findOne({userId:user.id});


        return res
        .status(200)
        .json({AccountDetails: followersCount,
            Followers: followerDetails
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Internal Server Error!"});
    }
}

exports.seefollowing = async(req, res)=>{
    const user = req.user;
    try {
        const following = await FollowerRelation.find({
            followerId: user._id,
            status: "accepted"
        }).populate("followedId", "username email").lean()

        const followingDetails = following.map(following=>{
            return {
                username: following.followedId.username,
                email: following.followedId.email
            };
        })

        const followingCount = await Follower.findOne({userId: user.id});

        return res
        .status(200)
        .json({AccountDetails: followingCount,
            Following: followingDetails
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Internal Server Error!"});
    }   
}

exports.getFollowingCount = async(req, res)=>{
    const user  = req.user;

    try {
        const Account = await Follower.findOne({userId: user._id});
        if(!Account) return res.status(400).json({message: "No Account Details Found!"});
        const followingCount = Account.followingCount;
        return res.status(200).json({"Total Following Count": followingCount});
    } catch (error) {
        console.log(error);
        return res.status(500).json({Error:"Internal Server Error!"})
    }
}

exports.getFollowersCount = async(req, res)=>{
    const user = req.user;
    try {
        const Account = await Follower.findOne({userId: user._id});
        if(!Account) return res.status(400).json({message: "No Account Details Found!"});
        const followerCount = Account.followerCount;
        return res.status(200).json({"Total Follower Count " : followerCount})
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Internal Server Error!"});
    }
}


