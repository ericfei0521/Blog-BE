const { validationResult } = require('express-validator');
const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [{ title: 'firstPost', content: 'test post', imageUrl: 'images/tree.jpg' }],
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
