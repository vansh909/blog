const express = require('express');
const {activityFeed} = require('../controllers/activityfeed.controller')
const router = express.Router();
const { verifyUser} = require('../middlewares/auth.middleware')

router.get('/activity', verifyUser, activityFeed);

module.exports = router;