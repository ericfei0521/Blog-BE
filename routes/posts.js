const express = require('express');
const feedController = require('../controllers/posts');

const router = express.Router();

router.get('/', feedController.getPosts);
router.post('/create-post', feedController.createPost);

module.exports = router;
