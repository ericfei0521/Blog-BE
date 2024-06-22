const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

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
