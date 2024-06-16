const { validationResult } = require('express-validator');
const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    Post.find().then((result) => {
        res.status(200).json({
            posts: result,
        });
    });
};
exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed , entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }
    const { title, content, image } = req.body;
    //update to db
    const post = new Post({
        title: title,
        content: content,
        imageUrl: image,
    });
    post.save()
        .then((result) => {
            res.status(201).json({
                message: 'create success',
                post: result,
            });
        })
        .catch((err) => {
            if (err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then((result) => {
            if (!result) {
                const error = new Error('Not such post');
                error.statusCode = 404;
                throw error;
            } else {
                res.status(200).json(result);
            }
        })
        .catch((err) => {
            if (err.statusCode !== 404) {
                err.statusCode = 500;
            }
            next(err);
        });
};
