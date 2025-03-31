const express = require('express');
const router = express.Router();
const { createBlogs, updateBlogs, deleteBlogs, getAllBlogs, blogLikes, seeMyBlogs } = require('../controllers/blogs.controller')
const {verifyUser} = require('../middlewares/auth.middleware');
const upload = require('../middlewares/multer')

router.post('/',upload.single('image'), verifyUser, createBlogs);
router.put('/:id', verifyUser, updateBlogs);
router.get('/', verifyUser, getAllBlogs);
// router.get('/following', verifyUser, seeFollowingBlogs);
router.delete('/:id', verifyUser, deleteBlogs)
router.post('/:id/likes', verifyUser, blogLikes);
router.get('/myblogs', verifyUser, seeMyBlogs);


module.exports = router;