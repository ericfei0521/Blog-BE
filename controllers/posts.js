const { validationResult } = require('express-validator');
const { clearImage } = require('../util/index');
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
    if (!req.file) {
        const error = new Error('Validation failed , no image provided');
        error.statusCode = 422;
        throw error;
    }
    const { title, content } = req.body;
    const imageUrl = `http://localhost:8080/public/images/${req.file.filename}`;

    //update to db
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
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

exports.updatePost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed , entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }
    const postId = req.params.postId;
    console.log(postId);
    const { title, content } = req.body;
    let imageUrl = req.body.imageUrl;
    console.log('reqfile', req.file);
    if (req.file) {
        imageUrl = `http://localhost:8080/public/images/${req.file.filename}`;
    }
    Post.findById(postId)
        .then((post) => {
            if (!post) {
                const error = new Error('no such post');
                error.statusCode = 404;
                throw error;
            }
            if (imageUrl !== post.imageUrl) {
                const oldPath = post.imageUrl.replace('http://localhost:8080/', '');
                clearImage(oldPath);
            }
            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl;
            return post.save();
        })
        .then((result) => {
            res.status(200).json({ message: 'updateSuccess', post: result });
        })
        .catch((err) => {
            if (err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
