const express = require('express');

const {login, signup, getAllusers, myProfile} = require('../controllers/user.controller')
const {verifyUser} = require('../middlewares/auth.middleware')
const router = express.Router()

router.post('/signup', signup);
router.post('/login', login);
router.get(`/users`,verifyUser, getAllusers);
router.get(`/profile`,verifyUser, myProfile);   

module.exports = router;
