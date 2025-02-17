const mongoose= require('mongoose')
const {Follower, FollowerRelation} = require('../models/follower.model');
const User = require('../models/user.model');
const {redisClient} = require('../utils/redis.client')

exports.sendRequest  = async(req, res)=>{
    const followedId = req.params.followedId;
    const user= req.user;

    try {
        if(!mongoose.Types.ObjectId.isValid(followedId))
            return res.status(400).json({message: "Invalid user ID format!"})
        const myAcc = await Follower.findOne({userId: user.id});
        const account = await Follower.findOne({userId: followedId});
        
        if(!account)
            return res.status(400).json({message:"no such user exists!"});
        const AccountDetails = await User.findById(followedId);
         // Check if a follow request already exists
         const existingRequest = await FollowerRelation.findOne({
            followerId: user.id,
            followedId: followedId
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Follow request already sent!" });
        }
        if(AccountDetails.isPrivate)
        {
            console.log(user._id);
            
            let newRelation = new FollowerRelation({
                followedId: account.userId,
                followerId: user.id,
                status: "pending"
            })
            await newRelation.save();
            return res.status(200).json({
                message: `request sent to ${AccountDetails.username}`,
                newRelation
            })
        }
        let newRelation = new FollowerRelation({
            followedId: account.userId,
            followerId: user.id,
            status: "accepted"
        })
        account.followerCount++;
        myAcc.followingCount++;
        account.save();
        myAcc.save();
        await newRelation.save();
        return res.status(200).json({
            message: `Followed ${AccountDetails.username}`,
            newRelation
        })
        
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal Server Error!"})
    }
}
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
        return res.status(400).json({
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
                await redisClient.lPush(`activity:${user._id}`, JSON.stringify({
                    type:'follow',
                    by: pendingRequest.followerId,
                    username: followerDetails
                    
                }))
                const followerCount= await Follower.findOne({userId: user._id});
                followerCount.followerCount++;
                followerCount.save();

                const FollowingCount = await Follower.findOne({userId: followId});
                FollowingCount.followingCount++;
                FollowingCount.save();
                

                
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

