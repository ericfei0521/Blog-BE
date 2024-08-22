const express = require('express');
const feedController = require('../controllers/posts');
const isAuth = require('../middleware/is-auth');
const { body } = require('express-validator');

const router = express.Router();

router.get('/', feedController.getPosts);
router.post(
    '/create-post',
    isAuth,
    [body('title').trim().isLength({ min: 5 }), body('content').trim().isLength({ min: 5 })],
    feedController.createPost
);
router.get('/post/:postId', isAuth, feedController.getPost);
router.put(
    '/post/:postId',
    isAuth,
    [body('title').trim().isLength({ min: 5 }), body('content').trim().isLength({ min: 5 })],
    feedController.updatePost
);
router.delete('/post/:postId', isAuth, feedController.deletePost);
module.exports = router;
