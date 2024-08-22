const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('errors', errors);
        const error = new Error('Validation failed , entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }
    const { email, name, password } = req.body;
    bcrypt
        .hash(password, 12)
        .then((hashPWD) => {
            const user = new User({
                name: name,
                email: email,
                password: hashPWD,
                posts: [],
            });
            return user.save();
        })
        .then((result) => {
            return res.status(201).json({
                message: 'sign up success',
                user: result,
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.login = (req, res, next) => {
    const { email, password } = req.body;
    let loadedUser;
    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                const error = new Error('email or password incorrect');
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then((isEqual) => {
            if (!isEqual) {
                const error = new Error('email or password incorrect');
                error.statusCode = 401;
                throw error;
            }
            const token = jwt.sign({ email: loadedUser.email, userId: loadedUser._id.toString() }, 'super-secret', {
                expiresIn: 60 * 60,
            });
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });
            res.status(200).json({
                token: token,
                message: 'Logged in successfully',
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
