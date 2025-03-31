const express= require('express');
const router = express.Router();
const {verifyUser} = require('../middlewares/auth.middleware')
const {AddComments, replytoComments, getComments} = require('../controllers/comment.controller');

router.post('/:blogId', verifyUser, AddComments);
router.post('/reply/:commentId', verifyUser, replytoComments);
router.get('/:blogId', getComments);

module.exports = router;