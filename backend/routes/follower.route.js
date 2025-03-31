const express = require('express');
const router = express.Router();
const {sendRequest, seeRequest, acceptOrReject, seeMyFollowers, getFollowersCount, getFollowingCount, seefollowing}= require('../controllers/follower.controller')
const {verifyUser}  = require('../middlewares/auth.middleware')


router.post('/:followedId', verifyUser, sendRequest);
router.get("/requests", verifyUser, seeRequest);
router.post('/requests/:followId', verifyUser, acceptOrReject);
router.get('/followers', verifyUser, seeMyFollowers);
router.get('/following', verifyUser, seefollowing);
router.get('/followerCount',verifyUser, getFollowersCount);
router.get('/followingCount', verifyUser, getFollowingCount);

module.exports = router; 