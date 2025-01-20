const express = require('express');
const router = express.Router();

const {newAdmin, getAllBlogs} = require('../controllers/admin.controller')
const {verifyUser} = require('../middlewares/auth.middleware')

router.post('/', verifyUser, newAdmin);
router.get('/blogs', verifyUser, getAllBlogs);

module.exports = router;