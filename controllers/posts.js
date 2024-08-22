const { validationResult } = require('express-validator');
const { clearImage } = require('../util/index');
const Post = require('../models/post');
const User = require('../models/user');
const user = require('../models/user');

exports.getPosts = (req, res, next) => {
    const page = req.query.page || 1;
    const perPage = 10;
    let total = 0;
    Post.find()
        .countDocuments()
        .then((count) => {
            total = count;
            return Post.find()
                .skip((page - 1) * perPage)
                .limit(perPage);
        })
        .then((result) => {
            res.status(200).json({
                posts: result,
                total: total,
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
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
        creator: req.userId,
    });
    post.save()
        .then((result) => {
            console.log('req', req.userId);
            return User.findById(req.userId);
        })
        .then((user) => {
            if (!user) {
                const error = new Error('User not found');
                error.statusCode = 404;
                throw error;
            }
            console.log('user', user);
            creator = user;
            user.posts.push(post);
            return user.save();
        })
        .then((result) => {
            res.status(201).json({
                message: 'Create success',
                post: post,
                creator: { _id: creator._id, name: creator.name },
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
            }
            const post = { ...result._doc, isAuth: false }; // Use _doc to get plain object
            if (result.creator.toString() === req.userId) {
                post.isAuth = true;
            }
            res.status(200).json(post);
        })
        .catch((err) => {
            if (!err.statusCode) {
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
    const { title, content } = req.body;
    let imageUrl = req.body.imageUrl;
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
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then((post) => {
            if (!post) {
                const error = new Error('No such post');
                error.statusCode = 404;
                throw error;
            }
            if (req.body.imageUrl !== post.imageUrl) {
                const path = post.imageUrl.replace('http://localhost:8080/', '');
                clearImage(path);
            }
            return Post.findByIdAndDelete(postId);
        })
        .then((result) => {
            console.log(req.userId);
            return User.findById(req.userId);
        })
        .then((user) => {
            user.posts.pull(postId);
            return user.save();
        })
        .then((result) => {
            return res.status(200).json({ message: 'Post deleted successfully' });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
