const express= require('express');
const router = express.Router();
const {verifyUser} = require('../middlewares/auth.middleware')
const {AddComments} = require('../controllers/comment.controller');

router.post('/:blogId', verifyUser, AddComments);

module.exports = router;